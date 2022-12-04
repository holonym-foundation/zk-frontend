import { BigNumber, ethers } from "ethers";
import { initialize } from "zokrates-js";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { preprocEndpoint } from "../constants/misc";
import zokABIs from "../constants/abi/ZokABIs.json";
import assert from "assert";

let zokProvider;
let artifacts = {};
let provingKeys = {};
let verifyingKeys = {};

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
  const treeData = await (await fetch('https://relayer.holonym.id/getTree')).json();
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
 * @param {string} birthdate Hex string representing 3 bytes
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
  birthdate,
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
      birthdate
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
    ethers.BigNumber.from(birthdate).toString(),
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
 * @param {string} birthdate Hex string representing 3 bytes
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
  birthdate,
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
      birthdate
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
    ethers.BigNumber.from(birthdate).toString(),
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

/**
 * ---------------------------------------------------------------------------------
 * BEGIN test functions
 * ---------------------------------------------------------------------------------
 */

// async function testCreateLeaf() {
//   const issuer = "0x0000000000000000000000000000000000000000";
//   const secret = "0x00000000000000000000000000000000";
//   const countryCode = 2;
//   const subdivision = "NY";
//   const completedAt = "0x123456";
//   const birthdate = "0x123456";
//   const leaf = await createLeaf(
//     issuer,
//     secret,
//     countryCode,
//     subdivision,
//     completedAt,
//     birthdate
//   );
//   console.log("leaf...");
//   console.log(leaf);
// }

// async function testPoseidonHashQuinary() {
//   const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
//   await sleep(3000);
//   const input = ["0", "0", "0", "0", "0"];
//   const hash = poseidonHashQuinary(input);
//   console.log(hash);
// }

// async function testPoseidonHashQuinaryWithMerkleTree() {
//   console.log("testPoseidonHashQuinaryWithMerkleTree");
//   const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
//   await sleep(5000);
//   const leavesFromContract = []; // TODO: Get leaves from merkle tree smart contract
//   const leaves = [...leavesFromContract, "1"];
//   const tree = new IncrementalMerkleTree(poseidonHashQuinary, 14, "0", 5);
//   for (const leaf of leaves) {
//     tree.insert(leaf);
//   }
//   const index = tree.indexOf("1");
//   const merkleProof = tree.createProof(index);
//   console.log("merkleProof...");
//   console.log(merkleProof);
//   const serializedMerkleProof = serializeProof(merkleProof, poseidonHashQuinary);
//   console.log("serializedMerkleProof");
//   console.log(serializedMerkleProof);
// }

// async function testOnAddLeafProof() {
//   const issuer = "0x0000000000000000000000000000000000000000";
//   const countryCode = 2;
//   const subdivision = "NY";
//   const completedAt = "0x123456";
//   const birthdate = "0x123456";

//   // get signedLeaf
//   const oldSecret = "0x00000000000000000000000000000000";
//   const signedLeaf = await createLeaf(
//     issuer,
//     oldSecret,
//     countryCode,
//     subdivision,
//     completedAt,
//     birthdate
//   );
//   // get newLeaf
//   const newSecret = "0x10000000000000000000000000000000";
//   const newLeaf = await createLeaf(
//     issuer,
//     newSecret,
//     countryCode,
//     subdivision,
//     completedAt,
//     birthdate
//   );

//   console.log("generating proof...");
//   const proof = await onAddLeafProof(
//     signedLeaf,
//     newLeaf,
//     issuer,
//     countryCode,
//     subdivision,
//     completedAt,
//     birthdate,
//     oldSecret,
//     newSecret
//   );
//   console.log("proof...");
//   console.log(proof);
//   return proof;
// }

// async function testproofOfResidency() {
//   console.log("testproofOfResidency");
//   const issuer = "0x0000000000000000000000000000000000000000";
//   const countryCode = 2;
//   const subdivision = "NY";
//   const completedAt = "0x123456";
//   const birthdate = "0x123456";

//   const secret = "0x00000000000000000000000000000000";
//   const leaf = await createLeaf(
//     issuer,
//     secret,
//     countryCode,
//     subdivision,
//     completedAt,
//     birthdate
//   );

//   const leavesFromContract = []; // TODO: Get leaves from merkle tree smart contract
//   const leaves = [...leavesFromContract, leaf];
//   const tree = new IncrementalMerkleTree(poseidonHashQuinary, 14, "0", 5);
//   for (const item of leaves) {
//     tree.insert(item);
//   }
//   const index = tree.indexOf(leaf);
//   const merkleProof = tree.createProof(index);
//   const serializedMerkleProof = serializeProof(merkleProof, poseidonHashQuinary);

//   console.log("generating proofOfResidency...");
//   const proof = await proofOfResidency(
//     issuer,
//     countryCode,
//     subdivision,
//     completedAt,
//     birthdate,
//     secret,
//     // root,
//     serializedMerkleProof[0],
//     // leaf,
//     serializedMerkleProof[1],
//     // path,
//     serializedMerkleProof[2],
//     // indices
//     serializedMerkleProof[3]
//   );
//   console.log("proofOfResidency...");
//   console.log(proof);
//   return proof;
// }
