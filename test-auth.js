require('dotenv').config();
console.log("Checking Private Key Load...");
if (process.env.PRIVATE_KEY.includes("BEGIN RSA PRIVATE KEY")) {
    console.log("✅ Key format accepted for local development!");
} else {
    console.log("❌ Key format error. Check your .env file.");
}