import React, { useState, useEffect } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers"; 
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import CryptoJS from "crypto-js";
import { PinataSDK } from "pinata-web3";
import { contractAddress, contractABI } from "./contractInfo";


function App() {
  const [web3auth, setWeb3auth] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileHash, setFileHash] = useState("");
  const [cid, setCid] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState("notarize"); // "notarize" ან "verify"
  const [verifiedDoc, setVerifiedDoc] = useState(null); // შემოწმების შედეგისთვის


  const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID;
        
        if (!clientId) {
          console.error("Client ID არ მოიძებნა .env ფაილში!");
          return;
        }

        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x13882",
          rpcTarget: "https://rpc-amoy.polygon.technology",
          displayName: "Polygon Amoy",
          blockExplorer: "https://amoy.polygonscan.com",
          ticker: "POL",
          tickerName: "POL",
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });


        // ინიციალიზაცია
        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);
        setIsReady(true);

        if (web3authInstance.connected) {
          const userInfo = await web3authInstance.getUserInfo();
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Web3Auth ინიციალიზაციის შეცდომა:", error);
      }
    };
    init();
  }, []);

  const login = async () => {
    if (!web3auth) return;
    try {
      await web3auth.connect();
      const ethersProvider = new ethers.BrowserProvider(web3authProvider);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();
      console.log("შენი მისამართია:", userAddress);
      setAddress(userAddress); 
      const userInfo = await web3auth.getUserInfo();
      setUser(userInfo);
    } catch (error) {
      console.error("შესვლის შეცდომა:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) return;
    await web3auth.logout();
    setUser(null);
  };


  const calculateHash = (uploadedFile) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    // ფაილის ბიტების წაკითხვა
    const arrayBuffer = e.target.result;
    // კონვერტაცია ბიბლიოთეკისთვის გასაგებ ფორმატში
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    // ჰეშის გამოთვლა
    const hash = CryptoJS.SHA256(wordArray).toString();
    
    setFileHash(hash);
    console.log("Generated Hash:", hash);
  };

  reader.readAsArrayBuffer(uploadedFile);
  
  };
  const handleVerification = async () => {
    if (!fileHash) return;

    try {
      console.log("ბლოკჩეინზე ძებნა დაიწყო...");
    
    // პროვაიდერის მომზადება (მხოლოდ კითხვისთვის Signer არ გვჭირდება, მაგრამ გამოვიყენოთ არსებული)
    const ethersProvider = new ethers.BrowserProvider(web3auth.provider);
    const contract = new ethers.Contract(contractAddress, contractABI, ethersProvider);

    // ვიძახებთ getDocument ფუნქციას ჰეშის მიხედვით
    const result = await contract.getDocument(fileHash);
    
    if (result[3] === 0n || result[3] === 0) { 
      setVerifiedDoc("not_found");
      return;
    }
    // თუ იპოვა, მონაცემებს ვინახავთ
    setVerifiedDoc({
      hash: result[0],
      cid: result[1],
      owner: result[2],
      timestamp: Number(result[3]) // Unix დროს ვაქცევთ რიცხვად
    });

  } catch (error) {
    console.error("Verification Error:", error);
    setVerifiedDoc("not_found");
  }
  };

  const handleNotarization = async () => {
    if (!file || !fileHash) {
      alert("გთხოვთ ჯერ აირჩიოთ ფაილი ჰეშის დასათვლელად.");
      return;
    }

    try {
      setIsUploading(true);
      console.log("1. IPFS-ზე ატვირთვა დაიწყო...");

      // ატვირთვა Pinata-ზე
      const upload = await pinata.upload.file(file);
      const finalCid = upload.cid || upload.IpfsHash;
      setCid(finalCid);
      console.log("2. IPFS ატვირთვა დასრულდა. CID:", finalCid);

      // --- ბლოკჩეინთან დაკავშირება ---
      console.log("3. ბლოკჩეინზე ტრანზაქციის მომზადება...");
      
      // ვიღებთ პროვაიდერს Web3Auth-იდან
      const ethersProvider = new ethers.BrowserProvider(web3auth.provider);
      // ვიღებთ "ხელმომწერს" (Signer)
      const signer = await ethersProvider.getSigner();
      
      // ვქმნით კონტრაქტის ობიექტს
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // ვიძახებთ კონტრაქტის ფუნქციას
      console.log("4. ტრანზაქციის გაგზავნა...");
      const tx = await contract.notarize(fileHash, finalCid);
      
      console.log("5. ტრანზაქცია გაიგზავნა! ჰეში:", tx.hash);
      
      // ველოდებით ბლოკჩეინისგან დადასტურებას
      await tx.wait();
      
      console.log("6. ტრანზაქცია დადასტურდა!");
      alert("✅ დოკუმენტი წარმატებით დამოწმდა ბლოკჩეინზე!");
      
      setIsUploading(false);
    } catch (error) {
      console.error("Notarization Error:", error);
      setIsUploading(false);
      alert("შეცდომა პროცესის დროს. ნახე კონსოლი დეტალებისთვის.");
    }
  };
