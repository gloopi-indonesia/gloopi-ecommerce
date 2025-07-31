#!/usr/bin/env node

/**
 * Automated Unused Variables Fixer
 * 
 * This script helps fix unused variable warnings by adding underscore prefixes
 * to variables that are intentionally unused.
 * 
 * Usage: node scripts/fix-unused-vars.js [file-pattern]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getUnusedVarWarnings() {
  try {
    const output = execSync('bun run lint', { encoding: 'utf8', cwd: process.cwd() });
    return output;
  } catch (error) {
    return error.stdout || error.message;
  }
}

function parseUnusedVarWarnings(lintOutput) {
  const warnings = [];
  const lines = lintOutput.split('\n');

  let currentFile = '';
  let currentApp = '';

  for (const line of lines) {
    // Detect app context (gloopi-admin:lint: or gloopi-storefront:lint:)
    const appMatch = line.match(/^(gloopi-\w+):lint:\s*(.*)$/);
    if (appMatch) {
      currentApp = appMatch[1];
      const content = appMatch[2].trim();

      // Check if this line contains a file path
      if (content.startsWith('./')) {
        currentFile = content;
        continue;
      }

      // Look for unused variable warnings
      const warningMatch = content.match(/^(\d+):(\d+)\s+Warning:\s+'([^']+)'\s+is\s+(defined but never used|assigned a value but never used|assigned a value but only used as a type)/);
      if (warningMatch && content.includes('@typescript-eslint/no-unused-vars')) {
        const [, lineNum, col, varName] = warningMatch;
        warnings.push({
          app: currentApp,
          file: currentFile,
          line: parseInt(lineNum),
          column: parseInt(col),
          variable: varName.trim()
        });
      }
      continue;
    }

    // Fallback: Detect file paths without app prefix
    if (line.startsWith('./')) {
      currentFile = line.trim();
      continue;
    }

    // Fallback: Look for unused variable warnings without app prefix
    const warningMatch = line.match(/^\s*(\d+):(\d+)\s+Warning:\s+'([^']+)'\s+is\s+(defined but never used|assigned a value but never used|assigned a value but only used as a type)/);
    if (warningMatch && line.includes('@typescript-eslint/no-unused-vars')) {
      const [, lineNum, col, varName] = warningMatch;
      warnings.push({
        app: currentApp || 'unknown',
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(col),
        variable: varName.trim()
      });
    }
  }

  return warnings;
}

function suggestFixes(warnings) {
  const suggestions = {};

  warnings.forEach(warning => {
    const fileKey = `${warning.app}:${warning.file}`;
    if (!suggestions[fileKey]) {
      suggestions[fileKey] = [];
    }

    // Skip if already has underscore prefix
    if (!warning.variable.startsWith('_')) {
      suggestions[fileKey].push({
        line: warning.line,
        variable: warning.variable,
        suggestion: `_${warning.variable}`
      });
    }
  });

  return suggestions;
}

function displaySuggestions(suggestions) {
  console.log('🔧 Unused Variable Fix Suggestions');
  console.log('='.repeat(50));
  console.log('The following variables could be prefixed with underscore to indicate');
  console.log('they are intentionally unused:\n');

  Object.entries(suggestions).forEach(([file, fileSuggestions]) => {
    if (fileSuggestions.length > 0) {
      console.log(`📁 ${file}`);
      fileSuggestions.forEach(suggestion => {
        console.log(`  Line ${suggestion.line}: ${suggestion.variable} → ${suggestion.suggestion}`);
      });
      console.log('');
    }
  });

  console.log('💡 To fix these automatically:');
  console.log('1. Review each suggestion to ensure the variable is truly unused');
  console.log('2. Manually rename variables you want to keep as "unused"');
  console.log('3. Remove variables that are actually needed');
  console.log('4. For catch blocks, consider using just "catch (_)" if error is unused');
}

function generateQuickFixGuide() {
  const guide = `
# Quick Fix Guide for Common ESLint Warnings

## Unused Variables (@typescript-eslint/no-unused-vars)

### For intentionally unused variables:
\`\`\`typescript
// Before
const { data, error } = useQuery();

// After (if error is intentionally unused)
const { data, _error } = useQuery();
\`\`\`

### For function parameters:
\`\`\`typescript
// Before
function handler(req, res) {
  // only using res
}

// After
function handler(_req, res) {
  // only using res
}
\`\`\`

### For catch blocks:
\`\`\`typescript
// Before
try {
  // code
} catch (error) {
  // not using error
}

// After
try {
  // code
} catch (_error) {
  // or just catch (_)
}
\`\`\`

## Empty Object Types (@typescript-eslint/no-empty-object-type)

\`\`\`typescript
// Before
interface Props extends React.ComponentProps<'div'> {}

// After
type Props = React.ComponentProps<'div'>
\`\`\`

## Prefer Const (prefer-const)

\`\`\`typescript
// Before
let value = 'hello';

// After
const value = 'hello';
\`\`\`

## Next.js Image Optimization (@next/next/no-img-element)

\`\`\`typescript
// Before
<img src="/image.jpg" alt="Description" />

// After
import Image from 'next/image'
<Image src="/image.jpg" alt="Description" width={500} height={300} />
\`\`\`
`;

  fs.writeFileSync(path.join(process.cwd(), 'LINT_FIXES.md'), guide);
  console.log('📖 Quick fix guide saved to LINT_FIXES.md');
}

function main() {
  console.log('🔍 Analyzing unused variable warnings...\n');

  const lintOutput = getUnusedVarWarnings();
  const warnings = parseUnusedVarWarnings(lintOutput);
  const suggestions = suggestFixes(warnings);

  if (Object.keys(suggestions).length === 0) {
    console.log('✅ No unused variable warnings found that can be auto-fixed!');
    return;
  }

  displaySuggestions(suggestions);
  generateQuickFixGuide();
}

if (require.main === module) {
  main();
}

module.exports = { parseUnusedVarWarnings, suggestFixes };
