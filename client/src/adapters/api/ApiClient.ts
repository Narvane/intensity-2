export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiErrorBody {
  code: string;
  message: string;
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string, token?: string): Promise<T> {
    return this.request<T>('GET', path, undefined, token);
  }

  async post<T>(path: string, body: unknown, token?: string): Promise<T> {
    return this.request<T>('POST', path, body, token);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body: unknown | undefined,
    token?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      let payload: ApiErrorBody = {
        code: 'UNKNOWN_ERROR',
        message: response.statusText,
      };

      try {
        payload = (await response.json()) as ApiErrorBody;
      } catch {
        // keep default payload
      }

      throw new ApiError(response.status, payload.code, payload.message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

export function createApiClient(): ApiClient {
  return new ApiClient(import.meta.env.VITE_API_URL);
}
