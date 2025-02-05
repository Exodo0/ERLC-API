"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkError = exports.ValidationError = exports.AuthenticationError = exports.ERLCError = void 0;
class ERLCError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ERLCError';
    }
}
exports.ERLCError = ERLCError;
class AuthenticationError extends ERLCError {
    constructor(message = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class ValidationError extends ERLCError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NetworkError extends ERLCError {
    constructor(message = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
//# sourceMappingURL=index.js.map