/**
 * Set up Directus API roles, policies, permissions, and users for the
 * blog generation workflow.
 *
 * Commands:
 *   (default)    Create the Blog Writer policy + API Tools User role
 *   --add-user   Create a personal API user with the Blog Writer policy
 *   --list-users List all blog API users and their policies
 *
 * Admin token can be passed via --admin-token or read from .env
 * (DIRECTUS_ADMIN_TOKEN_{ENV}). See .env.admin.example.
 *
 * Usage:
 *   # One-time setup (reads admin token from .env)
 *   node scripts/setup_roles.js --env production
 *
 *   # Or pass admin token explicitly
 *   node scripts/setup_roles.js --admin-token TOKEN --env production
 *
 *   # Add a team member
 *   node scripts/setup_roles.js --add-user name@zspace.com --policies blog
 *
 *   # List all blog API users
 *   node scripts/setup_roles.js --list-users
 *
 * Adapted from directus-api-tools/scripts/setup_roles.js.
 * Zero dependencies — uses only Node.js built-ins + native fetch.
 */

const crypto = require('crypto');
const { loadEnv, resolveEnv } = require('./lib/env');
const { createApiClient } = require('./lib/api');

// ── Parse args ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
let adminToken = '';
let dryRun = false;
let help = false;
let addUserEmail = '';
let policiesArg = '';
let listUsers = false;

for (let i = 0; i < argv.length; i++) {
  switch (argv[i]) {
    case '--admin-token': adminToken = argv[++i] || ''; break;
    case '--dry-run':     dryRun = true; break;
    case '--env':         process.env.DIRECTUS_ENV = argv[++i] || ''; break;
    case '--add-user':    addUserEmail = argv[++i] || ''; break;
    case '--policies':    policiesArg = argv[++i] || ''; break;
    case '--list-users':  listUsers = true; break;
    case '--help':
    case '-h':            help = true; break;
  }
}

if (help) {
  console.log(`
zSpace Blog Generation — Role & User Setup

Commands:

  1. Create policy and role (one-time, idempotent):
     node scripts/setup_roles.js [--env production]

  2. Add a team member:
     node scripts/setup_roles.js --add-user EMAIL --policies blog

     POLICY_LIST: blog (only valid value today)
     Defaults to "blog" if --policies is omitted.

  3. List blog API users:
     node scripts/setup_roles.js --list-users

Options:
  --admin-token TOKEN   Override admin token (default: reads DIRECTUS_ADMIN_TOKEN_{ENV} from .env)
  --env NAME            Override DIRECTUS_ENV (sandbox or production)
  --dry-run             Preview what would be created
  -h, --help            Show this help

Admin token is read from .env (DIRECTUS_ADMIN_TOKEN_{ENV}) or passed via --admin-token.
See .env.admin.example for the admin .env template.
  `);
  process.exit(0);
}

// Resolve admin token: CLI flag > .env > error
if (!adminToken) {
  loadEnv();
  const { envName } = resolveEnv();
  const envAdminKey = `DIRECTUS_ADMIN_TOKEN_${envName.toUpperCase()}`;
  adminToken = process.env[envAdminKey] || '';

  if (!adminToken) {
    console.error(`\n  No admin token found. Checked:\n`);
    console.error(`    --admin-token flag  (not provided)`);
    console.error(`    ${envAdminKey}  (not set in .env)\n`);
    console.error('  Either pass --admin-token TOKEN or add the token to your .env.');
    console.error('  See .env.admin.example for the admin template.\n');
    process.exit(1);
  }
}

// ── Policy definitions ──────────────────────────────────────────────────────

function generateToken(prefix) {
  return `${prefix}-${crypto.randomBytes(12).toString('hex')}`;
}

const POLICY_DEFS = {
  blog: {
    name: 'Blog Writer',
    icon: 'edit_note',
    description: 'Create and update blog posts and link categories.',
    permissions: [
      { collection: 'mkt_blog',                          action: 'create' },
      { collection: 'mkt_blog',                          action: 'read'   },
      { collection: 'mkt_blog',                          action: 'update' },
      { collection: 'mkt_blog_mkt_blog_categories',      action: 'create' },
      { collection: 'mkt_blog_mkt_blog_categories',      action: 'read'   },
    ],
  },
};

const API_TOOLS_ROLE_NAME = 'API Tools User';

// ── Helpers ─────────────────────────────────────────────────────────────────

