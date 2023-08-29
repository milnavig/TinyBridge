//import dotenv from 'dotenv';
//dotenv.config();

import express from 'express';
import cors from 'cors';
import appRoutes from './routes/index';
import errorHandler from './middleware/errorHandlerMiddleware';
import sequelize from './db';
import redisClient from './cache';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));

app.use(express.json());

// mount the appRoutes
app.use('/', appRoutes);

app.use(errorHandler); // middleware for error handling

// function which starts Express server
const startServer = async () => {
  try {
    await sequelize.sync({ force: true }); // Synchronizing models with the database
    await redisClient.connect();
    app.listen(PORT, () => console.log('The server was launched!'));
  } catch(err) {
    console.log(err);
  }
}

startServer();