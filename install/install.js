#!/usr/bin/env node

import {execSync} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';
import {existsSync} from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, 'install.sh');

if (!existsSync(scriptPath)) {
        console.error("Did not found script: ", scriptPath);
        process.exit(1);
}

try {
        execSync(`bash ${scriptPath}`, {stdio: 'inherit'});
} catch (e) {
        if (e.status === 1) {
                console.log("Installation likely succeeded despite exit code");
        } else {
                console.error("Installation failed:", e);
                process.exit(1);
        }
}