async function findOrCreateRole(api, name, icon, description) {
  const resp = await api.fetch(`/roles?filter[name][_eq]=${encodeURIComponent(name)}&fields=id,name&limit=1`);
  if (resp.data && resp.data.length > 0) return { id: resp.data[0].id, created: false };

  const createResp = await api.fetch('/roles', {
    method: 'POST',
    body: { name, icon, description, app_access: false, admin_access: false }
  });
  return { id: createResp.data.id, created: true };
}

async function findOrCreatePolicy(api, policyKey) {
  const def = POLICY_DEFS[policyKey];
  const resp = await api.fetch(`/policies?filter[name][_eq]=${encodeURIComponent(def.name)}&fields=id,name&limit=1`);
  if (resp.data && resp.data.length > 0) return { id: resp.data[0].id, created: false };

  const createResp = await api.fetch('/policies', {
    method: 'POST',
    body: { name: def.name, icon: def.icon, description: def.description }
  });
  const policyId = createResp.data.id;

  // Create permissions
  const perms = def.permissions.map(p => ({
    collection: p.collection,
    action: p.action,
    fields: p.fields || ['*'],
    policy: policyId,
  }));
  await api.fetch('/permissions', { method: 'POST', body: perms });

  return { id: policyId, created: true };
}

async function checkExistingUser(api, email) {
  const resp = await api.fetch(`/users?filter[email][_eq]=${encodeURIComponent(email)}&fields=id,email,first_name,last_name,role&limit=1`);
  return resp.data && resp.data.length > 0 ? resp.data[0] : null;
}

async function getUserPolicies(api, userId) {
  const resp = await api.fetch(`/access?filter[user][_eq]=${userId}&fields=id,policy&limit=50`);
  if (!resp.data || resp.data.length === 0) return [];

  const policies = [];
  for (const access of resp.data) {
    try {
      const pResp = await api.fetch(`/policies/${access.policy}?fields=id,name`);
      policies.push({ accessId: access.id, policyId: pResp.data.id, policyName: pResp.data.name });
    } catch { /* policy may have been deleted */ }
  }
  return policies;
}

// ── Command: setup policies (default) ───────────────────────────────────────

async function cmdSetupPolicies(api, envName) {
  console.log('Setting up policies...\n');

  for (const [key, def] of Object.entries(POLICY_DEFS)) {
    if (dryRun) {
      console.log(`  [DRY RUN] Would ensure policy "${def.name}" with ${def.permissions.length} permissions`);
      continue;
    }
    const { id, created } = await findOrCreatePolicy(api, key);
    console.log(`  ${def.name}: ${created ? `created (${id})` : `exists (${id})`}`);
  }

  // Ensure the "API Tools User" role exists
  if (dryRun) {
    console.log(`  [DRY RUN] Would ensure role "${API_TOOLS_ROLE_NAME}"`);
  } else {
    const { id, created } = await findOrCreateRole(
      api,
      API_TOOLS_ROLE_NAME,
      'engineering',
      'Container role for per-person API tool users. Permissions come from user-level policies.'
    );
    console.log(`  ${API_TOOLS_ROLE_NAME} role: ${created ? `created (${id})` : `exists (${id})`}`);
  }

  console.log('\nPolicies are ready. Use --add-user to create team member accounts.\n');
}

// ── Command: add user ───────────────────────────────────────────────────────