return (
  <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
    {/* HEADER */}
    <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center border-b border-gray-800 pb-6">
      <div className="text-left">
        <h1 className="text-3xl font-bold text-blue-500 italic">SmartNotary</h1>
        <p className="text-gray-500 text-xs mt-1">Blockchain Verification System</p>
      </div>
      <div>
        {!user ? (
          <button 
            onClick={login} 
            disabled={!isReady}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-xl font-bold disabled:bg-gray-700 transition-all shadow-lg"
          >
            {!isReady ? "Booting..." : "Login"}
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1 bg-gray-800 p-2 px-4 rounded-2xl border border-gray-700">
            <span className="text-gray-300 text-sm">Welcome, <b className="text-white">{user.name || "User"}</b></span>
            <button onClick={logout} className="text-red-400 text-[10px] font-bold uppercase hover:text-red-300">Logout</button>
          </div>
        )}
      </div>
    </header>

    {/* MODE SWITCHER (TABS) */}
    <div className="flex justify-center gap-4 mb-8">
      <button 
        onClick={() => { setMode("notarize"); setFile(null); setFileHash(""); setVerifiedDoc(null); }}
        className={`px-8 py-2 rounded-full font-bold transition-all ${mode === "notarize" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
      >
        Notarize Mode
      </button>
      <button 
        onClick={() => { setMode("verify"); setFile(null); setFileHash(""); setVerifiedDoc(null); }}
        className={`px-8 py-2 rounded-full font-bold transition-all ${mode === "verify" ? "bg-green-600 text-white shadow-lg shadow-green-500/20" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
      >
        Verify Mode
      </button>
    </div>

    <main className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-3xl p-10 border border-gray-700 shadow-2xl">
        <h2 className="text-2xl mb-8 font-semibold text-center">
          {mode === "notarize" ? "Notarize New Document" : "Verify Document Integrity"}
        </h2>
        
        {/* DRAG & DROP AREA */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files[0]) {
              const selectedFile = e.dataTransfer.files[0];
              setFile(selectedFile);
              calculateHash(selectedFile);
            }
          }}
          className={`border-4 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragging ? 'border-blue-500 bg-blue-500/20 scale-102' : 'border-gray-700 hover:border-blue-500/30'
          }`}
        >
          <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files[0]) {
                  setFile(e.target.files[0]);
                  calculateHash(e.target.files[0]);
                }
              }} 
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div>
                <p className="text-6xl mb-4">📄</p>
                <p className="text-xl font-bold text-green-400">{file.name}</p>
                {fileHash && (
                  <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <p className="text-[10px] text-blue-400 font-mono break-all leading-tight">
                      <span className="font-bold text-gray-500 block mb-1 uppercase">SHA-256 Fingerprint:</span> 
                      {fileHash}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                <p className="text-6xl mb-4 opacity-20">📤</p>
                <p className="text-lg">Drag your document here</p>
                <p className="text-sm italic mt-2">or click to select manually</p>
              </div>
            )}
          </label>
        </div>

        {/* VERIFICATION RESULTS (ჩნდება მხოლოდ შემოწმებისას) */}
        {verifiedDoc && verifiedDoc !== "not_found" && (
          <div className="mt-8 p-6 bg-green-500/10 border border-green-500/50 rounded-2xl animate-in fade-in duration-500">
            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2 text-lg">
              <span>✅ Verified! This document is authentic.</span>
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><b>Timestamp:</b> {new Date(verifiedDoc.timestamp * 1000).toLocaleString()}</p>
              <p className="break-all"><b>Notarized By:</b> {verifiedDoc.owner}</p>
              <a 
                href={`https://gateway.pinata.cloud/ipfs/${verifiedDoc.cid}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block bg-green-600/20 text-green-400 px-4 py-2 rounded-lg mt-2 hover:bg-green-600/30 transition-all border border-green-500/30"
              >
                👁️ View original file on IPFS
              </a>
            </div>
          </div>
        )}

        {verifiedDoc === "not_found" && (
          <div className="mt-8 p-6 bg-red-500/10 border border-red-500/50 rounded-2xl animate-pulse">
            <h3 className="text-red-400 font-bold text-lg">❌ Document Not Found!</h3>
            <p className="text-sm text-gray-400 mt-1">This specific version of the file has never been notarized on our system.</p>
          </div>
        )}

        {/* MAIN ACTION BUTTON */}
        {file && user && (
          <button 
            onClick={mode === "notarize" ? handleNotarization : handleVerification}
            disabled={isUploading}
            className={`w-full mt-10 text-white font-bold py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 text-lg ${
              isUploading ? 'bg-gray-700 cursor-not-allowed' : 
              mode === "notarize" ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isUploading ? "Processing..." : mode === "notarize" ? "🚀 Finalize & Notarize on Polygon" : "🔍 Check Authenticity"}
          </button>
        )}

        {file && !user && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 text-center text-sm">
             ⚠️ Please **Login** to interact with the blockchain.
          </div>
        )}
      </div>
    </main>
  </div>
);
}

export default App;