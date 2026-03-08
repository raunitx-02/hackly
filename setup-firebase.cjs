#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\n🔥 EventForge Firebase Setup\n');
console.log('Paste your firebaseConfig below (from Firebase Console → Project Settings → Your Apps)');
console.log('Press Enter twice when done:\n');

let input = '';
let emptyLineCount = 0;

rl.on('line', (line) => {
    if (line.trim() === '' && input.length > 0) {
        emptyLineCount++;
        if (emptyLineCount >= 1) { rl.close(); return; }
    } else {
        emptyLineCount = 0;
    }
    input += line + '\n';
});

rl.on('close', () => {
    const extract = (key) => {
        const m = input.match(new RegExp(key + ':\\s*["\']([^"\']+)["\']'));
        return m ? m[1] : '';
    };

    const cfg = {
        apiKey: extract('apiKey'),
        authDomain: extract('authDomain'),
        projectId: extract('projectId'),
        storageBucket: extract('storageBucket'),
        messagingSenderId: extract('messagingSenderId'),
        appId: extract('appId'),
    };

    const missing = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
        console.error('\n❌ Could not find: ' + missing.join(', '));
        console.error('Make sure you pasted the full firebaseConfig object.\n');
        process.exit(1);
    }

    const env = `VITE_FIREBASE_API_KEY=${cfg.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${cfg.authDomain}
VITE_FIREBASE_PROJECT_ID=${cfg.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${cfg.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${cfg.messagingSenderId}
VITE_FIREBASE_APP_ID=${cfg.appId}
`;

    fs.writeFileSync('.env', env);
    console.log('\n✅ .env written! Firebase project: ' + cfg.projectId);
    console.log('\nNow run:  npm run dev');
    console.log('Then open: http://localhost:5173\n');
});
