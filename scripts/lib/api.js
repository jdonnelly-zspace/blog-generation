/**
 * Shared Directus API helpers.
 *
 * Provides a minimal HTTP client bound to a Directus instance.
 * Used by setup_roles.js for user/policy management.
 *
 * Adapted from directus-api-tools/scripts/lib/api.js.
 * Zero dependencies — uses only Node.js built-ins + native fetch.
 */

/**
 * Creates an API client bound to a specific base URL and token.
 *
 * @param {string} baseUrl — e.g. "https://sandbox1.admin.zspace.com"
 * @param {string} token — Directus static API token
 * @returns {{ fetch: Function, delete: Function }}
 */
function createApiClient(baseUrl, token) {
  /**
   * JSON API request. Returns parsed response data.
   * Throws on Directus error responses.
   */
  async function apiFetch(apiPath, options = {}) {
    const url = baseUrl + apiPath;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await resp.json();
    if (data.errors) {
      const msg = data.errors[0].message;
      const err = new Error(msg);
      err.status = resp.status;
      err.directusErrors = data.errors;
      throw err;
    }
    return data;
  }

  /**
   * DELETE request. Returns nothing on success, throws on failure.
   */
  async function apiDelete(apiPath) {
    const url = baseUrl + apiPath;
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(url, { method: 'DELETE', headers });
    if (!resp.ok && resp.status !== 204) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.errors?.[0]?.message || `DELETE failed: ${resp.status}`);
    }
  }

  return { fetch: apiFetch, delete: apiDelete };
}

module.exports = { createApiClient };
