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

      // check if URL is valid
      if (!isValidHttpUrl(url)) {
        return next(APIError.badRequest('Invalid URL!'));
      }

      // Creating a SHA-3 hash function (Keccak-256)
      const hash = crypto.createHash('sha3-256');

      let foundUrl; // found shortened URL in DB
      let shortenedHash; // generated shortened hash

      do {
        // Convert seed buffer to HEX string
        const seedBuffer = generateSeed();
        const seed = seedBuffer.toString('hex');

        // add seed to the URL for randomization
        const seededURL = url + seed;

        // Update hash with url string
        hash.update(seededURL);

        // Hash calculation in "hex" format
        const hashedValue = hash.digest('hex');

        shortenedHash = hashedValue.slice(0, 5);
        console.log(`Input URL: ${url}`);
        console.log(`SHA-3 (Keccak-256) Hash: ${hashedValue}`);
        console.log(`SHA-3 (Keccak-256) Hash Shortened: ${shortenedHash}`);
        
        // check if generated shortened url already exists in DB
        foundUrl = await Url.findOne({
          where: {
            shortUrl: shortenedHash,
          },
        });
      } while (foundUrl);

      // generated shortened URL
      const shortenedUrl = `http://${process.env.HOST}:${process.env.PORT}/${shortenedHash}`;

      // save to DB short and full URLs
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
      const shortenedUrl = req.params.short_hash; // get short hash from URL

      // check if shortenedUrl already exists in cache
      const cachedFullUrl = await redisClient.get(shortenedUrl);

      // if so, simply redirect
      if (cachedFullUrl) {
        return res.redirect(cachedFullUrl);
      }

      // if shortenedUrl was not found in cache
      // search for it in DB
      const foundUrl = await Url.findOne({
        where: {
          shortUrl: shortenedUrl,
        },
      });

      if (!foundUrl) {
        return next(APIError.notFound("Shortened URL does not exist!"));
      }

      // get full url
      const { dataValues: { fullUrl } } = foundUrl;

      // save it in cache for future use
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