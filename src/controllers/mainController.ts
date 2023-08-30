import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { isValidHttpUrl } from './../utils/urlValidator';
import { generateSeed } from './../utils/seedGenerator';
import APIError from '../error/APIError';
import { Url } from './../models/UrlModel';
import redisClient from './../cache';

// controller
class MainController {
  // generation of a new shortened URL
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;

      if (!isValidHttpUrl(url)) {
        return next(APIError.badRequest('Invalid data in the inputs!'));
      }

      // Creating a SHA-3 hash function (Keccak-256)
      const hash = crypto.createHash('sha3-256');

      // Convert seed buffer to HEX string
      const seedBuffer = generateSeed();
      const seed = seedBuffer.toString('hex');

      const seededURL = url + seed;

      // Update hash with url string
      hash.update(seededURL);

      // Hash calculation in "hex" format
      const hashedValue = hash.digest('hex');

      const shortenedHash = hashedValue.slice(0, 5);
      console.log(`Input: ${url}`);
      console.log(`SHA-3 (Keccak-256) Hash: ${hashedValue}`);
      console.log(`SHA-3 (Keccak-256) Hash Shortened: ${shortenedHash}`);

      const shortenedUrl = `http://0.0.0.0:${process.env.PORT}/${shortenedHash}`;

      let foundUrl;

      do {
        foundUrl = await Url.findOne({
          where: {
            shortUrl: shortenedHash,
          },
        });
      } while (foundUrl);

      await Url.create({
        shortUrl: shortenedHash,
        fullUrl: url,
      });

      res.status(201).json({ shortURL: shortenedUrl });
    } catch (error) {
      if (error instanceof Error) {
        // Handle the error
        return next(APIError.internal(error.message));
      }
    }
  }

  async getShortLink(req: Request, res: Response, next: NextFunction) {
    try {
      const shortenedUrl = req.params.shortened_url;

      const cachedFullUrl = await redisClient.get(shortenedUrl);

      if (cachedFullUrl) {
        return res.redirect(cachedFullUrl);
      }

      const foundUrl = await Url.findOne({
        where: {
          shortUrl: shortenedUrl,
        },
      });

      if (!foundUrl) {
        return next(APIError.notFound("Shortened URL does not exist!"));
      }

      const { dataValues: { fullUrl } } = foundUrl;

      await redisClient.set(shortenedUrl, fullUrl);

      return res.redirect(fullUrl);
    } catch (error) {
      if (error instanceof Error) {
        // Handle the error
        return next(APIError.internal(error.message));
      }
    }
  }
}

export default new MainController();