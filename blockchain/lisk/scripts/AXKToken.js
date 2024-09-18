
// Set up web3 with Lisk provider
const {Web3, HttpProvider} = require("web3");
const link_testnet_rpc = 'https://rpc.sepolia-api.lisk.com';
const {BigNumber} = require("bignumber.js");
//const provider = new Theta.providers.HttpProvider('https://eth-rpc-api-testnet.thetatoken.org/rpc');
const web3 = new Web3(link_testnet_rpc);
const chainId = 4202
const BN = require('bn.js');
const {successResponse, errorResponse} = require('../../eth/libs/response');

//const web = new Web3.providers.HttpProvider(link_testnet_rpc);

// Contract ABI and address
const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ECDSAInvalidSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "length",
          "type": "uint256"
        }
      ],
      "name": "ECDSAInvalidSignatureLength",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "ECDSAInvalidSignatureS",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        }
      ],
      "name": "ERC1967InvalidImplementation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ERC1967NonPayable",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "increasedSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "cap",
          "type": "uint256"
        }
      ],
      "name": "ERC20ExceededCap",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cap",
          "type": "uint256"
        }
      ],
      "name": "ERC20InvalidCap",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "ERC2612ExpiredSignature",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "signer",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC2612InvalidSigner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EnforcedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExpectedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "currentNonce",
          "type": "uint256"
        }
      ],
      "name": "InvalidAccountNonce",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UUPSUnauthorizedCallContext",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "slot",
          "type": "bytes32"
        }
      ],
      "name": "UUPSUnsupportedProxiableUUID",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "EIP712DomainChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        }
      ],
      "name": "Upgraded",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "UPGRADE_INTERFACE_VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "cap",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "eip712Domain",
      "outputs": [
        {
          "internalType": "bytes1",
          "name": "fields",
          "type": "bytes1"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "version",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "chainId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "verifyingContract",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "uint256[]",
          "name": "extensions",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "nonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "permit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proxiableUUID",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newImplementation",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "upgradeToAndCall",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ];

const proxy = [
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "implementation",
              "type": "address"
          },
          {
              "internalType": "bytes",
              "name": "_data",
              "type": "bytes"
          }
      ],
      "stateMutability": "payable",
      "type": "constructor"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "target",
              "type": "address"
          }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "implementation",
              "type": "address"
          }
      ],
      "name": "ERC1967InvalidImplementation",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "ERC1967NonPayable",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "implementation",
              "type": "address"
          }
      ],
      "name": "Upgraded",
      "type": "event"
  },
  {
      "stateMutability": "payable",
      "type": "fallback"
  }
];

const axkTokenAbi = [
  {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "target",
              "type": "address"
          }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "ECDSAInvalidSignature",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "length",
              "type": "uint256"
          }
      ],
      "name": "ECDSAInvalidSignatureLength",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
          }
      ],
      "name": "ECDSAInvalidSignatureS",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "implementation",
              "type": "address"
          }
      ],
      "name": "ERC1967InvalidImplementation",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "ERC1967NonPayable",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "increasedSupply",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "cap",
              "type": "uint256"
          }
      ],
      "name": "ERC20ExceededCap",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "allowance",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "needed",
              "type": "uint256"
          }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "sender",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "balance",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "needed",
              "type": "uint256"
          }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "approver",
              "type": "address"
          }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "cap",
              "type": "uint256"
          }
      ],
      "name": "ERC20InvalidCap",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "receiver",
              "type": "address"
          }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "sender",
              "type": "address"
          }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
          }
      ],
      "name": "ERC2612ExpiredSignature",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "signer",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          }
      ],
      "name": "ERC2612InvalidSigner",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "EnforcedPause",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "ExpectedPause",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "currentNonce",
              "type": "uint256"
          }
      ],
      "name": "InvalidAccountNonce",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "UUPSUnauthorizedCallContext",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "bytes32",
              "name": "slot",
              "type": "bytes32"
          }
      ],
      "name": "UUPSUnsupportedProxiableUUID",
      "type": "error"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "spender",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "Approval",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [],
      "name": "EIP712DomainChanged",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint64",
              "name": "version",
              "type": "uint64"
          }
      ],
      "name": "Initialized",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
          }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "Paused",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "Transfer",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "Unpaused",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "implementation",
              "type": "address"
          }
      ],
      "name": "Upgraded",
      "type": "event"
  },
  {
      "inputs": [],
      "name": "DOMAIN_SEPARATOR",
      "outputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "UPGRADE_INTERFACE_VERSION",
      "outputs": [
          {
              "internalType": "string",
              "name": "",
              "type": "string"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          }
      ],
      "name": "allowance",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "approve",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "balanceOf",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "cap",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "decimals",
      "outputs": [
          {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "eip712Domain",
      "outputs": [
          {
              "internalType": "bytes1",
              "name": "fields",
              "type": "bytes1"
          },
          {
              "internalType": "string",
              "name": "name",
              "type": "string"
          },
          {
              "internalType": "string",
              "name": "version",
              "type": "string"
          },
          {
              "internalType": "uint256",
              "name": "chainId",
              "type": "uint256"
          },
          {
              "internalType": "address",
              "name": "verifyingContract",
              "type": "address"
          },
          {
              "internalType": "bytes32",
              "name": "salt",
              "type": "bytes32"
          },
          {
              "internalType": "uint256[]",
              "name": "extensions",
              "type": "uint256[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "to",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "name",
      "outputs": [
          {
              "internalType": "string",
              "name": "",
              "type": "string"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          }
      ],
      "name": "nonces",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "owner",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "paused",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
          },
          {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
          },
          {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
          },
          {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
          }
      ],
      "name": "permit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "proxiableUUID",
      "outputs": [
          {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "symbol",
      "outputs": [
          {
              "internalType": "string",
              "name": "",
              "type": "string"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "to",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "transfer",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "from",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "to",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
          }
      ],
      "name": "transferFrom",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
          }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "newImplementation",
              "type": "address"
          },
          {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
          }
      ],
      "name": "upgradeToAndCall",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
  }
];

