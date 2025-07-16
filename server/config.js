const path = require("path");
const dotenv = require("dotenv");

// Find and load the .env file from the server directory
const result = dotenv.config({ path: path.resolve(__dirname, "./.env") });

if (result.error) {
  // This will give a more explicit error if the .env file is missing
  console.error("Error: .env file not found or failed to load.", result.error);
  process.exit(1);
}
