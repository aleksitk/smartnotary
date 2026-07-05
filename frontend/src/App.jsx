import React, { useState, useEffect } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers"; 
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import CryptoJS from "crypto-js";
import { PinataSDK } from "pinata-web3";
import { contractAddress, contractABI } from "./contractInfo";

// სანოტარო ბლომბის ნიშანი — ლოგოში, drop-zone-ში და შედეგებში
function Seal({ size = 44, tone = "gold" }) {
  const stroke = tone === "teal" ? "#45B8A4" : tone === "red" ? "#E06257" : "#C9974C";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 4" />
      <circle cx="50" cy="50" r="36" stroke={stroke} strokeWidth="2" />
      <path d="M34 50 L46 62 L68 38" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function App() {
  const [web3auth, setWeb3auth] = useState(null);
  const [address, setAddress] = useState(""); 
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileHash, setFileHash] = useState("");
  const [cid, setCid] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState("notarize"); // "notarize" ან "verify"
  const [verifiedDoc, setVerifiedDoc] = useState(null); // შემოწმების შედეგისთვის
  const [balance, setBalance] = useState("");

  const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
  });
  const refreshBalance = async (providerInstance, userAddress) => {
    try {
      const ethersProvider = new ethers.BrowserProvider(providerInstance);
      const userBalance = await ethersProvider.getBalance(userAddress);
      setBalance(ethers.formatEther(userBalance));
    } catch (error) {
      console.error("ბალანსის განახლების შეცდომა:", error);
    }
  };

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

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);
        setIsReady(true);

        if (web3authInstance.connected) {
          const ethersProvider = new ethers.BrowserProvider(web3authInstance.provider);
          const signer = await ethersProvider.getSigner();
          const userAddress = await signer.getAddress();
          setAddress(userAddress); // ვინახავთ მისამართს State-ში
          
          const userInfo = await web3authInstance.getUserInfo();
          setUser(userInfo);
          await refreshBalance(web3authInstance.provider, userAddress);

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
      const web3authProvider = await web3auth.connect(); // ვიღებთ პროვაიდერს
      
      // მისამართის ამოღება შესვლისას
      const ethersProvider = new ethers.BrowserProvider(web3authProvider);
      const signer = await ethersProvider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
      console.log("%c >>> wallet address: " + userAddress + " <<<", "color: #00ff00; font-weight: bold; font-size: 14px;");

       // ვთხოვთ ჩვენს სერვერს POL-ის გადმორიცხვას
      await fetch("https://smartnotary.onrender.com/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAddress })
      });
      await refreshBalance(web3authProvider, userAddress);
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
      alert("Please select a file first to calculate the hash.");
      return;
    }

    try {
      setIsUploading(true);
      console.log("1. IPFS upload started...");

      // ატვირთვა Pinata-ზე
      const upload = await pinata.upload.file(file);
      const finalCid = upload.cid || upload.IpfsHash;
      setCid(finalCid);
      console.log("2. IPFS upload completed. CID:", finalCid);

      // --- ბლოკჩეინთან დაკავშირება ---
      console.log("3. Preparing blockchain transaction...");
      
      // ვიღებთ პროვაიდერს Web3Auth-იდან
      const ethersProvider = new ethers.BrowserProvider(web3auth.provider);
      // ვიღებთ "ხელმომწერს" (Signer)
      const signer = await ethersProvider.getSigner();
      
      // ვქმნით კონტრაქტის ობიექტს
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // ვიძახებთ კონტრაქტის ფუნქციას
      console.log("4. Sending transaction...");
      const tx = await contract.notarize(fileHash, finalCid);
      
      console.log("5. Transaction sent! Hash:", tx.hash);
      
      // ველოდებით ბლოკჩეინისგან დადასტურებას
      await tx.wait();
      
      console.log("6. Transaction confirmed!");
      alert("✅ Document successfully notarized on the blockchain!");
      await refreshBalance(web3auth.provider, address);
      setIsUploading(false);
    } catch (error) {
      console.error("Notarization Error:", error);
      setIsUploading(false);
      alert("Error during the process. Check console for details.");
    }
  };
  

  return (
    <div className="min-h-screen bg-ink text-paper p-8 font-sans">

      {/* HEADER */}
      <header className="max-w-4xl mx-auto mb-10 flex justify-between items-center pb-6 border-b border-hairline">
        <div className="flex items-center gap-3">
          <Seal size={38} />
          <div>
            <h1 className="text-2xl font-serif font-semibold text-paper tracking-tight">SmartNotary</h1>
            <p className="text-muted text-[11px] mt-0.5 uppercase tracking-[0.18em]">Registry of Record · Polygon + IPFS</p>
          </div>
        </div>
        <div>
          {!user ? (
            <button
              onClick={login}
              disabled={!isReady}
              className="bg-gold text-ink px-7 py-2.5 rounded-md font-semibold text-sm tracking-wide hover:bg-[#dcab5e] disabled:bg-panel2 disabled:text-muted transition-colors"
            >
              {!isReady ? "Booting…" : "Sign in"}
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1 bg-panel border border-hairline px-4 py-2.5 rounded-md">
              <span className="text-paper text-sm">Welcome, <b className="font-serif">{user.name || "User"}</b></span>
              <p className="text-[10px] text-teal font-mono tracking-wide">{balance} POL</p>
              <button onClick={logout} className="text-red text-[10px] uppercase tracking-wide hover:text-[#f08c81]">Sign out</button>
            </div>
          )}
        </div>
      </header>

      {/* TABS */}
      <div className="flex justify-center max-w-md mx-auto">
        <button
          onClick={() => { setMode("notarize"); setFile(null); setFileHash(""); setVerifiedDoc(null); }}
          className={`flex-1 py-3 text-sm font-medium tracking-wide rounded-t-lg border-t border-l border-r transition-colors ${
            mode === "notarize" ? "bg-panel text-paper border-hairline" : "bg-transparent text-muted border-transparent hover:text-paper"
          }`}
        >
          Notarize
        </button>
        <button
          onClick={() => { setMode("verify"); setFile(null); setFileHash(""); setVerifiedDoc(null); }}
          className={`flex-1 py-3 text-sm font-medium tracking-wide rounded-t-lg border-t border-l border-r transition-colors ${
            mode === "verify" ? "bg-panel text-paper border-hairline" : "bg-transparent text-muted border-transparent hover:text-paper"
          }`}
        >
          Verify
        </button>
      </div>

      {/* CARD */}
      <main className="max-w-4xl mx-auto">
        <div className="bg-panel rounded-b-2xl rounded-tr-2xl p-10 border border-hairline">

          <h2 className="text-xl mb-8 font-serif text-center text-paper">
            {mode === "notarize" && "Notarize a new document"}
            {mode === "verify" && "Verify a document's integrity"}
          </h2>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
                calculateHash(e.dataTransfer.files[0]);
              }
            }}
            className={`relative rounded-xl p-14 text-center cursor-pointer transition-all duration-300 border ${
              isDragging ? "border-gold bg-goldsoft" : "border-dashed border-hairline hover:border-gold/40"
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
            <label htmlFor="file-upload" className="cursor-pointer block">
              {file ? (
                <div>
                  <p className="font-serif text-lg text-paper mb-1">{file.name}</p>
                  <p className="text-muted text-xs mb-4">
                      Selected — Ready for {mode === "notarize" ? "Notarization" : "Verification"}
                  </p>
                  {fileHash && (
                    <div className="mt-2 mx-auto max-w-md p-4 bg-ink border border-hairline rounded-lg text-left">
                      <span className="block text-[10px] text-gold uppercase tracking-[0.18em] mb-2">SHA-256 fingerprint</span>
                      <p className="text-[11px] text-paper/80 font-mono break-all leading-relaxed">{fileHash}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted flex flex-col items-center">
                  <Seal size={40} tone="gold" />
                  <p className="text-base text-paper mt-4">Drop document here</p>
                  <p className="text-xs italic mt-1">or click to select manually</p>
                </div>
              )}
            </label>
          </div>

          {mode === "verify" && verifiedDoc && verifiedDoc !== "not_found" && (
            <div className="mt-8 p-7 bg-tealsoft border border-teal/40 rounded-xl flex gap-5 items-start">
              <Seal size={48} tone="teal" />
              <div className="text-sm text-paper/90 space-y-1.5 pt-1">
                <p className="font-serif text-teal text-base mb-2">Verified — Document is authentic</p>
                <p><span className="text-muted">Notarized on:</span> {new Date(verifiedDoc.timestamp * 1000).toLocaleString()}</p>
                <p className="break-all"><span className="text-muted">Notary:</span> {verifiedDoc.owner}</p>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${verifiedDoc.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-teal border border-teal/30 px-3 py-1.5 rounded-md mt-2 hover:bg-teal/10 transition-colors text-xs"
                >
                  View original on IPFS ↗
                </a>
              </div>
            </div>
          )}

          {mode === "verify" && verifiedDoc === "not_found" && (
            <div className="mt-8 p-6 bg-redsoft border border-red/40 rounded-xl flex gap-4 items-center">
              <Seal size={40} tone="red" />
              <p className="text-red font-serif text-base">No record found — this document has not been notarized</p>
            </div>
          )}

          {file && user && (
            <button
              onClick={mode === "notarize" ? handleNotarization : handleVerification}
              disabled={isUploading}
              className={`w-full mt-10 py-4 rounded-lg font-medium text-sm tracking-wide transition-all ${
                isUploading
                  ? "bg-panel2 text-muted cursor-not-allowed"
                  : mode === "notarize"
                  ? "bg-gold text-ink hover:bg-[#dcab5e]"
                  : "bg-teal text-ink hover:bg-[#5cc7b3]"
              }`}
            >
              {isUploading ? "Processing…" : mode === "notarize" ? "Notarize on Polygon" : "Verify Authenticity"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;