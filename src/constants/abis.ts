const sybilResistanceABI = [
  "constructor(address,address)",
  "event Uniqueness(address,uint256)",
  "function isUniqueForAction(address,uint256) view returns (bool)",
  "function masalaWasUsed(uint256) view returns (bool)",
  "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[]) view returns (bool)",
  "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[])",
];

const sybilResistanceJSONABI = [
  {
    "type": "constructor",
    "payable": false,
    "inputs": [
      {
        "type": "address"
      },
      {
        "type": "address"
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "Uniqueness",
    "inputs": [
      {
        "type": "address"
      },
      {
        "type": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "isUniqueForAction",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address"
      },
      {
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "name": "masalaWasUsed",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "name": "proofIsValid",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "tuple",
        "components": [
          {
            "type": "tuple",
            "components": [
              {
                "type": "uint256"
              },
              {
                "type": "uint256"
              }
            ]
          },
          {
            "type": "tuple",
            "components": [
              {
                "type": "uint256[2]"
              },
              {
                "type": "uint256[2]"
              }
            ]
          },
          {
            "type": "tuple",
            "components": [
              {
                "type": "uint256"
              },
              {
                "type": "uint256"
              }
            ]
          }
        ]
      },
      {
        "type": "uint256[]"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "name": "prove",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "tuple",
        "components": [
          {
            "type": "tuple",
            "components": [
              {
                "type": "uint256"
              },
              {
                "type": "uint256"
              }
            ]
          },
          {
            "type": "tuple",
            "components": [
              {
                "type": "uint256[2]"
              },
              {
                "type": "uint256[2]"
              }
            ]
          },
          {
            "type": "tuple",
            "components": [
              {
                "type": "uint256"
              },
              {
                "type": "uint256"
              }
            ]
          }
        ]
      },
      {
        "type": "uint256[]"
      }
    ],
    "outputs": []
  }
]

const theABIs = {
  Hub: [
    "constructor(address)",
    "function addLeaf(address,uint8,bytes32,bytes32,tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[3])",
    "function getLeaves() view returns (uint256[])",
    "function getLeavesFrom(uint256) view returns (uint256[])",
    "function isFromIssuer(bytes,uint8,bytes32,bytes32,address) pure returns (bool)",
    "function mostRecentRoot() view returns (uint256)",
    "function mt() view returns (address)",
    "function oldLeafUsed(uint256) view returns (bool)",
    "function router() view returns (address)",
    "function verifyProof(string,tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[]) view returns (bool)",
  ],
  SybilResistance: sybilResistanceABI,
  SybilResistance2: sybilResistanceABI,
  SybilResistanceV2: [
    "constructor(address,uint,uint,address)",
    "event Uniqueness(address,uint256)",
    "function isUniqueForAction(address,uint256) view returns (bool)",
    "function masalaWasUsed(uint256) view returns (bool)",
    "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[5]) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[5]) payable",
  ],
  SybilResistancePhone: [
    "constructor(address,uint,uint, address)",
    "event Uniqueness(address,uint256)",
    "function isUniqueForAction(address,uint256) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[5]) payable",
  ],
  IsUSResident: [
    "constructor(address,address)",
    "event USResidency(address,bool)",
    "function masalaWasUsed(uint256) view returns (bool)",
    "function proofIsValid(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[]) view returns (bool)",
    "function prove(tuple(tuple(uint256,uint256),tuple(uint256[2],uint256[2]),tuple(uint256,uint256)),uint256[])",
    "function usResidency(address) view returns (bool)",
  ],
  IsUSResidentV2: [
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
  Roots: [
    "function addRoot(uint256)",
    "function mostRecentRoot() view returns (uint256)",
    "function rootIsRecent(uint256) view returns (bool)",
    "function transferOwnership(address) public virtual",
  ],
};

const jsonABIs = {
  Hub: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "function",
      "name": "addLeaf",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint8"
        },
        {
          "type": "bytes32"
        },
        {
          "type": "bytes32"
        },
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[3]"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "getLeaves",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "uint256[]"
        }
      ]
    },
    {
      "type": "function",
      "name": "getLeavesFrom",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "uint256[]"
        }
      ]
    },
    {
      "type": "function",
      "name": "isFromIssuer",
      "constant": true,
      "stateMutability": "pure",
      "payable": false,
      "inputs": [
        {
          "type": "bytes"
        },
        {
          "type": "uint8"
        },
        {
          "type": "bytes32"
        },
        {
          "type": "bytes32"
        },
        {
          "type": "address"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "mostRecentRoot",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "name": "mt",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "function",
      "name": "oldLeafUsed",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "router",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "function",
      "name": "verifyProof",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "string"
        },
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[]"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    }
  ],
  SybilResistance: sybilResistanceJSONABI,
  SybilResistance2: sybilResistanceJSONABI,
  SybilResistanceV2: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        },
        {
          "type": "uint256"
        },
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "Uniqueness",
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "name": "isUniqueForAction",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "masalaWasUsed",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "proofIsValid",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[5]"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "prove",
      "constant": false,
      "stateMutability": "payable",
      "payable": true,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[5]"
        }
      ],
      "outputs": []
    }
  ],
  SybilResistancePhone: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        },
        {
          "type": "uint256"
        },
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "Uniqueness",
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "name": "isUniqueForAction",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "prove",
      "constant": false,
      "stateMutability": "payable",
      "payable": true,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[5]"
        }
      ],
      "outputs": []
    }
  ],
  IsUSResident: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "USResidency",
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "masalaWasUsed",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "proofIsValid",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[]"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "prove",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[]"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "usResidency",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    }
  ],
  IsUSResidentV2: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        },
        {
          "type": "uint256"
        },
        {
          "type": "address"
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "USResidency",
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "masalaWasUsed",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "proofIsValid",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[6]"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "prove",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[6]"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "usResidency",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "isValidIssuer",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "allowIssuers",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "uint256[]"
        }
      ],
      "outputs": []
    }
  ],
  MedicalSpecialty: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        },
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "UserHasMedicalSpecialty",
      "inputs": [
        {
          "type": "address"
        },
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "name": "hashbrownsWasUsed",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "proofIsValid",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[6]"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "prove",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "tuple",
          "components": [
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256[2]"
                },
                {
                  "type": "uint256[2]"
                }
              ]
            },
            {
              "type": "tuple",
              "components": [
                {
                  "type": "uint256"
                },
                {
                  "type": "uint256"
                }
              ]
            }
          ]
        },
        {
          "type": "uint256[6]"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "specialty",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address"
        }
      ],
      "outputs": [
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "name": "isValidIssuer",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "allowIssuers",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "uint256[]"
        }
      ],
      "outputs": []
    }
  ],
  Roots: [
    {
      "type": "function",
      "name": "addRoot",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "mostRecentRoot",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "uint256"
        }
      ]
    },
    {
      "type": "function",
      "name": "rootIsRecent",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "uint256"
        }
      ],
      "outputs": [
        {
          "type": "bool"
        }
      ]
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "address"
        }
      ],
      "outputs": []
    }
  ],
}

export { jsonABIs };
export default theABIs;
