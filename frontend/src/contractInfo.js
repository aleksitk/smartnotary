// შენი სმარტ-კონტრაქტის მისამართი (Polygon Amoy-ზე)
export const contractAddress = "0x0cCA3FE231D09D2c0A0B1e7ba4429E68c9Cb2f8f";

// ABI არის "თარჯიმანი", რომელიც ეუბნება JavaScript-ს, თუ რა ფუნქციები აქვს კონტრაქტს
export const contractABI = [
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