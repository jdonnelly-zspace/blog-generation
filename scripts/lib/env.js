/**
 * Shared environment loader for the blog generation workflow.
 *
 * Reads .env from the project root, resolves the active environment
 * (DIRECTUS_ENV), and provides token lookup.
 *
 * Token naming convention:
 *   DIRECTUS_TOKEN_{ENV}         — personal token (used by all blog operations)
 *   DIRECTUS_ADMIN_TOKEN_{ENV}   — admin token (used only by setup_roles.js)
 *
 * URL naming convention:
 *   DIRECTUS_URL_{ENV}
 *   e.g. DIRECTUS_URL_SANDBOX, DIRECTUS_URL_PRODUCTION
 *
 * Adapted from directus-api-tools/scripts/lib/env.js.
 * Zero dependencies — uses only Node.js built-ins.
 */

const fs = require('fs');
const path = require('path');

// ── Load .env ───────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const ENV_PATH = path.join(PROJECT_ROOT, '.env');
const ENV_EXAMPLE_PATH = path.join(PROJECT_ROOT, '.env.example');

let envLoaded = false;

function loadEnv() {
  if (envLoaded) return;
  envLoaded = true;

  if (!fs.existsSync(ENV_PATH)) {
    return;
  }

  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      // Don't overwrite values already set (e.g. by --env CLI flag)
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

// ── Resolve environment ─────────────────────────────────────────────────────

/**
 * Returns { url, envName } for the active DIRECTUS_ENV.
 * Exits with a guided error message if .env is missing or incomplete.
 */
function resolveEnv() {
  loadEnv();

  if (!fs.existsSync(ENV_PATH)) {
    console.error('\n  .env file not found.\n');
    console.error('  To set up your environment:\n');
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      console.error('    1. Copy .env.example to .env:');
      console.error('       cp .env.example .env\n');
    } else {
      console.error('    1. Create a .env file in the project root.\n');
    }
    console.error('    2. Add your personal API token (ask JP Donnelly or see guidelines/api-users-and-tokens.md).');
    console.error('    3. Set DIRECTUS_ENV to "sandbox" or "production".\n');
    process.exit(1);
  }

  const envName = (process.env.DIRECTUS_ENV || '').toUpperCase();
  if (!envName) {
    console.error('\n  DIRECTUS_ENV is not set in .env.\n');
    console.error('  Add this line to your .env file:');
    console.error('    DIRECTUS_ENV=sandbox\n');
    console.error('  Valid values: sandbox, production\n');
    process.exit(1);
  }

  const urlKey = `DIRECTUS_URL_${envName}`;
  const url = process.env[urlKey];
  if (!url) {
    console.error(`\n  ${urlKey} is not set in .env.\n`);
    console.error(`  Add the Directus URL for the "${envName.toLowerCase()}" environment:`);
    console.error(`    ${urlKey}=https://sandbox1.admin.zspace.com\n`);
    process.exit(1);
  }

  return { url, envName: envName.toLowerCase() };
}

// ── Resolve token ───────────────────────────────────────────────────────────

/**
 * Returns the personal API token for the active environment.
 * Reads DIRECTUS_TOKEN_{ENV} from .env.
 *
 * @returns {string} the API token
 */
function resolveToken() {
  loadEnv();

  const { envName } = resolveEnv();
  const envUpper = envName.toUpperCase();
  const tokenKey = `DIRECTUS_TOKEN_${envUpper}`;
  const token = process.env[tokenKey];

  if (!token) {
    console.error(`\n  ${tokenKey} is not set in .env.\n`);
    console.error('  Your personal API token carries the Blog Writer policy.');
    console.error('  Ask JP Donnelly for your account, or if you have admin access:');
    console.error('    node scripts/setup_roles.js --add-user YOUR_EMAIL --policies blog\n');
    console.error('  See guidelines/api-users-and-tokens.md for details.\n');
    process.exit(1);
  }

  return token;
}

// ── Resolve admin token ─────────────────────────────────────────────────────

/**
 * Returns the admin token for the active environment.
 * Reads DIRECTUS_ADMIN_TOKEN_{ENV} from .env. No fallback to personal token.
 *
 * @returns {string} the admin API token
 */
function resolveAdminToken() {
  loadEnv();

  const { envName } = resolveEnv();
  const envUpper = envName.toUpperCase();
  const adminKey = `DIRECTUS_ADMIN_TOKEN_${envUpper}`;
  const token = process.env[adminKey];

  if (!token) {
    console.error(`\n  ${adminKey} is not set in .env.\n`);
    console.error('  The admin token is needed only for setup_roles.js (managing users and policies).');
    console.error('  Use .env.admin.example as your template, or pass --admin-token TOKEN.\n');
    process.exit(1);
  }

  return token;
}

// ── Exports ─────────────────────────────────────────────────────────────────

module.exports = { PROJECT_ROOT, loadEnv, resolveEnv, resolveToken, resolveAdminToken };
