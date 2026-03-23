# SmartNotary: A Decentralized Infrastructure for Secure Digital Document Notarization

This document provides a comprehensive overview of the project, designed for a **Bachelor’s Thesis** or a **technical project proposal**.

---

# 1. Project Overview

**SmartNotary** is a decentralized application (**DApp**) designed to provide a secure, transparent, and tamper-proof method for verifying the authenticity and ownership of digital documents.

By leveraging **Blockchain technology**, **Decentralized Storage (IPFS)**, and **Multi-Party Computation (MPC)**, the system eliminates the need for traditional centralized third-party intermediaries and offers a **trustless notarization service**.

The platform ensures that any document — such as **contracts, certificates, or intellectual property** — can be mathematically proven to have existed in a specific state at a specific point in time **without compromising the user's privacy**.

---

# 2. The Problem Statement

Current notarization processes face several challenges:

### Centralization
Reliance on a single authority makes the system vulnerable to **corruption** or **single points of failure**.

### Physical Limitations
Paper-based notarization is **slow, expensive, and difficult to verify globally**.

### Privacy Risks
Digital alternatives often require users to upload sensitive files to **central servers**, where they can be leaked or accessed by administrators.

### Complexity
Most blockchain solutions require advanced knowledge such as:

- MetaMask
- Private Keys
- Gas Fees

This complexity alienates **non-technical users**.

---

# 3. Key Technical Innovations

SmartNotary solves these problems through **four pillars of technology**.

---

## A. Multi-Party Computation (MPC) Wallets

Instead of forcing users to manage complex **seed phrases** (such as MetaMask), SmartNotary uses **MPC technology** through **Web3Auth / Privy**.

Users can log in using familiar authentication methods such as:

- Google
- Email

The system automatically generates a **Non-Custodial wallet**.

The private key is split into **multiple shares**, ensuring that **the platform provider never has access to the user's full key**.

---

## B. Immutable Verification (Polygon Blockchain)

The system uses the **Polygon Network** to store a permanent **digital fingerprint (hash)** of the document.

Polygon is chosen because it provides:

- High transaction speed
- Near-zero transaction costs

This makes **digital notarization affordable and scalable**.

---

## C. Decentralized Storage (IPFS)

Documents are **not stored on a central server**.

Instead, they are stored on **IPFS (InterPlanetary File System)**.

This ensures that:

- The file is **globally accessible**
- The file **cannot be deleted or censored** by any single authority

---

## D. Privacy-First Hashing & Encryption

SmartNotary follows a **Zero-Knowledge approach**.

### Hashing

The system calculates a **SHA-256 hash** of the file **locally in the user's browser**.

Only the hash (the document's **digital fingerprint**) is stored on the blockchain.

### Encryption

Before uploading to IPFS, the document is **encrypted using the user's public key**.

Even if someone finds the file on IPFS, it remains **unreadable to everyone except the owner**.

---

# 4. System Workflow (How it Works)

### 1. Authentication
The user signs in via **Google or Email**.  
An **MPC wallet** is generated automatically in the background.

### 2. Upload & Process
The user selects a document.  
The browser calculates its **unique cryptographic hash**.

### 3. Secure Storage
The document is **encrypted** and uploaded to **IPFS**, which returns a **Content Identifier (CID)**.

### 4. Blockchain Notarization
A **Smart Contract on Polygon** records:

- Document Hash
- CID
- Owner Address
- Timestamp

### 5. Certificate Issuance
The user receives a **digital Notary Certificate (NFT)** as proof of the notarization transaction.

### 6. Verification
Any third party can upload the same document to the platform.

The system:

1. Recalculates the hash
2. Compares it with the blockchain record

If the hashes match, the document is **verified as authentic**.

---

# 5. Technical Stack

### Backend
- Node.js
- Express

### Frontend
- React.js
- Tailwind CSS

### Smart Contracts
- Solidity
- Deployed on **Polygon Amoy Testnet**

### Blockchain Library
- Ethers.js (v6)

### Authentication / Identity
- Web3Auth (MPC Infrastructure)

### File Storage
- IPFS (via Pinata SDK)

### Development Framework
- Hardhat

---

# 6. Project Goals (Thesis Outcomes)

### Proof of Concept
A **working web application** where users can:

- Notarize documents
- Verify documents

### Security Analysis
Demonstrating how **MPC wallets and hashing mechanisms protect user data**.

### Scalability Proof
Showing that blockchain can handle **high-volume notarization** at a **minimal cost** compared to traditional notarization systems.

### User Autonomy
Proving that users can **own and verify their data without trusting a central authority**.

---

# 7. Conclusion

SmartNotary represents the **future of legal and digital verification**.

By combining the **security of blockchain** with the **usability of modern web interfaces**, it bridges the gap between **Web2 usability and Web3 security**.

The system demonstrates that **mathematics and cryptography can replace traditional trust-based verification systems**.

> **“The Math is the Notary.”**

SmartNotary provides a **robust, low-cost, secure, and privacy-focused solution for the digital age**.