async function cmdAddUser(api, envName) {
  if (!addUserEmail) {
    console.error('  --add-user requires an email address.\n');
    process.exit(1);
  }

  // Default to all policies (just "blog" today)
  const requestedPolicies = policiesArg
    ? policiesArg.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
    : Object.keys(POLICY_DEFS);

  // Validate policy names
  for (const p of requestedPolicies) {
    if (!POLICY_DEFS[p]) {
      console.error(`  Unknown policy: "${p}"`);
      console.error(`  Valid policies: ${Object.keys(POLICY_DEFS).join(', ')}\n`);
      process.exit(1);
    }
  }

  console.log(`Adding user: ${addUserEmail}`);
  console.log(`Policies: ${requestedPolicies.join(', ')}\n`);

  // Check if user already exists
  const existingUser = await checkExistingUser(api, addUserEmail);
  if (existingUser) {
    console.log(`  User already exists (${existingUser.id}).`);
    console.log('  Checking policies...\n');

    const currentPolicies = await getUserPolicies(api, existingUser.id);
    const currentNames = currentPolicies.map(p => p.policyName.toLowerCase());

    for (const pKey of requestedPolicies) {
      const def = POLICY_DEFS[pKey];
      if (currentNames.some(n => n.includes(pKey) || n === def.name.toLowerCase())) {
        console.log(`  ${def.name}: already attached`);
        continue;
      }

      // Ensure policy exists, then attach to user
      const { id: policyId } = await findOrCreatePolicy(api, pKey);
      if (dryRun) {
        console.log(`  [DRY RUN] Would attach "${def.name}" to user`);
      } else {
        await api.fetch('/access', { method: 'POST', body: { user: existingUser.id, policy: policyId } });
        console.log(`  ${def.name}: attached`);
      }
    }

    console.log(`\n  User's token is unchanged. They can find it in Directus admin -> their user profile.\n`);
    return;
  }

  // Ensure the container role exists
  const { id: roleId } = await findOrCreateRole(
    api,
    API_TOOLS_ROLE_NAME,
    'engineering',
    'Container role for per-person API tool users.'
  );

  // Derive a friendly name from email
  const emailPrefix = addUserEmail.split('@')[0];
  const nameParts = emailPrefix.replace(/[._-]/g, ' ').split(' ').filter(Boolean);
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'API';
  const lastName = nameParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'User';

  const token = generateToken('zblog-api');

  if (dryRun) {
    console.log(`  [DRY RUN] Would create user "${addUserEmail}" under role "${API_TOOLS_ROLE_NAME}"`);
    console.log(`  [DRY RUN] Would attach policies: ${requestedPolicies.join(', ')}`);
    console.log(`  [DRY RUN] Token env var: DIRECTUS_TOKEN_${envName.toUpperCase()}\n`);
    return;
  }

  // Create user
  const userResp = await api.fetch('/users', {
    method: 'POST',
    body: {
      email: addUserEmail,
      first_name: firstName,
      last_name: lastName,
      role: roleId,
      status: 'active',
      token: token,
    }
  });
  const userId = userResp.data.id;
  console.log(`  User created: ${userId}`);

  // Attach policies directly to user
  for (const pKey of requestedPolicies) {
    const { id: policyId } = await findOrCreatePolicy(api, pKey);
    await api.fetch('/access', { method: 'POST', body: { user: userId, policy: policyId } });
    console.log(`  Attached: ${POLICY_DEFS[pKey].name}`);
  }

  console.log(`\n  Token: ${token}`);
  console.log(`\n  Add to .env:`);
  console.log(`    DIRECTUS_TOKEN_${envName.toUpperCase()}=${token}\n`);
}

// ── Command: list users ─────────────────────────────────────────────────────

async function cmdListUsers(api) {
  // Find API-related roles (current + legacy)
  const allRoles = await api.fetch('/roles?fields=id,name&limit=50');
  const apiRoleIds = allRoles.data
    .filter(r => r.name.startsWith('API -') || r.name === API_TOOLS_ROLE_NAME)
    .map(r => r.id);

  if (apiRoleIds.length === 0) {
    console.log('  No API roles found. Run setup first.\n');
    return;
  }

  // Fetch users in those roles
  const usersResp = await api.fetch(
    `/users?filter[role][_in]=${apiRoleIds.join(',')}&fields=id,email,first_name,last_name,role,status&sort=email&limit=100`
  );

  if (!usersResp.data || usersResp.data.length === 0) {
    console.log('  No API users found.\n');
    return;
  }

  // Build role name map
  const roleMap = {};
  for (const r of allRoles.data) { roleMap[r.id] = r.name; }

  console.log(`Found ${usersResp.data.length} API user(s):\n`);

  for (const user of usersResp.data) {
    const roleName = roleMap[user.role] || user.role;
    const policies = await getUserPolicies(api, user.id);
    const policyList = policies.length > 0
      ? policies.map(p => p.policyName).join(', ')
      : '(none)';

    console.log(`  ${user.email}`);
    console.log(`    Name:     ${user.first_name} ${user.last_name}`);
    console.log(`    Status:   ${user.status}`);
    console.log(`    Role:     ${roleName}`);
    console.log(`    Policies: ${policyList}`);
    console.log();
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();
  const { url, envName } = resolveEnv();

  console.log(`\nEnvironment: ${envName} (${url})\n`);

  const api = createApiClient(url, adminToken);

  if (listUsers) {
    await cmdListUsers(api);
  } else if (addUserEmail) {
    await cmdAddUser(api, envName);
  } else {
    await cmdSetupPolicies(api, envName);
  }
}

main().catch(err => {
  console.error('\nError:', err.message);
  if (err.directusErrors) {
    for (const e of err.directusErrors) {
      console.error(`  ${e.message}`);
    }
  }
  process.exit(1);
});
