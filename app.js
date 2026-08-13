// EXPRESS
import express from 'express';

// MORGAN
import morgan from 'morgan';

// CORS
import cors from 'cors';

// JSON TOKEN
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// KNEX
import knex from 'knex';
import knexConfig from './knexfile.js';

// SWAGGER
import swaggerUI from 'swagger-ui-express';
import swaggerDocument from './docs/openapi.json' with { type: 'json' };

// HTTPS
import https from 'node:https';
import fs from 'node:fs';

// AUTHENTICATION
import getProfile from './routes/Authentication/getProfile.js';
import putProfile from './routes/Authentication/putProfile.js';

import register from './routes/Authentication/registration.js';
import login from './routes/Authentication/login.js';

// DEBUG
import eraseRating from './routes/Debug/debugEraseRating.js';
import debugLogin from './routes/Debug/debugLogin.js';

// RATINGS
import rateProperty from './routes/Ratings/rateProperty.js';
import ratings from './routes/Ratings/ratings.js';
import ratingsID from './routes/Ratings/ratingsID.js';

// RENTALS
import stateRoute from './routes/Rentals/states.js';
import propertyRoute from './routes/Rentals/propertyTypes.js';
import rentalSearch from './routes/Rentals/rentalSearch.js';
import rentalSearchID from './routes/Rentals/rentalSearchID.js';

// RATE LIMIT
import limiter from './Components/limiter.js'

// Set Port
const app = express();
const port = 3000;

// Allow Cross-Origin Resource Sharing
app.use(cors());

// Make responses readable
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging
app.use(morgan('tiny'));

const db = knex(knexConfig);
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Set up Swagger Doc at /docs
app.use('/docs', swaggerUI.serve);
app.get('/docs', swaggerUI.setup(swaggerDocument));

const credentials = {
  key: fs.readFileSync('./certs/selfsigned.key'),
  cert: fs.readFileSync('./certs/selfsigned.crt')
};

// Host app
https.createServer(credentials, app).listen(port, () => {
  console.log(`Server listening on https://localhost:${port}`);
});

// Rentals
app.use(propertyRoute);
app.use(stateRoute);
app.use(rentalSearch);
app.use(rentalSearchID);

// Ratings
app.use(ratings);
app.use(ratingsID);
app.use(rateProperty);

// Authentication
app.use(register);
app.use(login);
app.use(getProfile);
app.use(putProfile);

// Debug
app.use(eraseRating);
app.use(debugLogin);

// Limiter
// 200 Requests per 1 Minute
app.use(limiter)
