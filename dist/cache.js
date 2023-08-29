"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
// Creating a Redis Client
const client = (0, redis_1.createClient)({
    //password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    }
});
// Handling the connection error event
client.on('error', (error) => {
    console.error('Redis Error:', error);
});
exports.default = client;
