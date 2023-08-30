import { Request, Response, NextFunction } from 'express';
import { Model } from 'sequelize';
import controller from './mainController';
import { Url } from './../models/UrlModel';
import redisClient from './../cache';

// Mocking
jest.mock('./../cache');
jest.mock('./../models/UrlModel');

describe('generate', () => {
  const mockRequest = (url: string) => ({ body: { url } } as unknown as Request);
  const mockResponse = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response);
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    // Cleaning mocks before each test
    jest.mocked(Url.findOne).mockClear();
    jest.mocked(Url.create).mockClear();
  });

  it('should generate and return a short URL', async () => {
    const url = 'http://example.com';
    const req = mockRequest(url);
    const res = mockResponse();
    
    jest.mocked(Url.findOne).mockResolvedValue(null);
    jest.mocked(Url.create).mockResolvedValue({} as Url);

    await controller.generate(req, res, mockNext);

    expect(Url.findOne).toHaveBeenCalledWith({
      where: { shortUrl: expect.any(String) },
    });
    expect(Url.create).toHaveBeenCalledWith({
      shortUrl: expect.any(String),
      fullUrl: url,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle invalid URL', async () => {
    const invalidUrl = 'invalid-url';
    const req = mockRequest(invalidUrl);
    const res = mockResponse();

    await controller.generate(req, res, mockNext);

    expect(Url.create).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    
  });

  it('should handle error during URL creation', async () => {
    const req = mockRequest('http://example.com');
    const res = mockResponse();
    const error = new Error('Test error');
    jest.mocked(Url.create).mockRejectedValue(error);

    await controller.generate(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('getShortLink', () => {
  const shortUrl = 'short123';
  const mockRequest = () => ({ params: { short_hash: shortUrl } } as unknown as Request);
  const mockResponse = () => ({ redirect: jest.fn() } as unknown as Response);
  const mockNext = jest.fn() as NextFunction;

  beforeEach(() => {
    // Cleaning mocks before each test
    jest.mocked(redisClient.get).mockClear();
    jest.mocked(Url.findOne).mockClear();
  });

  it('should redirect to cached full URL', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const cachedFullUrl = 'http://example.com';
    jest.mocked(redisClient.get).mockResolvedValue(cachedFullUrl);

    await controller.getShortLink(req, res, mockNext);

    expect(redisClient.get).toHaveBeenCalledWith(shortUrl);
    expect(res.redirect).toHaveBeenCalledWith(cachedFullUrl);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should redirect to found full URL', async () => {
    const url = 'http://example.com';
    const req = mockRequest();
    const res = mockResponse();
    jest.mocked(redisClient.get).mockResolvedValue(null);

    const foundUrl = { dataValues: { fullUrl: url } };
    jest.mocked(Url.findOne).mockResolvedValue(foundUrl as Model);

    await controller.getShortLink(req, res, mockNext);

    expect(Url.findOne).toHaveBeenCalledWith({
      where: { shortUrl },
    });
    expect(res.redirect).toHaveBeenCalledWith(url);
    expect(redisClient.set).toHaveBeenCalledWith(shortUrl, url);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle not found URL', async () => {
    const req = mockRequest();
    const res = mockResponse();
    jest.mocked(redisClient.get).mockResolvedValue(null);

    jest.mocked(Url.findOne).mockResolvedValue(null);

    await controller.getShortLink(req, res, mockNext);

    expect(Url.findOne).toHaveBeenCalledWith({
      where: { shortUrl: 'short123' },
    });
    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle error', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const error = new Error('Test error');
    jest.mocked(Url.findOne).mockRejectedValue(error);

    await controller.getShortLink(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});