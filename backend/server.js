const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config({ path: "../.env" }); 

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_AMOY_URL);
const masterWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.post("/fund", async (req, res) => {
    const { userAddress } = req.body;

    try {
        const balance = await provider.getBalance(userAddress);
        
        // ჩვენი მიზანია მომხმარებელს ჰქონდეს მინიმუმ 0.12 POL (უსაფრთხოების რეზერვით)
        const targetBalance = ethers.parseEther("0.12"); 

        if (balance < ethers.parseEther("0.08")) {
            const amountToSend = targetBalance - balance;
            
            console.log(`User ${userAddress} needs gas.`);
            console.log(`Current: ${ethers.formatEther(balance)} POL. Sending difference: ${ethers.formatEther(amountToSend)} POL`);

            const tx = await masterWallet.sendTransaction({
                to: userAddress,
                value: amountToSend
            });

            await tx.wait();
            console.log("Transaction confirmed!");
            return res.json({ success: true, message: `Topped up by ${ethers.formatEther(amountToSend)} POL` });
        } else {
            console.log(`User ${userAddress} already has enough gas: ${ethers.formatEther(balance)} POL`);
            return res.json({ success: true, message: "Balance is sufficient" });
        }
    } catch (error) {
        console.error("Funding Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3001, () => console.log("Gas Station running on port 3001"));