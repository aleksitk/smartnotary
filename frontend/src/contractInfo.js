export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "fileHash", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DocumentNotarized",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_fileHash", "type": "string" },
      { "internalType": "string", "name": "_ipfsCID", "type": "string" }
    ],
    "name": "notarize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_fileHash", "type": "string" }
    ],
    "name": "getDocument",
    "outputs": [
      { "internalType": "string", "name": "fileHash", "type": "string" },
      { "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];