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
const mainController_1 = __importDefault(require("./mainController"));
const UrlModel_1 = require("./../models/UrlModel");
const cache_1 = __importDefault(require("./../cache"));
// Mocking
jest.mock('./../cache');
jest.mock('./../models/UrlModel');
describe('generate', () => {
    const mockRequest = (url) => ({ body: { url } });
    const mockResponse = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
    const mockNext = jest.fn();
    beforeEach(() => {
        // Cleaning mocks before each test
        jest.mocked(UrlModel_1.Url.findOne).mockClear();
        jest.mocked(UrlModel_1.Url.create).mockClear();
    });
    it('should generate and return a short URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const url = 'http://example.com';
        const req = mockRequest(url);
        const res = mockResponse();
        jest.mocked(UrlModel_1.Url.findOne).mockResolvedValue(null);
        jest.mocked(UrlModel_1.Url.create).mockResolvedValue({});
        yield mainController_1.default.generate(req, res, mockNext);
        expect(UrlModel_1.Url.findOne).toHaveBeenCalledWith({
            where: { shortUrl: expect.any(String) },
        });
        expect(UrlModel_1.Url.create).toHaveBeenCalledWith({
            shortUrl: expect.any(String),
            fullUrl: url,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(mockNext).not.toHaveBeenCalled();
    }));
    it('should handle invalid URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const invalidUrl = 'invalid-url';
        const req = mockRequest(invalidUrl);
        const res = mockResponse();
        yield mainController_1.default.generate(req, res, mockNext);
        expect(UrlModel_1.Url.create).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    }));
    it('should handle error during URL creation', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest('http://example.com');
        const res = mockResponse();
        const error = new Error('Test error');
        jest.mocked(UrlModel_1.Url.create).mockRejectedValue(error);
        yield mainController_1.default.generate(req, res, mockNext);
        expect(mockNext).toHaveBeenCalledWith(error);
    }));
});
describe('getShortLink', () => {
    const shortUrl = 'short123';
    const mockRequest = () => ({ params: { short_hash: shortUrl } });
    const mockResponse = () => ({ redirect: jest.fn() });
    const mockNext = jest.fn();
    beforeEach(() => {
        // Cleaning mocks before each test
        jest.mocked(cache_1.default.get).mockClear();
        jest.mocked(UrlModel_1.Url.findOne).mockClear();
    });
    it('should redirect to cached full URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest();
        const res = mockResponse();
        const cachedFullUrl = 'http://example.com';
        jest.mocked(cache_1.default.get).mockResolvedValue(cachedFullUrl);
        yield mainController_1.default.getShortLink(req, res, mockNext);
        expect(cache_1.default.get).toHaveBeenCalledWith(shortUrl);
        expect(res.redirect).toHaveBeenCalledWith(cachedFullUrl);
        expect(mockNext).not.toHaveBeenCalled();
    }));
    it('should redirect to found full URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const url = 'http://example.com';
        const req = mockRequest();
        const res = mockResponse();
        jest.mocked(cache_1.default.get).mockResolvedValue(null);
        const foundUrl = { dataValues: { fullUrl: url } };
        jest.mocked(UrlModel_1.Url.findOne).mockResolvedValue(foundUrl);
        yield mainController_1.default.getShortLink(req, res, mockNext);
        expect(UrlModel_1.Url.findOne).toHaveBeenCalledWith({
            where: { shortUrl },
        });
        expect(res.redirect).toHaveBeenCalledWith(url);
        expect(cache_1.default.set).toHaveBeenCalledWith(shortUrl, url);
        expect(mockNext).not.toHaveBeenCalled();
    }));
    it('should handle not found URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest();
        const res = mockResponse();
        jest.mocked(cache_1.default.get).mockResolvedValue(null);
        jest.mocked(UrlModel_1.Url.findOne).mockResolvedValue(null);
        yield mainController_1.default.getShortLink(req, res, mockNext);
        expect(UrlModel_1.Url.findOne).toHaveBeenCalledWith({
            where: { shortUrl: 'short123' },
        });
        expect(res.redirect).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    }));
    it('should handle error', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest();
        const res = mockResponse();
        const error = new Error('Test error');
        jest.mocked(UrlModel_1.Url.findOne).mockRejectedValue(error);
        yield mainController_1.default.getShortLink(req, res, mockNext);
        expect(mockNext).toHaveBeenCalledWith(error);
    }));
});
