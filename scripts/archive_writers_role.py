#!/usr/bin/env python3
"""
Drop the six suspended *-archived-20260521@ accounts out of the
setup_roles.js --list-users output WITHOUT deleting anything.

scripts/setup_roles.js lists users by ROLE:

    allRoles.filter(r => r.name.startsWith('API -') || r.name === 'API Tools User')

so clearing a suspended account's role removes it from the listing while
leaving the user record, its policy attachments, and every audit-trail
reference untouched.

Fully reversible. Before writing, the current role of each account is saved
to archived_writers_roles.json next to this script; --restore puts them back.

Run:  python3 archive_writers_role.py            # dry run, shows the plan
      python3 archive_writers_role.py --apply    # clear the roles
      python3 archive_writers_role.py --restore  # put them back
"""

import json
import pathlib
import sys
import urllib.error
import urllib.request

APPLY = "--apply" in sys.argv
RESTORE = "--restore" in sys.argv
PATTERN = "archived-20260521"

HERE = pathlib.Path(__file__).resolve().parent
BACKUP = HERE / "archived_writers_roles.json"

ENV_PATH = pathlib.Path.home() / "zspace" / "blog-generation" / ".env"
if not ENV_PATH.exists():
    ENV_PATH = pathlib.Path.cwd() / ".env"

env = {}
for line in ENV_PATH.read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

URL = env["DIRECTUS_URL_PRODUCTION"]
ADMIN = env["DIRECTUS_ADMIN_TOKEN_PRODUCTION"]


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        URL + path, data=data, method=method,
        headers={"Authorization": f"Bearer {ADMIN}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read()
            return json.loads(txt).get("data") if txt.strip() else None
    except urllib.error.HTTPError as e:
        raise SystemExit(f"FAILED {method} {path}: {e.code} {e.read()[:250].decode(errors='replace')}")


# ---- restore -------------------------------------------------------------
if RESTORE:
    if not BACKUP.exists():
        raise SystemExit(f"No backup at {BACKUP} - nothing to restore.")
    saved = json.loads(BACKUP.read_text())
    print(f"[RESTORE] {URL}\n")
    for row in saved:
        call("PATCH", f"/users/{row['id']}", {"role": row["role"]})
        print(f"  restored {row['email']} -> role {row['role']}")
    print("\nDone. Re-run setup_roles.js --list-users to confirm they are back.")
    raise SystemExit(0)

# ---- plan ----------------------------------------------------------------
mode = "APPLY" if APPLY else "DRY RUN"
print(f"[{mode}] {URL}\n")

users = call("GET", f"/users?filter[email][_contains]={PATTERN}&fields=id,email,status,role&limit=100")
roles = {r["id"]: r["name"] for r in call("GET", "/roles?fields=id,name&limit=100")}

safe, blocked = [], []
for u in users:
    if PATTERN not in u["email"]:
        blocked.append((u, "email does not match the archived pattern"))
    elif u["status"] != "suspended":
        blocked.append((u, f"status is '{u['status']}', expected 'suspended'"))
    elif u.get("role") is None:
        blocked.append((u, "role is already cleared - nothing to do"))
    else:
        safe.append(u)

for u in safe:
    print(f"  CLEAR    {u['email']:<52} role={roles.get(u['role'], u['role'])}")
for u, why in blocked:
    print(f"  SKIP     {u['email']:<52} {why}")

if not safe:
    raise SystemExit("\nNothing to do.")

if not APPLY:
    print(f"\nWould clear the role on {len(safe)} account(s) and save a restore file to:")
    print(f"  {BACKUP}")
    print("\nNothing was written. Re-run with --apply.")
    raise SystemExit(0)

# ---- apply ---------------------------------------------------------------
backup = [{"id": u["id"], "email": u["email"], "role": u["role"],
           "role_name": roles.get(u["role"])} for u in safe]
BACKUP.write_text(json.dumps(backup, indent=2))
print(f"\nRestore file written: {BACKUP}")
print(json.dumps(backup, indent=2))

print()
for u in safe:
    call("PATCH", f"/users/{u['id']}", {"role": None})
    print(f"  cleared role on {u['email']}")

print("\nDone. Reverse at any time with:  python3 archive_writers_role.py --restore")
