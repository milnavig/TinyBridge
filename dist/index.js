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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const errorHandlerMiddleware_1 = __importDefault(require("./middleware/errorHandlerMiddleware"));
const db_1 = __importDefault(require("./db"));
const cache_1 = __importDefault(require("./cache"));
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use(express_1.default.json());
// mount the appRoutes
app.use('/', index_1.default);
app.use(errorHandlerMiddleware_1.default); // middleware for error handling
// function which starts Express server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.sync({ force: true }); // Synchronizing models with the database
        yield cache_1.default.connect();
        app.listen(PORT, () => console.log('The server was launched!'));
    }
    catch (err) {
        console.log(err);
    }
});
startServer();
