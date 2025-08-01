type IsAgentResult = {
  is_agent_client_hint: boolean;
  identity: string | null;
};
// Package-scoped promise result used for deduplication
let isAgentResultProm: Promise<IsAgentResult> | null = null;

let isAgentResultSync: IsAgentResult | null = null;
/**
 * Checks if the current client is likely a bot using the provided Stytch public token.
 * @param publicToken - The Stytch public token
 * @throws IsAgentError - when request cannot be completed successfully
 * @returns An object with is_agent_client_hint and identity
 */
export async function isAgent(publicToken: string): Promise<IsAgentResult> {
  if (!isAgentResultProm) {
    isAgentResultProm = doIsAgentAPICall(publicToken).then((res) => (isAgentResultSync = res));
  }
  return isAgentResultProm;
}

export function isAgentSync() {
  return isAgentResultSync;
}

// For testing purposes - reset the cache
export function __resetIsAgentCache() {
  isAgentResultProm = null;
  isAgentResultSync = null;
}

async function doIsAgentAPICall(publicToken: string): Promise<IsAgentResult> {
  const res = await fetch('https://api.isagent.dev/is_agent', {
    method: 'POST',
    body: JSON.stringify({ public_token: publicToken }),
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new IsAgentError(await res.json());
  }
}

interface APIError {
  status_code: number;
  request_id?: string;
  error_type: string;
  error_message: string;
  error_url: string;
  error_details?: object;
}

export class IsAgentError extends Error {
  error_type: string;
  error_message: string;
  error_url: string;
  request_id?: string;
  status_code: number;
  error_details?: object;

  constructor(details: APIError) {
    super();
    this.name = 'IsAgentError';

    const { status_code, error_type, error_message, error_url, request_id, error_details } =
      details;
    this.error_type = error_type;
    this.error_message = error_message;
    this.error_url = error_url;
    this.request_id = request_id;
    this.status_code = status_code;
    this.error_details = error_details;

    this.message =
      `[${status_code}] ${error_type}\n` +
      `${error_message}\n` +
      `See ${error_url} for more information.\n` +
      // Web-Backend doesn't have request IDs yet, so if a request fails there it won't have one.
      // We should figure out how returning tracing info should work
      (request_id ? `request_id: ${request_id}\n` : '') +
      (this.error_details ? `Details: \n` + JSON.stringify(this.error_details) + '\n' : '');
  }
}
