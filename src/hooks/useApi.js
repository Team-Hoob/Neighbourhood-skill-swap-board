/**
 * useApi.js — SkillSwap API hook
 *
 * Usage (read):
 *   const { data, loading, error, refetch } = useApi('/skills');
 *
 * Usage (mutate):
 *   const { mutate, loading, error } = useApiMutate();
 *   await mutate('/skills', { method: 'POST', body: { ... } });
 *
 * The JWT token is automatically attached if present in localStorage.
 * Set it after login:  localStorage.setItem('skillswap_token', token)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'skillswap_token';

// ── helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

function buildHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, options = {}) {
  const { method = 'GET', body, headers: extraHeaders = {} } = options;

  const config = {
    method,
    headers: buildHeaders(extraHeaders),
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, config);

  // Handle non-JSON error responses
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      message = errData.detail || errData.message || message;
    } catch (_) { /* ignore */ }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// ── useApi (GET with auto-fetch) ──────────────────────────────────────────────

export function useApi(path, options = {}) {
  const { skip = false, deps = [] } = options;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError]   = useState(null);

  // Use a ref so refetch always uses latest path
  const pathRef = useRef(path);
  pathRef.current = path;

  const fetch_ = useCallback(async () => {
    if (skip || !pathRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(pathRef.current);
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, path, ...deps]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

// ── useApiMutate (POST/PATCH/DELETE) ─────────────────────────────────────────

export function useApiMutate() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (path, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(path, options);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;                        // re-throw so callers can catch
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

// ── Auth helpers (used by Harshit Singh's AuthContext) ───────────────────────

export const api = {
  /** Save JWT after Supabase login */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /** Clear JWT on logout */
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  /** One-off fetch without the hook (for forms, etc.) */
  async fetch(path, options) {
    return apiFetch(path, options);
  },
};

export default useApi;
