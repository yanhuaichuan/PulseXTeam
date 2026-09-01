export { store, computePulse } from './store.js';
export * from './seed.js';

export function ok<T>(data: T) {
  return { success: true as const, data };
}

export function fail(code: string, message: string, status = 400) {
  return { status, body: { success: false as const, error: { code, message } } };
}

export function requestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
