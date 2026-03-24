import React, { useState, useEffect } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";

function App() {
  const [web3auth, setWeb3auth] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // ... (UI ნაწილი იგივე რჩება)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-blue-500 italic">SmartNotary</h1>
        <div>
          {!user ? (
            <button 
              onClick={login} 
              disabled={!isReady}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-xl font-bold disabled:bg-gray-700 transition-all shadow-lg"
            >
              {!isReady ? "Booting System..." : "Login"}
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-gray-800 p-2 px-4 rounded-2xl border border-gray-700">
              <span className="text-gray-300 text-sm">Welcome, <b className="text-white">{user.name || "User"}</b></span>
              <button onClick={logout} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase">Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-3xl p-10 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl mb-8 font-semibold text-center">Digital Asset Notarization</h2>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
            }}
            className={`border-4 border-dashed rounded-3xl p-20 text-center cursor-pointer transition-all duration-300 ${
              isDragging ? 'border-blue-500 bg-blue-500/20 scale-105' : 'border-gray-700 hover:border-blue-500/50'
            }`}
          >
            <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} 
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="animate-pulse">
                  <p className="text-6xl mb-4">📄</p>
                  <p className="text-xl font-bold text-green-400">{file.name}</p>
                  <p className="text-gray-500 mt-2">Ready to notarize</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="text-6xl mb-4 text-gray-700">📤</p>
                  <p className="text-lg">Drag your document here</p>
                  <p className="text-sm italic mt-2">or click to select manually</p>
                </div>
              )}
            </label>
          </div>

          {file && user && (
            <button className="w-full mt-10 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl transition-all transform active:scale-95 text-lg">
              🚀 Finalize & Notarize on Polygon
            </button>
          )}
          
          {file && !user && (
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-500 text-center">
               Please **Login** to sign this document on the blockchain.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;