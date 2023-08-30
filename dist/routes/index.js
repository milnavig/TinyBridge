"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mainController_1 = __importDefault(require("../controllers/mainController"));
const router = express_1.default.Router();
// route for generating short urls
router.post('/generate', mainController_1.default.generate);
// route for short urls
router.get('/:short_hash', mainController_1.default.getShortLink);
exports.default = router;
