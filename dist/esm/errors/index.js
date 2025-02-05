export class ERLCError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ERLCError';
    }
}
export class AuthenticationError extends ERLCError {
    constructor(message = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
    }
}
export class ValidationError extends ERLCError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export class NetworkError extends ERLCError {
    constructor(message = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
    }
}
//# sourceMappingURL=index.js.map