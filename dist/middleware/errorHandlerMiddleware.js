"use strict";
// middleware for handling errors
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const APIError_1 = __importDefault(require("./../error/APIError"));
function default_1(err, req, res, next) {
    if (err instanceof APIError_1.default) {
        console.error(err.message);
        return res.status(err.status).json({ message: err.message });
    }
    console.error(err.message);
    return res.status(500).json({ message: "Unknown error!" });
}
exports.default = default_1;
