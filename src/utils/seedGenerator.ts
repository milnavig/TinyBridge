import crypto from 'crypto';

// Generating a random seed buffer
export const generateSeed = () => {
  const seedBytes = 4; // Seed buffer size in bytes
  return crypto.randomBytes(seedBytes);
};