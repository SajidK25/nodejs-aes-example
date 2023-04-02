## Node.js PostgreSQL sample application that applies AES encryption to sensitive data
-   First, we'll need to install the `pg` module to connect to PostgreSQL:
    ```
    npm install pg
    ```
-   2nd, we'll need to install the `express` module as web framework:
    ```
    npm i express
    ```
-   next, we'll need to install the `dotenv` module to get environment variables:
    ```
    npm i dotenv
    ```
-   Then, we can create a new file called app.js and add the following code:

```javascript
const express = require('express');
const app = express();
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
 }
});

// Define the encryption key and algorithm
const algorithm = 'aes-256-cbc'; 
const key = process.env.ENCRYPTION_KEY; // Replace with your own encryption key
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

```
## Step-by-step explanation of `app.js`:

1.  Import the required modules:
```javascript
const express = require('express');
const app = express();
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();
```
We're using the express module to create an HTTP server, the pg module to connect to a PostgreSQL database, and the crypto module to encrypt and decrypt sensitive data using AES encryption.

2.  Create a new Pool instance with your PostgreSQL database credentials:
```javascript
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
 }
});
```
This code creates a new `Pool` instance with the credentials for your PostgreSQL database, which are stored as environment variables.

3.  Define the encryption key and algorithm:
```javascript
const algorithm = 'aes-256-cbc'; 
const key = process.env.ENCRYPTION_KEY; // Replace with your own encryption key
```
This code defines the encryption algorithm (`aes-256-cbc`) and the encryption key, which is stored as an environment variable.

4.  Define a function to encrypt data:
```javascript
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${encrypted}:${iv.toString('hex')}`;
}
```
This code defines a function called encrypt that takes a string of text as input and returns the encrypted text along with the randomly generated IV, separated by a colon (:). The `crypto.randomBytes` function generates a new IV for each encryption.

5.  Define a function to decrypt data:
```javascript
function decrypt(text) {
  const [encryptedText, ivHex] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```
This code defines a function called `decrypt` that takes a string of text in the format returned by the `encrypt` function (`encryptedText:ivHex`) and returns the decrypted text using the IV extracted from the input string.

6.  Define a route to insert sensitive data into the database:
```javascript
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
```
This code defines a route that handles HTTP GET requests to the `/insert` endpoint. When a request is received, it encrypts a string of sensitive data using the `encrypt` function and inserts it into a PostgreSQL database using a prepared statement with a parameterized query.## Set Environment Variables on Heroku

7.  Define a route to retrieve and decrypt sensitive data from the database:
```javascript
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
```
This code defines a route that allows the user to retrieve and decrypt sensitive data from the PostgreSQL database.

First, a query object is created to select all rows from the "sensitive_data" table. Then, the query is executed using the `pool.query()` method, which returns a Promise that resolves to the query result.

The result is then used to extract the encrypted text from the first row of the result set, by accessing the `data` property of the row object.

Next, the `decrypt()` function is called to decrypt the encrypted text using the encryption key and initialization vector defined earlier. The resulting decrypted text is stored in the `decryptedText` variable.

Finally, the decrypted text is sent back to the client as a response to the HTTP request, using the `res.send()` method. If an error occurs during the retrieval and decryption process, an error message is logged to the console and a 500 Internal Server Error response is sent to the client.

8.  starts the Node.js server and listens for incoming requests on a specified port:
```javascript
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```
The `process.env.PORT` variable is used to retrieve the port number from the environment variables. This is done to support deployment on platforms like Heroku, where the port number may be dynamically assigned by the hosting service.

If the `PORT` environment variable is not set, the server will listen on port 3000 by default.

The `app.listen()` method is used to start the server and bind it to the specified port. When the server starts listening for incoming requests, the callback function passed as the second argument is called, and a message is logged to the console indicating the port number the server is running on.

Overall, this code is responsible for starting the server and making it available to the client for processing requests.

## Deploy to Heroku
### Step 0 : Install the Heroku CLI
    - Download and install the Heroku CLI [ https://devcenter.heroku.com/articles/heroku-command-line ].
### Step 1 : Heroku CLI login
    - go to project directory 
    - heroku login
### Step 2 : create Heroku app
    - heroku create -a nodejs-aes-example
    - heroku login
### Step 3 : Initialize git
    - git init
    - heroku git:remote -a nodejs-aes-example
    - git add .
    - git commit -m 'first commit'
### Step 4 : Setting up environment variables

```
heroku config:set ENCRYPTION_KEY=CIDBAAJQJYUHDLMXZAOMXWW3QYF2Z2EH --app nodejs-aes-example
heroku config:set PGUSER=pbmzkmkctzpxmb --app nodejs-aes-example
heroku config:set PGHOST=ec2-52-21-61-131.compute-1.amazonaws.com --app nodejs-aes-example 
heroku config:set PGDATABASE=d6vj0gflgdvok5 --app nodejs-aes-example
heroku config:set PGPASSWORD=678b2d607cdc8bf6268153f46f6095d091aa5171c50eba6de35dbc0e5cbe81b4 --app nodejs-aes-example
heroku config:set PGPORT=5432 --app nodejs-aes-example
```
### Step 5 : Deploy
    - git push heroku master

## Test the Deployment

### Open the follwing URL in a browser:

-   To insert encrypted data: https://nodejs-aes-example.herokuapp.com/insert
-   To retrieve encrypted data: https://nodejs-aes-example.herokuapp.com/retrieve