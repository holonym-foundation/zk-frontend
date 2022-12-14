import { BigNumber, ethers } from "ethers";
import { initialize } from "zokrates-js";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { preprocEndpoint, defaultChainToProveOn } from "../constants/misc";
import zokABIs from "../constants/abi/ZokABIs.json";
import assert from "assert";
import Relayer from "./relayer";

let zokProvider;
let artifacts = {};
let provingKeys = {};
let verifyingKeys = {};

const knowPreimageSrc = `import "hashes/poseidon/poseidon" as poseidon;
def main(field leaf, field address, private field countryCode, private field nameCitySubdivisionZipStreetHash, private field completedAt, private field scope, private field secret) {
    field[6] preimage = [address, secret, countryCode, nameCitySubdivisionZipStreetHash, completedAt, scope];
    assert(poseidon(preimage) == leaf);
    return;
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadArtifacts(circuitName) {
  if (circuitName in artifacts) {
    console.log(
      `Note: Trying to load ${circuitName} artifacts, which have already been loaded. Not reloading`
    );
    return;
  }
  const program = await (
    await fetch(`${preprocEndpoint}/${circuitName}Program`)
  ).arrayBuffer();
  const abi = zokABIs[circuitName];

  artifacts[circuitName] = {
    program: new Uint8Array(program),
    abi: abi,
  };
}

async function loadProvingKey(circuitName) {
  if (circuitName in provingKeys) {
    console.log(
      `Note: Trying to load ${circuitName} provingKey, which has already been loaded. Not reloading`
    );
    return;
  }
  const k = await (
    await fetch(`${preprocEndpoint}/${circuitName}.proving.key`)
  ).arrayBuffer();
  provingKeys[circuitName] = [...new Uint8Array(k)];
}

async function loadVerifyingKey(circuitName) {
  if (circuitName in verifyingKeys) {
    console.log(
      `Note: Trying to load ${circuitName} verifyingKey, which has already been loaded. Not reloading`
    );
    return;
  }
  const k = await (
    await fetch(`${preprocEndpoint}/${circuitName}.verifying.key`)
  ).json();
  verifyingKeys[circuitName] = k;
}

loadArtifacts("poseidonQuinary").then(() =>
  console.log("Poseidon hash for five inputs loaded")
);
loadArtifacts("poseidonTwoInputs").then(() =>
  console.log("Poseidon hash for two inputs loaded")
);
initialize().then(async (zokratesProvider) => {
  zokProvider = zokratesProvider;
});

/**
 * Convert date string to unix timestamp
 * @param {string} date Must be of form yyyy-mm-dd
 */
 export function getDateAsInt(date) {
  // Format input
  const [year, month, day] = date.split("-");
  assert.ok((year >= 1900) && (year < 2099)); // Make sure date is in a reasonable range, otherwise it's likely the input was malformatted and it's best to be safe by stopping -- we can always allow more edge cases if needed later 
  return (new Date(date)).getTime() / 1000 + 2208988800 // 2208988800000 is 70 year offset; Unix timestamps below 1970 are negative and we want to allow from approximately 1900. 
}

/* Gets Merkle tree and creates Merkle proof */
export async function getMerkleProofParams(leaf) {
  const treeData = await Relayer.getTree(defaultChainToProveOn);
  console.log(treeData, "treeData")
  const tree = new IncrementalMerkleTree(poseidonHashQuinary, 14, "0", 5);
  // NOTE: _nodes and _zeroes are private readonly variables in the `incremental-merkle-tree.d` file,
  // but the JavaScript implementation doesn't seem to enforce these constraints.
  tree._root = treeData._root;
  tree._nodes = treeData._nodes;
  tree._zeroes = treeData._zeroes;

  const leaves = tree._nodes[0];
  if (leaves.indexOf(leaf) === -1) {
    console.error(
      `Could not find leaf ${leaf} from querying on-chain list of leaves ${leaves}`
    );
  }

  const index = tree.indexOf(leaf);
  const merkleProof = tree.createProof(index);
  const [root_, leaf_, path_, indices_] = serializeProof(
    merkleProof,
    poseidonHashQuinary
  );

  return {
    root: root_,
    leaf: leaf_,
    path: path_,
    indices: indices_,
  };
}

/**
 * (Forked from holo-merkle-utils)
 * Serializes createProof outputs to ZoKrates format
 */
export function serializeProof(proof, hash) {
  // Insert the digest of the leaf at every level:
  let digest = proof.leaf;
  for (let i = 0; i < proof.siblings.length; i++) {
    proof.siblings[i].splice(proof.pathIndices[i], 0, digest);
    digest = hash(proof.siblings[i]);
  }

  // serialize
  const argify = (x) => ethers.BigNumber.from(x).toString();
  const args = [
    argify(proof.root),
    argify(proof.leaf),
    proof.siblings.map((x) => x.map((y) => argify(y))),
    proof.pathIndices.map((x) => argify(x)),
  ];
  return args;
}

/**
 * @param {Array<string>} input length-2 Array of numbers represented as strings.
 * @returns {string}
 */
export function poseidonTwoInputs(input) {
  if (input.length !== 2 || !Array.isArray(input)) {
    throw new Error("input must be an array of length 2");
  }
  if (!zokProvider) {
    throw new Error("zokProvider has not been initialized");
  }
  if (!("poseidonTwoInputs" in artifacts)) {
    throw new Error("Poseidon hash for two inputs has not been loaded");
  }

  const { witness, output } = zokProvider.computeWitness(
    artifacts.poseidonTwoInputs,
    input
  );
  return output.replaceAll('"', "");
}

/**
 * @param {Array<string>} input length-5 Array of numbers represented as strings.
 * @returns {string}
 */
export function poseidonHashQuinary(input) {
  if (input.length !== 5 || !Array.isArray(input)) {
    throw new Error("input must be an array of length 5");
  }
  if (!zokProvider) {
    throw new Error("zokProvider has not been initialized");
  }
  if (!("poseidonQuinary" in artifacts)) {
    throw new Error("Poseidon hash has not been loaded");
  }

  let { witness, output } = zokProvider.computeWitness(
    artifacts.poseidonQuinary,
    input
  );
  return output.replaceAll('"', "");
}

/** Computes a poseidon hash of the input array
 * @param {Array<string>} serializedCreds All other values in the leaf's preimage, as an array of strings
 */
export async function createLeaf(serializedCreds) {
  await loadArtifacts("createLeaf");
  await loadProvingKey("createLeaf");
  const { witness, output } = zokProvider.computeWitness(artifacts.createLeaf, serializedCreds);
  return output.replaceAll('"', "");
}

/**
 * @param {string} issuer Represents the issuer, at position 0 in the leaf's preimage
 * @param {Array<string>} customFields All other values in the leaf's preimage, as an array of strings
 * @param {string} oldSecret Represents the 16-byte secret, at position 5 in the old leaf's preimage. This is known by the user and issuer
 * @param {string} newSecret Represents the 16-byte secret, at position 5 in the new leaf's preimage. This is known by the user (and not issuer)
 */
export async function onAddLeafProof(serializedCreds, newSecret) {
  if (!zokProvider) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    await sleep(5000);
  }

  const signedPreimage = serializedCreds;
  // Replace the server-created secret with a secret only the user knows
  const newPreimage = [serializedCreds[0], newSecret, ...serializedCreds.slice(2,6)];
  const signedLeaf = await createLeaf(signedPreimage);
  console.log("signed leaf", signedLeaf, signedPreimage);
  const newLeaf = await createLeaf(newPreimage);
  // When ordering the inputs to the circuit, i didn't think about how annoying this step will be if the orders are different! For now, much easier to keep it this way:
  const reorderedSerializedCreds = [serializedCreds[0], serializedCreds[2], serializedCreds[3], serializedCreds[4], serializedCreds[5], serializedCreds[1]];
  const args = [
    ethers.BigNumber.from(signedLeaf).toString(),
    ethers.BigNumber.from(newLeaf).toString(),
    ...reorderedSerializedCreds,
    ethers.BigNumber.from(newSecret).toString(),
  ];
  // onAddLeafArtifacts = onAddLeafArtifacts ? onAddLeafArtifacts : zokProvider.compile(onAddLeafArtifacts);
  await loadArtifacts("onAddLeaf");
  await loadProvingKey("onAddLeaf");

  const { witness, output } = zokProvider.computeWitness(artifacts.onAddLeaf, args);

  const proof = zokProvider.generateProof(
    artifacts.onAddLeaf.program,
    witness,
    provingKeys.onAddLeaf
  );
  return proof;
}

/**
 * @param {string} issuer Hex string
 * @param {string} secret Hex string representing 16 bytes
 * @param {string} salt Hex string representing 16 bytes
 * @param {string} footprint Hex string representing 16 bytes
 * @param {number} countryCode
 * @param {string} subdivision UTF-8
 * @param {string} completedAt Hex string representing 3 bytes
 * @param {string} scope Hex string representing 3 bytes
 * @param {Array<Array<string>>} path Numbers represented as strings
 * @param {Array<string>} indices Numbers represented as strings
 */
export async function proofOfResidency(
  sender,
  issuer,
  salt,
  footprint,
  countryCode,
  subdivision,
  completedAt,
  scope,
  secret
) {
  if (!zokProvider) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    await sleep(5000);
  }
  console.log("PROOF starting");
  const leaf = await createLeaf(
    [
      issuer,
      secret,
      countryCode,
      subdivision,
      completedAt,
      scope
    ]
  );

  console.log("PROOF leaf created");

  const mp = await getMerkleProofParams(leaf);
  console.log("PROOF Merkle params done");

  const args = [
    mp.root,
    ethers.BigNumber.from(sender).toString(),
    ethers.BigNumber.from(issuer).toString(),
    salt,
    footprint,
    ethers.BigNumber.from(countryCode).toString(),
    ethers.BigNumber.from(subdivision).toString(), //ethers.BigNumber.from(new TextEncoder("utf-8").encode(subdivision)).toString(),
    ethers.BigNumber.from(completedAt).toString(),
    ethers.BigNumber.from(scope).toString(),
    ethers.BigNumber.from(secret).toString(),
    leaf,
    mp.path,
    mp.indices,
  ];
    
  console.log("PROOF loading artifacts");
  await loadArtifacts("proofOfResidency");
  await loadProvingKey("proofOfResidency");
  console.log("PROOF loaded artifacts");

  console.log("PROOF computing witness");
  const { witness, output } = zokProvider.computeWitness(
    artifacts.proofOfResidency,
    args
  );
  console.log("PROOF computed witness");

  console.log("PROOF generating proof");
  const proof = zokProvider.generateProof(
    artifacts.proofOfResidency.program,
    witness,
    provingKeys.proofOfResidency
  );
  console.log("PROOF generated proof");
  return proof;
}

/**
 * @param {string} issuer Hex string
 * @param {string} secret Hex string representing 16 bytes
 * @param {string} salt Hex string representing 16 bytes
 * @param {string} footprint Hex string representing 16 bytes
 * @param {number} countryCode
 * @param {string} subdivision UTF-8
 * @param {string} completedAt Hex string representing 3 bytes
 * @param {string} scope Hex string representing 3 bytes
 * @param {Array<Array<string>>} path Numbers represented as strings
 * @param {Array<string>} indices Numbers represented as strings
 */
export async function antiSybil(
  sender,
  issuer,
  salt,
  footprint,
  countryCode,
  subdivision,
  completedAt,
  scope,
  secret
) {
  console.log("antiSybil called")
  if (!zokProvider) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    await sleep(5000);
  }

  const leaf = await createLeaf(
    [
      issuer,
      secret,
      countryCode,
      subdivision,
      completedAt,
      scope
    ]
  );

  const mp = await getMerkleProofParams(leaf);

  const args = [
    mp.root,
    ethers.BigNumber.from(sender).toString(),
    ethers.BigNumber.from(issuer).toString(),
    salt,
    footprint,
    ethers.BigNumber.from(countryCode).toString(),
    ethers.BigNumber.from(subdivision).toString(), //ethers.BigNumber.from(new TextEncoder("utf-8").encode(subdivision)).toString(),
    ethers.BigNumber.from(completedAt).toString(),
    ethers.BigNumber.from(scope).toString(),
    ethers.BigNumber.from(secret).toString(),
    leaf,
    mp.path,
    mp.indices,
  ];
  

  await loadArtifacts("antiSybil");
  await loadProvingKey("antiSybil");

  const { witness, output } = zokProvider.computeWitness(artifacts.antiSybil, args);

  const proof = zokProvider.generateProof(
    artifacts.antiSybil.program,
    witness,
    provingKeys.antiSybil
  );
  return proof;
}

export async function proveKnowledgeOfLeafPreimage(serializedCreds, newSecret) {
  console.log("proveKnowledgeOfLeafPreimage called")
  if (!zokProvider) {
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    await sleep(5000);
  }
  const leafArgs = [
    serializedCreds[0], // issuer
    newSecret,
    serializedCreds[2], // countryCode
    serializedCreds[3], // nameCitySubdivisionZipStreetHash
    serializedCreds[4], // completedAt
    serializedCreds[5], // scope
  ].map((x) => ethers.BigNumber.from(x).toString())
  const leaf = ethers.BigNumber.from(await createLeaf(leafArgs)).toString();
  const knowPreimageArtifacts = zokProvider.compile(knowPreimageSrc);
  const proofArgs = [
    leaf,
    serializedCreds[0], // issuer
    serializedCreds[2], // countryCode
    serializedCreds[3], // nameCitySubdivisionZipStreetHash
    serializedCreds[4], // completedAt
    serializedCreds[5], // scope
    newSecret,
  ]
  const { witness, output } = zokProvider.computeWitness(knowPreimageArtifacts, proofArgs);
  const provingKeyFile = await fetch(`${preprocEndpoint}/knowPreimage.proving.key`);
  const provingKeyBuffer = await provingKeyFile.arrayBuffer();
  const provingKey = new Uint8Array(provingKeyBuffer);
  const proof = zokProvider.generateProof(knowPreimageArtifacts.program, witness, provingKey);
  console.log('proveKnowledgeOfLeafPreimage proof', proof);
  return proof;
}
