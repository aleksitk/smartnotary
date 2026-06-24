const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config({ path: "../.env" }); // ვიყენებთ შენს მთავარ .env-ს

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_AMOY_URL);
const masterWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

app.post("/fund", async (req, res) => {
    const { userAddress } = req.body;

    try {
        // ვამოწმებთ ბალანსს, რომ ტყუილად არ ვფანტოთ POL
        const balance = await provider.getBalance(userAddress);
        if (balance > ethers.parseEther("0.1")) {
            return res.json({ success: true, message: "Already funded with enough gas" });
        }

        console.log(`Sending gas to: ${userAddress}`);
        const tx = await masterWallet.sendTransaction({
            to: userAddress,
            value: ethers.parseEther("0.1") // ვუგზავნით 0.1 POL-ს 
        });


        await tx.wait();
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3001, () => console.log("Gas Station running on port 3001"));