"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidHttpUrl = void 0;
function isValidHttpUrl(str) {
    let url;
    try {
        url = new URL(str);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
exports.isValidHttpUrl = isValidHttpUrl;
