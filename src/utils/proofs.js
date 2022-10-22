import { ethers } from "ethers";
import { initialize } from "zokrates-js";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { preprocEndpoint, serverAddress, stateAbbreviations } from "../constants/misc";
import zokABIs from "../constants/abi/ZokABIs.json";

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
 * Convert state (e.g., "California") to a 2-byte representation of its abbreviation.
 * @returns {string}
 */
export function getStateAsHexString(state, countryCode) {
  if (!state || countryCode !== 2) return "0x";
  state = state.length === 2 ? state : stateAbbreviations[state.toUpperCase()];
  return "0x" + new TextEncoder("utf-8").encode(state).toString().replaceAll(",", "");
}

/**
 * Convert date string to 3-byte hex string with the following structure:
 * byte 1: number of years since 1900
 * bytes 2-3: number of days since beginning of the year
 * @param {string} date Must be of form yyyy-mm-dd
 */
export function getDateAsHexString(date) {
  const [year, month, day] = date.split("-");
  const yearsSince1900 = parseInt(year) - 1900;
  const daysSinceNewYear = getDaysSinceNewYear(parseInt(month), parseInt(day));

  // Convert yearsSince1900 and daysSinceNewYear to hex string
  const yearsStr = ethers.BigNumber.from([yearsSince1900])
    .toHexString()
    .replace("0x", "");
  let daysStr;
  if (daysSinceNewYear > 255) {
    daysStr = ethers.BigNumber.from("0x01").toHexString().replace("0x", "");
    daysStr += ethers.BigNumber.from(daysSinceNewYear - 256)
      .toHexString()
      .replace("0x", "");
  } else {
    daysStr = ethers.BigNumber.from(daysSinceNewYear).toHexString().replace("0x", "");
    daysStr += "00";
  }
  return "0x" + yearsStr + daysStr;
}