const contractAddress = '0x3f8FB454c86f89C43F8581a5830594452a5684fa';///'0x3f8FB454c86f89C43F8581a5830594452a5684fa';
const proxyAddress = '0xC198Fcb934F44305B7cf5CdAD1323b67b43cB601';
const ten18 = 1 * Math.pow(10, 18);//(new BigNumber(10)).pow(18);
// Initialize contract
const AXKContract = new web3.eth.Contract(axkTokenAbi, contractAddress);
const AXKProxy = new web3.eth.Contract(proxy, proxyAddress);
const privateKey = process.env.LISK_PRIV_KEY;
const fromAddress = process.env.ESCROW_ACCOUNT_ETH;
// Helper function to send transactions
async function sendTransaction(tx, fromAddress, privateKey) {
    try {
        const gas = await tx.estimateGas({ from: fromAddress });
        console.log("gas :" + gas);
        const gasPrice = await web3.eth.getGasPrice();
        const count = await web3.eth.getTransactionCount(fromAddress);
        const txData = tx.encodeABI();
        const nonce = web3.utils.toHex(count);
        
        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: txData,
                nonce: nonce,
                gas,
                gasPrice,
            },
            privateKey
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction receipt: ', receipt);
        return receipt;
    } catch (error) {
        console.error('Transaction error: ', error);
    }
}

// Helper function to send lisk tokens 
async function sendLisk(txData, fromAddress, privateKey) {
    try {
        const approxTx = await web3.eth.accounts.signTransaction(txData, privateKey);
        let gas = await approxTx.estimateGas({ from: fromAddress });
        if (!gas || typeof(gas) === "undefined" || gas === "null"){
          gas = 30000;
        }
        const gasPrice = await web3.eth.getGasPrice();
        const count = await web3.eth.getTransactionCount(fromAddress);
        const nonce = web3.utils.toHex(count);
        const signedTx = await web3.eth.accounts.signTransaction(
          {
              from: txData.from,
              to: txData.to,
              value: txData.value,
              nonce: nonce,
              gas,
              gasPrice,
          },
          privateKey
      );
        //const txData = tx.encodeABI();
        //const account = web3.eth.accounts.wallet.add(privateKey);
        const txHash = await web3.eth.sendTransaction(signedTx);
        console.log("tx Hash :" + txHash);
        return txHash;
    } catch (error) {
        console.error('Transaction error:', error);
    }
}  

/**  read function helper
async function readFunction(contractAddress, plugin) {
    let Axk TokenProvider;
    try { 
     if (plugin === 'thetajs'){
       Axk TokenProvider = new thetajs.Contract(contractAddress, abi, theta_provider);
     }
     else {
        Axk TokenProvider = new web3.eth.Contract(abi, contractAddress);
     }
     console.log('contract :', Axk TokenProvider);
     return Axk TokenProvider;
    } catch (error) {
        console.error('Transaction error:', error);
    }
} **/

/**
 *  Axk Token Smart Contract Write Function calls  
 * 
**/

