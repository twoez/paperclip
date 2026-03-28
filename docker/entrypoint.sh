#!/bin/sh
set -e

# Clean up any invalid OpenCode config from previous versions
OPENCODE_CONFIG="${HOME}/.config/opencode/opencode.json"
if [ -f "$OPENCODE_CONFIG" ] && grep -q '"enabled"' "$OPENCODE_CONFIG" 2>/dev/null; then
  rm -f "$OPENCODE_CONFIG"
  echo "Removed invalid OpenCode config at $OPENCODE_CONFIG"
fi

# Auto-bootstrap CEO invite on first run in authenticated mode
if [ "$PAPERCLIP_DEPLOYMENT_MODE" = "authenticated" ]; then
  BOOTSTRAP_FLAG="${PAPERCLIP_HOME:-.}/.bootstrap-done"
  if [ ! -f "$BOOTSTRAP_FLAG" ]; then
    # Wait for DB to be ready, then check if admin exists and create invite if not
    node --input-type=module --import ./server/node_modules/tsx/dist/loader.mjs -e "
import { createHash, randomBytes } from 'node:crypto';
import { createDb, invites, instanceUserRoles } from '@paperclipai/db';
import { eq } from 'drizzle-orm';

const db = createDb(process.env.DATABASE_URL);
const admins = await db.select().from(instanceUserRoles).where(eq(instanceUserRoles.role, 'instance_admin'));
if (admins.length > 0) {
  console.log('[bootstrap] Instance admin already exists, skipping.');
  process.exit(0);
}

const token = 'pcp_bootstrap_' + randomBytes(24).toString('hex');
const tokenHash = createHash('sha256').update(token).digest('hex');
await db.insert(invites).values({
  inviteType: 'bootstrap_ceo',
  tokenHash,
  allowedJoinTypes: 'human',
  expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
  invitedByUserId: 'system',
}).returning();

const baseUrl = process.env.PAPERCLIP_PUBLIC_URL || 'http://localhost:3100';
const url = baseUrl + '/invite/' + token;
console.log('');
console.log('========================================');
console.log('  FIRST-TIME SETUP');
console.log('  Open this URL to create your admin account:');
console.log('  ' + url);
console.log('  Expires in 72 hours.');
console.log('========================================');
console.log('');
process.exit(0);
" 2>&1 && touch "$BOOTSTRAP_FLAG" || echo "[bootstrap] Warning: could not create bootstrap invite"
  fi
fi

exec "$@"
