require('dotenv').config(); // Load environment variables from .env file

const mysql = require('mysql'); // Import the mysql module

// Create a MySQL connection configuration object
const config = mysql.createConnection({
  host: "atp.fhstp.ac.at", // Database host
  port: 8007, // Database port
  user: process.env.DB_USERNAME, // Database username from environment variable
  password: process.env.DB_PASSWORD, // Database password from environment variable
  database: "cc221031" // Database name
});

config.connect(function(err) {
  if (err) throw err;
  console.log("Connected!"); // Print "Connected!" message if the connection is successful
});

module.exports = { config }; // Export the MySQL connection configuration object
