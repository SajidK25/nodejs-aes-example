const express = require('express');
const app = express();
const { Pool } = require('pg');
const crypto = require('crypto');

// Create a new pool with your PostgreSQL database credentials
const pool = new Pool({
    user: "pbmzkmkctzpxmb",
    host: "ec2-52-21-61-131.compute-1.amazonaws.com",
    database: "d6vj0gflgdvok5",
    password: "678b2d607cdc8bf6268153f46f6095d091aa5171c50eba6de35dbc0e5cbe81b4",
    port: 5432,
    ssl: {
       rejectUnauthorized: false,
    },
  });
// const pool = new Pool({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT
// });

// Define the encryption key and algorithm
const algorithm = 'aes-256-cbc';
// const key = process.env.ENCRYPTION_KEY; // Replace with your own encryption key
const key = crypto.randomBytes(32);
// Define a function to encrypt data
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${encrypted}:${iv.toString('hex')}`;
}

// Define a function to decrypt data
function decrypt(text) {
  const [encryptedText, ivHex] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Define a route to insert sensitive data into the database
app.get('/insert', async (req, res) => {
  const text = 'sensitive data';
  const encryptedText = encrypt(text);
  const query = {
    text: 'INSERT INTO sensitive_data (data) VALUES ($1)',
    values: [encryptedText]
  };
  try {
    await pool.query(query);
    res.send('Data inserted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting data into database');
  }
});

// Define a route to retrieve and decrypt sensitive data from the database
app.get('/retrieve', async (req, res) => {
  const query = {
    text: 'SELECT * FROM sensitive_data'
  };
  try {
    const result = await pool.query(query);
    const encryptedText = result.rows[0].data;
    const decryptedText = decrypt(encryptedText);
    res.send(`Sensitive data: ${decryptedText}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving data from database');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
