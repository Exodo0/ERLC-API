import { Client } from '../client';
import { AuthenticationError, ValidationError } from '../errors';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ERLC Client', () => {
  const mockConfig = {
    globalToken: 'test-token'
  };

  const mockServerToken = 'server-token';

  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      request: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn()
        }
      }
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a client instance with valid config', () => {
      const client = new Client(mockConfig);
      expect(client).toBeInstanceOf(Client);
    });

    it('should throw ValidationError if globalToken is missing', () => {
      expect(() => new Client({ globalToken: '' })).toThrow(ValidationError);
    });
  });

  describe('API Methods', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client(mockConfig);
    });

    it('should get server info', async () => {
      const mockResponse = {
        data: {
          Name: 'Test Server',
          CurrentPlayers: 10,
          MaxPlayers: 40
        }
      };

      (client as any).api.request.mockResolvedValueOnce(mockResponse);

      const result = await client.getServer(mockServerToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get players', async () => {
      const mockResponse = {
        data: [{
          Permission: 'Normal',
          Player: 'TestPlayer:123',
          Team: 'Civilian'
        }]
      };

      (client as any).api.request.mockResolvedValueOnce(mockResponse);

      const result = await client.getPlayers(mockServerToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle authentication errors', async () => {
      (client as any).api.request.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: 'Invalid token' }
        }
      });

      await expect(client.getServer(mockServerToken))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should run command successfully', async () => {
      (client as any).api.request.mockResolvedValueOnce({ data: true });

      const result = await client.runCommand(mockServerToken, ':kick player');
      expect(result).toBe(true);
    });

    it('should throw ValidationError for empty command', async () => {
      await expect(client.runCommand(mockServerToken, ''))
        .rejects
        .toThrow(ValidationError);
    });
  });
});