# 📝 SmartNotary: Project Implementation Roadmap

---

# 🚀 Phase 1: Environment Setup & Infrastructure

- [X] **Initialize Node.js Project**
  - Run `npm init -y`
  - Create the base folder structure

- [X] **Setup Hardhat**
  - Install Hardhat
  - Configure Solidity development environment

- [X] **API Keys & Credentials**
  - Obtain **Pinata API Keys** for IPFS storage
  - Obtain **Web3Auth Client ID** for MPC wallet integration
  - Setup `.env` file for sensitive keys  
    - Private keys  
    - API keys

- [X] **Blockchain Wallet**
  - Setup **MetaMask**
  - Fund wallet with test **MATIC** from **Polygon Amoy Faucet**

---

# ⛓️ Phase 2: Smart Contract Development (Solidity)

- [X] **Develop `SmartNotary.sol`**

  - [X] Create a `Document` struct
    - Hash
    - CID
    - Owner
    - Timestamp

  - [X] Implement `notarizeDocument()` function
    - Include duplicate document check

  - [X] Implement `getDocumentDetails()`
    - Used for document verification

- [ ] **Local Testing**
  - Write unit tests using **Mocha / Chai**
  - Ensure contract logic is **100% correct**

- [X] **Deployment**
  - Deploy contract to **Polygon Amoy Testnet**

- [ ] **Verification**
  - Verify contract source code on **Polygonscan**

---

# 🔐 Phase 3: Identity & MPC Integration (Web3Auth)

- [X] **SDK Integration**
  - Install and configure **Web3Auth SDK** in the frontend

- [X] **Authentication Flow**
  - Implement **Social Login**
    - Google
    - Email
  - Generate an **MPC wallet**

- [X] **Provider Setup**
  - Connect **Web3Auth provider → Ethers.js**
  - Enable blockchain interactions

- [X] **Session Management**
  - Ensure user stays logged in after page refresh

---

# 📦 Phase 4: File Handling & IPFS Storage

- [X] **Client-Side Hashing**
  - Implement **SHA-256 hashing**
  - Use `crypto-js`
  - Ensure hashing happens **locally**

- [ ] **Privacy Layer (Encryption)**
  - Implement encryption before upload
    - **ECIES** or **AES**

- [X] **IPFS Integration**
  - Use **Pinata SDK**
  - Upload encrypted files
  - Retrieve the **CID**

- [ ] **Metadata Management**
  - Structure metadata as **JSON**
  - Allow easier retrieval

---

# 💻 Phase 5: Frontend Development (React/UI)

- [X] **Dashboard UI**
  - Build interface using **Tailwind CSS**

- [X] **Upload Component**
  - Implement **Drag-and-Drop** document upload

- [X] **Blockchain Transaction Feedback**
  - Add **loaders**
  - Add **notifications**
  - Show **"Mining Transaction" status**

- [ ] **Verification Tool**
  - Create page to:
    - Upload file
    - Generate hash
    - Check if hash exists on blockchain

- [ ] **History Tab**
  - Show list of **documents notarized by the current user**

---

# 🧪 Phase 6: Quality Assurance & Testing

- [ ] **End-to-End Testing**
  - Full workflow: Login -> Hash -> Upload -> Notarize -> Verify.

- [ ] **Gas Fee Analysis**
- Measure average cost per notarization
- Expected cost: **< $0.01 on Polygon**

- [ ] **Security Audit**
- Ensure **private keys are never exposed**
- Ensure files on **IPFS are encrypted and unreadable**

- [ ] **Cross-Browser Compatibility**
- Test on:
  - Chrome
  - Brave
  - Firefox

---

# 📚 Phase 7: Thesis Documentation (Academic Writing)

- [ ] **Abstract & Introduction**
- Define the problem
- Present **SmartNotary solution**

- [ ] **Literature Review**
- Compare:
  - Traditional notarization
  - Blockchain / MPC solutions

- [ ] **System Architecture**
- Create diagrams for:
  - Hashing flow
  - MPC flow
  - IPFS storage flow

- [ ] **Implementation Details**
- Explain **Solidity contract logic**
- Explain **MPC sharding**

- [ ] **Evaluation**
- Analyze:
  - Security
  - Cost efficiency
  - User privacy

- [ ] **Conclusion & Future Work**
- Discuss:
  - Layer 2 scaling
  - Zero-Knowledge Proofs (ZKP)

---

# 🛠 Tech Stack at a Glance

**Core**
- Node.js
- React.js

**Smart Contracts**
- Solidity
- Hardhat

**Blockchain**
- Polygon (Amoy Testnet)

**Identity**
- Web3Auth (MPC Architecture)

**Storage**
- IPFS (Pinata)

**Web3 Library**
- Ethers.js v6

**Styling**
- Tailwind CSS

---
