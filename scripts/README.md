Admin seeding

This script inserts or updates admin users separately from the main `seed.js`.

Run from the project root (ensure your DB env vars are set):

```bash
node scripts/seed-admins.js
```

It will upsert the admin account(s) and set `adminLevel` and `mustChangePassword` where needed.
