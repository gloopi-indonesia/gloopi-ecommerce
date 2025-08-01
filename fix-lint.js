#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of common unused variable fixes
const fixes = [
    // Change unused catch errors
    {
        pattern: /} catch \(error: any\) \{/g,
        replacement: '} catch (_error: any) {'
    },
    // Change unused parameters
    {
        pattern: /\(\{ ([^}]+) \}\) => \{/g,
        replacement: (match, params) => {
            const paramList = params.split(',').map(p => p.trim());
            const prefixed = paramList.map(p => p.startsWith('_') ? p : `_${p}`);
            return `({ ${prefixed.join(', ')} }) => {`;
        }
    }
];

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        fixes.forEach(fix => {
            const oldContent = content;
            if (typeof fix.replacement === 'function') {
                content = content.replace(fix.pattern, fix.replacement);
            } else {
                content = content.replace(fix.pattern, fix.replacement);
            }
            if (content !== oldContent) {
                changed = true;
            }
        });

        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Fixed: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
    }
}

// Get all TypeScript files in apps directory
function findTsFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            files = files.concat(findTsFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }

    return files;
}

const appsDir = path.join(__dirname, 'apps');
const tsFiles = findTsFiles(appsDir);

console.log(`Found ${tsFiles.length} TypeScript files`);
tsFiles.forEach(fixFile);
