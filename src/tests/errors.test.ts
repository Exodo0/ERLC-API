import { ERLCError, AuthenticationError, ValidationError, NetworkError } from '../errors';

describe('ERLC Errors', () => {
  describe('ERLCError', () => {
    it('should create base error with correct name and message', () => {
      const error = new ERLCError('Test error');
      expect(error.name).toBe('ERLCError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError();
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Authentication failed');
    });

    it('should create auth error with custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
    });
  });

  describe('NetworkError', () => {
    it('should create network error with default message', () => {
      const error = new NetworkError();
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network request failed');
    });

    it('should create network error with custom message', () => {
      const error = new NetworkError('Custom network error');
      expect(error.message).toBe('Custom network error');
    });
  });
});