// Function to approve Axk Token spending allowance to an address
async function approve(dtx) { //spender, value, fromAddress, privateKey
    const _value = Number(dtx.value) * ten18; //(new BigNumber(value)).multipliedBy(ten18);
    const tx = AXKContract.methods.approve(dtx.spender, _value);
    const approve_response = await sendTransaction(tx, dtx.fromAddress, dtx.privateKey);
    let dataAprv = {
      txHash : approve_response.transactionHash,
      value : _value,
      to : dtx.fromAddress
    };
    return dataAprv;
}

// Function to pause Axk Token contract
async function pause(dtp) { //fromAddress, privateKey
    const tx = AXKContract.methods.pause();
    const pause_response = await sendTransaction(tx, dtp.fromAddress, dtp.privateKey);
    let dataPs = {
      txHash : pause_response.transactionHash,
      to : dtp.fromAddress
    };
    return dataPs;
}

// Function to unpause or resume the Axk Token Contract
async function unpause(dtunp) { // fromAddress, privateKey
    const tx = AXKContract.methods.unpause();
    const un_pause_response = await sendTransaction(tx, dtunp.fromAddress, dtunp.privateKey);
    let dataUps = {
      txHash : un_pause_response.transactionHash,
      to : dtunp.fromAddress
    };
    return dataUps;
}

// Function to mint axk tokens to video uploader and viewer
async function mint(data) {//to, amount,  fromAddress, privateKey
//const httpProvider = new Web3.providers.HttpProvider(link_testnet_rpc);
//const web3 = new Web3(httpProvider);
console.log(data.amount);
//const _amnt = new BN(data.amount);//web3.utils.toBN(amount);
//console.log(_amnt);
 //(new BigNumber(amount)).multipliedBy(ten18);
const _amount = Number(data.amount) * ten18;
console.log(_amount);
//const _amount = new BN(bigAmount); //web3.utils.toBN(_amnt * ten18);
//console.log(_amount);
    // Validate Ethereum address
//const isValidAddress = (address) => web3.utils.isAddress(address);

// Validate uint256
const isValidUint256 = (value) => Number.isInteger(value) && value >= 0;

/** Check validations
if (!isValidAddress(to)) {
    console.error('Invalid "to" address');
}
if (!isValidAddress(fromAddress)) {
    console.error('Invalid "fromAddress"');
} **/
if (!isValidUint256(_amount)) {
    console.error('Invalid "amount", must be a uint256');
}

// If all validations pass, proceed with minting isValidAddress(to) && isValidAddress(fromAddress) &&
if (isValidUint256(_amount)) {
    // Proceed with minting
    // Example: contract.methods.mint(data.to, data.amount).send({ from: data.fromAddress });
    console.log('Minting tokens...');
} else {
    console.error('Validation failed');
}  
    //const axkToken = new web3.eth.Contract(axkTokenAbi, contractAddress);
    //console.log(AXKContract);
    const tx = AXKContract.methods.mint(data.to, _amount);
    const mint_response = await sendTransaction(tx, data.fromAddress, data.privateKey);
    let _data = {
      txHash : mint_response.transactionHash,
      amount : _amount,
      to : data.to
    };

    return _data;
}

/**
 *  Axk Token Smart Contract Read Function calls 
 * 
**/

// Function to transfer Axk Token from one user to another
async function transfer(dtt) {
    console.log(dtt);
    //const _amount =  (new BigNumber(amount)).multipliedBy(ten18);
    const _amount = Number(dtt.amount) * ten18;
    console.log(_amount);
    const tx = AXKContract.methods.transfer(dtt.to, _amount);//.send({ from: dtt.fromAddress });
    const transfer_response = await sendTransaction(tx, dtt.fromAddress, dtt.privateKey);
    console.log("response : " + transfer_response);
    let dataTx = {
      txHash : transfer_response.transactionHash,
      amount : _amount,
      to : dtt.to
    };

    return dataTx;
   // return transfer_response;
}



// Function to transfer approved Axk Token tokens 
async function transferFrom(dt) {
    const _value = Number(dt.value) * ten18; //(new BigNumber(value)).multipliedBy(ten18);
    const tx = AXKContract.methods.transferFrom(dt.from, dt.to, _value);
    const transfer_from_response = await sendTransaction(tx, dt.fromAddress, dt.privateKey);
    let dataTrs = {
      txHash : transfer_from_response.transactionHash,
      value : _value,
      to : dt.to
    };
    return dataTrs;
}

/**
 *  Axk Token Smart Contract Read Function calls 
 * 
**/

