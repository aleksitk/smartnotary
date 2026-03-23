// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SmartNotary {
    struct Document {
        string fileHash;
        string ipfsCID;
        address owner;
        uint256 timestamp;
    }

    mapping(string => Document) private documents;

    function notarize(string memory _fileHash, string memory _ipfsCID) public {
        require(documents[_fileHash].timestamp == 0, "Already notarized");
        documents[_fileHash] = Document(_fileHash, _ipfsCID, msg.sender, block.timestamp);
    }

    function getDocument(string memory _fileHash) public view returns (string memory, string memory, address, uint256) {
        Document memory doc = documents[_fileHash];
        return (doc.fileHash, doc.ipfsCID, doc.owner, doc.timestamp);
    }
}