function getDaysSinceNewYear(month, day) {
  let daysSinceNewYear = day;
  if (month == 1) {
    return daysSinceNewYear;
  }
  if (month > 1) {
    daysSinceNewYear += 31;
  }
  if (month > 2) {
    if (isLeapYear(new Date().getYear())) {
      daysSinceNewYear += 29;
    } else {
      daysSinceNewYear += 28;
    }
  }
  if (month > 3) {
    daysSinceNewYear += 31;
  }
  if (month > 4) {
    daysSinceNewYear += 30;
  }
  if (month > 5) {
    daysSinceNewYear += 31;
  }
  if (month > 6) {
    daysSinceNewYear += 30;
  }
  if (month > 7) {
    daysSinceNewYear += 31;
  }
  if (month > 8) {
    daysSinceNewYear += 31;
  }
  if (month > 9) {
    daysSinceNewYear += 30;
  }
  if (month > 10) {
    daysSinceNewYear += 31;
  }
  if (month > 11) {
    daysSinceNewYear += 30;
  }
  return daysSinceNewYear;
}
function isLeapYear(year) {
  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

/* Gets on-chain leaves and creates Merkle proof */
export async function getMerkleProofParams(leaf) {
  const leaves = await (await fetch(`https://relayer.holonym.id/getLeaves`)).json();
  if (leaves.indexOf(leaf) == -1) {
    console.error(
      `Could not find leaf ${leaf} from querying on-chain list of leaves ${leaves}`
    );
  }

  const tree = new IncrementalMerkleTree(poseidonHashQuinary, 14, "0", 5);
  for (const item of leaves) {
    tree.insert(item);
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

/**
 * @param {string} issuer Hex string
 * @param {string} secret Hex string representing 16 bytes
 * @param {number} countryCode
 * @param {string} subdivision UTF-8
 * @param {string} completedAt Hex string representing 3 bytes
 * @param {string} birthdate Hex string representing 3 bytes
 * @returns {string}
 */
export async function createLeaf(
  issuer,
  secret,
  countryCode,
  subdivision,
  completedAt,
  birthdate
) {
  if (!zokProvider) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    console.log("waiting for zok provider");
    await sleep(5000);
  }
  const args = [
    ethers.BigNumber.from(issuer).toString(),
    ethers.BigNumber.from(secret).toString(),
    ethers.BigNumber.from(countryCode).toString(),
    ethers.BigNumber.from(subdivision).toString(),
    ethers.BigNumber.from(completedAt).toString(),
    ethers.BigNumber.from(birthdate).toString(),
  ];
  await loadArtifacts("createLeaf");
  await loadProvingKey("createLeaf");
  await loadVerifyingKey("createLeaf");

  const { witness, output } = zokProvider.computeWitness(artifacts.createLeaf, args);

  return output.replaceAll('"', "");
}

/**
 * @param {string} issuer Hex string
 * @param {number} countryCode
 * @param {string} subdivision UTF-8
 * @param {string} completedAt Hex string representing 3 bytes
 * @param {string} birthdate Hex string representing 3 bytes
 * @param {string} oldSecret Hex string representing 16 bytes
 * @param {string} newSecret Hex string representing 16 bytes
 */
export async function onAddLeafProof(
  issuer,
  countryCode,
  subdivision,
  completedAt,
  birthdate,
  oldSecret,
  newSecret
) {
  if (!zokProvider) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    await sleep(5000);
  }

  const signedLeaf = await createLeaf(
    serverAddress,
    oldSecret,
    countryCode,
    subdivision,
    completedAt,
    birthdate
  );

  const newLeaf = await createLeaf(
    serverAddress,
    newSecret,
    countryCode,
    subdivision,
    completedAt,
    birthdate
  );

  // const provingKey = new Uint8Array(await resp.json());
  const args = [
    ethers.BigNumber.from(signedLeaf).toString(),
    ethers.BigNumber.from(newLeaf).toString(),
    ethers.BigNumber.from(issuer).toString(),
    ethers.BigNumber.from(countryCode).toString(),
    ethers.BigNumber.from(subdivision).toString(),
    ethers.BigNumber.from(completedAt).toString(),
    ethers.BigNumber.from(birthdate).toString(),
    ethers.BigNumber.from(oldSecret).toString(),
    ethers.BigNumber.from(newSecret).toString(),
  ];
  // onAddLeafArtifacts = onAddLeafArtifacts ? onAddLeafArtifacts : zokProvider.compile(onAddLeafArtifacts);
  await loadArtifacts("onAddLeaf");
  await loadProvingKey("onAddLeaf");

  const { witness, output } = zokProvider.computeWitness(artifacts.onAddLeaf, args);

  // //Delete all this------
  // await loadVerifyingKey("onAddLeaf");

  // const keypair1 = {pk : provingKeys.onAddLeaf, vk : verifyingKeys.onAddLeaf}
  // const keypair2 = zokProvider.setup(artifacts.onAddLeaf.program);

  // const proof1 = zokProvider.generateProof(
  //   artifacts.onAddLeaf.program,
  //   witness,
  //   keypair1.pk
  // );

  // const proof2 = zokProvider.generateProof(
  //   artifacts.onAddLeaf.program,
  //   witness,
  //   keypair2.pk
  // );

  // console.log("keypais", keypair1, keypair2)
  // const verification1 = zokProvider.verify(keypair1.vk, proof1);
  // const verification2 = zokProvider.verify(keypair2.vk, proof2);
  // console.log({1: verification1, 2: verification2}, "verification")
  // //-----------

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

  const leaf = await createLeaf(
    serverAddress,
    secret,
    countryCode,
    subdivision,
    completedAt,
    birthdate
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

  await loadArtifacts("proofOfResidency");
  await loadProvingKey("proofOfResidency");

  const { witness, output } = zokProvider.computeWitness(
    artifacts.proofOfResidency,
    args
  );

  const proof = zokProvider.generateProof(
    artifacts.proofOfResidency.program,
    witness,
    provingKeys.proofOfResidency
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
  if (!zokProvider) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // TODO: Make this more sophisticated. Wait for zokProvider to be set or for timeout (e.g., 10s)
    await sleep(5000);
  }

  const leaf = await createLeaf(
    serverAddress,
    secret,
    countryCode,
    subdivision,
    completedAt,
    birthdate
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