// Function to get user address Axk Token spending allowance 
async function allowance(dta) { // owner, spender
    const allowance = await AXKContract.methods.allowance(owner, dta.spender).call();
    console.log( "allowance: " + allowance);
    //let big_int_bal = BigInt(balance.toString());
    let allowance_axk = Number(allowance.toString());
    allowance_axk = allowance_axk * Math.pow(10 , -18);
    allowance_axk = parseInt(allowance_axk);
    console.log(allowance_axk);
    return allowance_axk;
}

// Function to get user address Axk Token balance for an account address 
async function balanceOf(account) {
    const balance = await AXKContract.methods.balanceOf(account).call();
    console.log( "balance: " + balance);
    
    let bal_axk = Number(balance.toString());
    bal_axk = bal_axk * Math.pow(10 , -18);
    bal_axk = parseInt(bal_axk);
    console.log(bal_axk);

    return bal_axk;
}

// Function to get Axk Token cap
async function cap() {
    const cap = await AXKContract.methods.cap().call();
    console.log( "cap: " + cap);
    //let big_int_bal = BigInt(balance.toString());
    let cap_axk = Number(cap.toString());
    cap_axk = cap_axk * Math.pow(10 , -18);
    cap_axk = parseInt(cap_axk);
    console.log(cap_axk);
    return cap_axk;
}

// Function to get Axk Token decimals
async function decimals() {
    const decimals = await AXKContract.methods.decimals().call();
    return decimals;
}

// Function to get Axk Token name
async function name() {
    const name = await AXKContract.methods.name().call();
    return name;
}

// Function to get Axk Token nonces
async function nonces(ownerAddress) {
    const nonces = await AXKContract.methods.nonces(ownerAddress).call();
    return nonces;
}

// Function to get Axk Token owner
async function owner() {
    const owner = await AXKContract.methods.owner().call();
    return owner;
}

// Function to check if Axk Token is paused
async function paused() {
    const paused = await AXKContract.methods.paused().call();
    return paused;
}

// Function to get Axk Token symbol
async function symbol() {
    const symbol = await AXKContract.methods.symbol().call();
    return symbol;
}

// Function to get Axk Token total supply
async function totalSupply() {
    const totalSupply = await AXKContract.methods.totalSupply().call();
    console.log( "totalSupply: " + totalSupply);
    //let big_int_bal = BigInt(balance.toString());
    let total_supply_axk = Number(totalSupply.toString());
    total_supply_axk = total_supply_axk * Math.pow(10 , -18);
    total_supply_axk = parseInt(total_supply_axk);
    console.log(total_supply_axk);
    return total_supply_axk;
}

// Function to get Lisk Token balance
async function liskBalance(data) {
  const bal_lisk = await web3.eth.getBalance(data.address);
  console.log(bal_lisk);
  //bal_eth 
  let bal_lisk_wei = Number(bal_lisk);
  console.log(bal_lisk_wei);
  let bal_wei = bal_lisk_wei * Math.pow(10, -18);
  console.log(bal_wei);
  let bal = {}
  bal.wallet_id = data.wallet_id;
  bal.crypto = "lisk";
  bal.address = data.address;
  bal.balance = bal_wei;
  // to do fetch lisk price usd 
  bal.usd = 0;
  return bal;
}

// Function to transfer Lisk Token 
async function transferLisk(data) {
  //const {from, to, amount, priv_key} = req.body;
  const bal_lisk = await web3.eth.getBalance(data.from);
  console.log(bal_lisk);
  //bal_eth 
  const bal_lisk_wei = Number(bal_lisk);
  console.log(bal_lisk_wei);
  //let bal_wei = bal_lisk_wei * Math.pow(10, -18);
  const lisk_wei = web3.utils.toWei(data.amount, "ether");
  const lisk_amount = Number(lisk_wei);
  const gas_price = await web3.eth.getGasPrice();
  const _gas = 30000 * Number(gas_price);
  const sending = lisk_amount + _gas;
  console.log(sending);
  if (sending > bal_lisk_wei){
       //return res.status(401).json({ msg : 'insufficient funds' });
       return errorResponse(401, "insufficient_funds", {message: "insufficient funds"});
  }
  const tx = { from: data.from , to: data.to, value: lisk_wei};
  const sendTx = await sendLisk(tx, data.from, data.priv_key);
  const txObj = {
    txHash : sendTx,
    amount : lisk_amount
  }
  return txObj;
}


module.exports = {
    allowance,
    approve,
    balanceOf,
    cap,
    decimals,
    mint,
    name,
    nonces,
    owner,
    pause,
    paused,
    symbol,
    transfer,
    transferFrom,
    totalSupply,
    unpause,
    liskBalance,
    transferLisk
}
