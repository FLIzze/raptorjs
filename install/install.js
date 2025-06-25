#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, 'install.sh');

if (!existsSync(scriptPath)) {
  console.error("Script introuvable :", scriptPath);
  process.exit(1);
}

execSync(`bash ${scriptPath}`, { stdio: 'inherit' });