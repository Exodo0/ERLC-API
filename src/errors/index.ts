export class ERLCError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ERLCError';
  }
}

export class AuthenticationError extends ERLCError {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ERLCError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ERLCError {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}