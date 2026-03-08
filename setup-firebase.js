#!/usr/bin/env node
/**
 * EventForge Firebase Setup Helper
 * Run: node setup-firebase.js
 * 
 * Paste your firebaseConfig object when prompted and this script
 * will automatically write your .env file.
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\n🔥 EventForge Firebase Setup\n');
console.log('Paste your Firebase config below.');
console.log('It looks like this (from Firebase Console → Project Settings → Your Apps → SDK setup):');
console.log(`
  const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "yourproject.firebaseapp.com",
    projectId: "yourproject",
    storageBucket: "yourproject.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  };
`);
console.log('Paste the config now (press Enter twice when done):\n');

let input = '';
let emptyCount = 0;

rl.on('line', (line) => {
    if (line === '' && input.length > 0) {
        emptyCount++;
        if (emptyCount >= 1) {
            rl.close();
        }
    } else {
        emptyCount = 0;
        input += line + '\n';
    }
});

rl.on('close', () => {
    try {
        // Extract key-value pairs from pasted config
        const extract = (key) => {
            const match = input.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
            return match ? match[1] : '';
        };

        const config = {
            apiKey: extract('apiKey'),
            authDomain: extract('authDomain'),
            projectId: extract('projectId'),
            storageBucket: extract('storageBucket'),
            messagingSenderId: extract('messagingSenderId'),
            appId: extract('appId'),
        };

        const missing = Object.entries(config).filter(([, v]) => !v).map(([k]) => k);
        if (missing.length > 0) {
            console.error(`\n❌ Could not extract: ${missing.join(', ')}`);
            console.error('Make sure you pasted the full firebaseConfig object.\n');
            process.exit(1);
        }

        const envContent = `VITE_FIREBASE_API_KEY=${config.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}
VITE_FIREBASE_PROJECT_ID=${config.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
VITE_FIREBASE_APP_ID=${config.appId}
`;

        fs.writeFileSync('.env', envContent);
        console.log('\n✅ .env file written successfully!\n');
        console.log('Firebase Project:', config.projectId);
        console.log('\nNext steps:');
        console.log('1. Make sure Authentication is enabled (Email/Password + Google) in Firebase Console');
        console.log('2. Make sure Firestore Database is created in Firebase Console');
        console.log('3. Run: npm run dev');
        console.log('4. Open: http://localhost:5173\n');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
});
