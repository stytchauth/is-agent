import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { isAgent } from '../src';
import { __resetIsAgentCache } from '../src/isAgent';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch;

describe('isAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetIsAgentCache();
  });

  it('should return bot detection result from API', async () => {
    const token = 'test-token';
    const mockResponse = {
      is_agent_client_hint: true,
      identity: 'test bot',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await isAgent(token);

    expect(mockFetch).toHaveBeenCalledWith('https://api.isagent.dev/is_agent', {
      method: 'POST',
      body: JSON.stringify({ public_token: token }),
    });

    expect(result).toEqual({
      is_agent_client_hint: true,
      identity: 'test bot',
    });
  });

  it('should throw IsAgentError on API error', async () => {
    const token = 'test-token';
    const mockError = {
      status_code: 400,
      error_type: 'invalid_token',
      error_message: 'Invalid public token',
      error_url: 'https://docs.stytch.com/errors',
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    } as Response);

    await expect(isAgent(token)).rejects.toThrow('Invalid public token');
  });

  it('should cache results and not make duplicate API calls', async () => {
    const token = 'test-token';
    const mockResponse = {
      is_agent_client_hint: false,
      identity: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // First call
    const result1 = await isAgent(token);

    // Second call with same token should use cache
    const result2 = await isAgent(token);

    // Should only make one API call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Both results should be identical
    expect(result1).toEqual(result2);
    expect(result1).toEqual({
      is_agent_client_hint: false,
      identity: null,
    });
  });

  it('should handle concurrent calls with the same token', async () => {
    const token = 'test-token';
    const mockResponse = {
      is_agent_client_hint: true,
      identity: 'concurrent bot',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // Make multiple concurrent calls
    const [result1, result2, result3] = await Promise.all([
      isAgent(token),
      isAgent(token),
      isAgent(token),
    ]);

    // Should only make one API call despite concurrent requests
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // All results should be identical
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
    expect(result1).toEqual({
      is_agent_client_hint: true,
      identity: 'concurrent bot',
    });
  });

  it('should accept options parameter with abort signal', async () => {
    const token = 'test-token';
    const abortController = new AbortController();
    const mockResponse = {
      is_agent_client_hint: false,
      identity: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await isAgent(token, { signal: abortController.signal });

    expect(mockFetch).toHaveBeenCalledWith('https://api.isagent.dev/is_agent', {
      method: 'POST',
      body: JSON.stringify({ public_token: token }),
      signal: abortController.signal,
    });

    expect(result).toEqual({
      is_agent_client_hint: false,
      identity: null,
    });
  });

  it('does not cache the response if a call fails', async () => {
    const token = 'test-token';
    const mockResponse = {
      is_agent_client_hint: true,
      identity: 'concurrent bot',
    };

    let errored = false;
    mockFetch.mockImplementation(async () => {
      if (!errored) {
        errored = true;
        throw new Error('aborted');
      }
      return {
        ok: true,
        json: async () => mockResponse,
      } as Response;
    });

    // Make multiple sequential calls. First one should fail and not be cached.
    const result1 = await isAgent(token).catch((err) => err);
    const result2 = await isAgent(token);
    const result3 = await isAgent(token);

    // Should make two API calls since first result is not cached
    expect(mockFetch).toHaveBeenCalledTimes(2);

    expect(result1).toEqual(new Error('aborted'));
    expect(result2).toEqual(result3);
    expect(result2).toEqual({
      is_agent_client_hint: true,
      identity: 'concurrent bot',
    });
  });
});
