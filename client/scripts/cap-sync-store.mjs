import { spawnSync } from 'node:child_process';

process.env.STORE_BUILD = 'true';

const result = spawnSync('npx', ['cap', 'sync'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
