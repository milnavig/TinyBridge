"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const urlValidator_1 = require("./../utils/urlValidator");
const seedGenerator_1 = require("./../utils/seedGenerator");
const APIError_1 = __importDefault(require("../error/APIError"));
const UrlModel_1 = require("./../models/UrlModel");
const cache_1 = __importDefault(require("./../cache"));
// controller
class MainController {
    // generation of a new shortened URL
    generate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { url } = req.body;
                if (!(0, urlValidator_1.isValidHttpUrl)(url)) {
                    return next(APIError_1.default.badRequest('Invalid data in the inputs!'));
                }
                // Creating a SHA-3 hash function (Keccak-256)
                const hash = crypto_1.default.createHash('sha3-256');
                // Convert seed buffer to HEX string
                const seedBuffer = (0, seedGenerator_1.generateSeed)();
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
                    foundUrl = yield UrlModel_1.Url.findOne({
                        where: {
                            shortUrl: shortenedHash,
                        },
                    });
                } while (foundUrl);
                const createdUrl = yield UrlModel_1.Url.create({
                    shortUrl: shortenedHash,
                    fullUrl: url,
                });
                res.status(201).json({ shortURL: shortenedUrl });
            }
            catch (error) {
                if (error instanceof Error) {
                    // Handle the error
                    return next(APIError_1.default.internal(error.message));
                }
            }
        });
    }
    getShortLink(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const shortenedUrl = req.params.shortened_url;
                const cachedFullUrl = yield cache_1.default.get(shortenedUrl);
                if (cachedFullUrl) {
                    return res.redirect(cachedFullUrl);
                }
                const foundUrl = yield UrlModel_1.Url.findOne({
                    where: {
                        shortUrl: shortenedUrl,
                    },
                });
                if (!foundUrl) {
                    return next(APIError_1.default.notFound("Shortened URL does not exist!"));
                }
                const { dataValues: { fullUrl } } = foundUrl;
                yield cache_1.default.set(shortenedUrl, fullUrl);
                return res.redirect(fullUrl);
            }
            catch (error) {
                if (error instanceof Error) {
                    // Handle the error
                    return next(APIError_1.default.internal(error.message));
                }
            }
        });
    }
}
exports.default = new MainController();
