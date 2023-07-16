const sybilResistanceABI = [
  "constructor(address,address)",
  "event Uniqueness(address,uint256)",
  "function isUniqueForAction(address,uint256) view returns (bool)",
  "function masalaWasUsed(uint256) view returns (bool)",
  "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[]) view returns (bool)",
  "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[])"
];

const theABIs = {
  Hub : [
    "constructor(address)",
    "function addLeaf(address,uint8,bytes32,bytes32,tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[3])",
    "function getLeaves() view returns (uint256[])",
    "function getLeavesFrom(uint256) view returns (uint256[])",
    "function isFromIssuer(bytes,uint8,bytes32,bytes32,address) pure returns (bool)",
    "function mostRecentRoot() view returns (uint256)",
    "function mt() view returns (address)",
    "function oldLeafUsed(uint256) view returns (bool)",
    "function router() view returns (address)",
    "function verifyProof(string,tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[]) view returns (bool)"
  ],
  SybilResistance : sybilResistanceABI,
  SybilResistance2 : sybilResistanceABI,
  SybilResistanceV2: [
    "constructor(address,uint,uint,address)",
    "event Uniqueness(address,uint256)",
    "function isUniqueForAction(address,uint256) view returns (bool)",
    "function masalaWasUsed(uint256) view returns (bool)",
    "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[5]) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[5])"
  ],
  SybilResistancePhone: [
    "constructor(address,uint,uint, address)",
    "event Uniqueness(address,uint256)",
    "function isUniqueForAction(address,uint256) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[5])"
  ],
  IsUSResident : [
    "constructor(address,address)",
    "event USResidency(address,bool)",
    "function masalaWasUsed(uint256) view returns (bool)",
    "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[]) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[])",
    "function usResidency(address) view returns (bool)"
  ],
  IsUSResidentV2 : [
    "constructor(address,uint,uint,address)",
    "event USResidency(address,bool)",
    "function masalaWasUsed(uint256) view returns (bool)",
    "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[6]) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[6])",
    "function usResidency(address) view returns (bool)",
    "function isValidIssuer(uint256) public view returns (bool)",
    "function allowIssuers(uint256[]) public",
  ],
  MedicalSpecialty: [
    "constructor(address,uint,uint)",
    "event UserHasMedicalSpecialty(address,uint256)",
    "function hashbrownsWasUsed(uint256) view returns (bool)",
    "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[6]) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[6])",
    "function specialty(address) view returns (uint256)",
    "function isValidIssuer(uint256) public view returns (bool)",
    "function allowIssuers(uint256[]) public",
  ],
  Roots : [
    "function addRoot(uint256)",
    "function mostRecentRoot() view returns (uint256)",
    "function rootIsRecent(uint256) view returns (bool)",
    "function transferOwnership(address) public virtual",
  ]
};
module.exports = theABIs;