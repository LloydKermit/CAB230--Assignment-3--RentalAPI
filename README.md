REST API created for CAB230 Assignment 3: Server-Side Express Application

The following technologies have been used:

- Node
- Express
- MySQL
- Swagger
- Knex
- JSON Web Tokens
- Argon2

The .env that contained the JWT Secret is not included.


Instructions to create JWT Token for the API
-----------------------------------------------
Create .env file in directory containing app.js

Open Node REPL and enter

require('crypto').randomBytes(24).toString('base64')

Include JWT_SECRET=KEY_HERE... in .env
