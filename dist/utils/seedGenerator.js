"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeed = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Generating a random seed buffer
const generateSeed = () => {
    const seedBytes = 4; // Seed buffer size in bytes
    return crypto_1.default.randomBytes(seedBytes);
};
exports.generateSeed = generateSeed;
