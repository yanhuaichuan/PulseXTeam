import type { ApiResponse } from '@pulsex/types';

export class PulseXClient {
  constructor(private readonly baseUrl: string, private token = '') {}

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('content-type', 'application/json');
    if (this.token) headers.set('authorization', `Bearer ${this.token}`);
    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) throw new Error(json.error.message);
    return json.data;
  }
}
