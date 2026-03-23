const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy...");

  // ვიღებთ კონტრაქტის "ქარხანას" (Factory)
  const SmartNotary = await hre.ethers.getContractFactory("SmartNotary");

  // ვუშვებთ კონტრაქტს ბლოკჩეინზე
  const notary = await SmartNotary.deploy();

  // ველოდებით, სანამ ბლოკჩეინი დაადასტურებს ტრანზაქციას
  await notary.waitForDeployment();

  // ვიღებთ იმ მისამართს, სადაც ჩვენი კონტრაქტი "დაჯდა"
  const address = await notary.getAddress();
  
  console.log("✅ SmartNotary deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});