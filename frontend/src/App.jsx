import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // ფაილის დამუშავება
  const handleFiles = (files) => {
    const uploadedFile = files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      console.log("ფაილი აიტვირთა:", uploadedFile.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-blue-500 mb-2">SmartNotary</h1>
        <p className="text-gray-400">Secure Blockchain-Based Document Notarization</p>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          
          <h2 className="text-xl font-semibold mb-6">Notarize New Document</h2>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-blue-400'}
              ${file ? 'bg-green-500/5 border-green-500/50' : ''}
            `}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFiles(e.target.files)}
            />
            
            {!file ? (
              <div className="space-y-4">
                <div className="text-5xl">📄</div>
                <p className="text-lg text-gray-300">
                  Drag and drop your file here, or <span className="text-blue-500 underline">browse</span>
                </p>
                <p className="text-sm text-gray-500 italic">Supports PDF, Images, and Documents</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-5xl">✅</div>
                <p className="text-lg text-green-400 font-medium">Selected: {file.name}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-sm text-red-400 hover:underline"
                >
                  Change file
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          {file && (
            <button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95">
              Start Notarization Process
            </button>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;