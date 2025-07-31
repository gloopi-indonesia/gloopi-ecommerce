#!/usr/bin/env node

/**
 * ESLint Warning Analysis Script
 * 
 * This script analyzes ESLint output to categorize warnings and track progress.
 * Run with: node scripts/lint-analysis.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Warning categories for prioritization
const WARNING_CATEGORIES = {
  'unused-vars': {
    patterns: ['@typescript-eslint/no-unused-vars'],
    priority: 'low',
    description: 'Unused variables, imports, or parameters'
  },
  'empty-interfaces': {
    patterns: ['@typescript-eslint/no-empty-object-type'],
    priority: 'low',
    description: 'Empty interfaces that could be simplified'
  },
  'code-quality': {
    patterns: ['prefer-const', 'no-unsafe-optional-chaining'],
    priority: 'medium',
    description: 'Code quality improvements'
  },
  'typescript-issues': {
    patterns: ['@typescript-eslint/no-unused-expressions', '@typescript-eslint/ban-ts-comment'],
    priority: 'medium',
    description: 'TypeScript-specific issues'
  },
  'nextjs-optimization': {
    patterns: ['@next/next/no-img-element'],
    priority: 'high',
    description: 'Next.js performance optimizations'
  }
};

function runLint() {
  try {
    console.log('🔍 Running ESLint analysis...\n');
    const output = execSync('bun run lint', { encoding: 'utf8', cwd: process.cwd() });
    return output;
  } catch (error) {
    // ESLint returns non-zero exit code when warnings are found
    return error.stdout || error.message;
  }
}

function parseWarnings(lintOutput) {
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

      // Parse warning lines (format: "line:col  Warning: message  rule-name")
      const warningMatch = content.match(/^(\d+):(\d+)\s+Warning:\s+(.+?)\s+([^\s]+)$/);
      if (warningMatch) {
        const [, lineNum, col, message, rule] = warningMatch;
        warnings.push({
          app: currentApp,
          file: currentFile,
          line: parseInt(lineNum),
          column: parseInt(col),
          message: message.trim(),
          rule: rule.trim()
        });
      }
      continue;
    }

    // Fallback: Detect file paths without app prefix
    if (line.startsWith('./')) {
      currentFile = line.trim();
      continue;
    }

    // Fallback: Parse warning lines without app prefix
    const warningMatch = line.match(/^\s*(\d+):(\d+)\s+Warning:\s+(.+?)\s+([^\s]+)$/);
    if (warningMatch) {
      const [, lineNum, col, message, rule] = warningMatch;
      warnings.push({
        app: currentApp || 'unknown',
        file: currentFile,
        line: parseInt(lineNum),
        column: parseInt(col),
        message: message.trim(),
        rule: rule.trim()
      });
    }
  }

  return warnings;
}

function categorizeWarnings(warnings) {
  const categorized = {};
  const uncategorized = [];

  // Initialize categories
  Object.keys(WARNING_CATEGORIES).forEach(category => {
    categorized[category] = [];
  });

  warnings.forEach(warning => {
    let categorized_flag = false;

    for (const [categoryName, categoryInfo] of Object.entries(WARNING_CATEGORIES)) {
      if (categoryInfo.patterns.some(pattern => warning.rule.includes(pattern))) {
        categorized[categoryName].push(warning);
        categorized_flag = true;
        break;
      }
    }

    if (!categorized_flag) {
      uncategorized.push(warning);
    }
  });

  return { categorized, uncategorized };
}

function generateReport(warnings, categorizedWarnings) {
  const totalWarnings = warnings.length;

  console.log('📊 ESLint Warning Analysis Report');
  console.log('='.repeat(50));
  console.log(`Total warnings: ${totalWarnings}\n`);

  // Category breakdown
  console.log('📋 Warnings by Category:');
  console.log('-'.repeat(30));

  Object.entries(categorizedWarnings.categorized).forEach(([category, categoryWarnings]) => {
    if (categoryWarnings.length > 0) {
      const categoryInfo = WARNING_CATEGORIES[category];
      const percentage = ((categoryWarnings.length / totalWarnings) * 100).toFixed(1);

      console.log(`${category.toUpperCase()} (${categoryInfo.priority} priority)`);
      console.log(`  Count: ${categoryWarnings.length} (${percentage}%)`);
      console.log(`  Description: ${categoryInfo.description}`);
      console.log('');
    }
  });

  if (categorizedWarnings.uncategorized.length > 0) {
    console.log(`UNCATEGORIZED`);
    console.log(`  Count: ${categorizedWarnings.uncategorized.length}`);
    console.log('');
  }

  // App breakdown
  const appWarnings = {};
  warnings.forEach(warning => {
    if (!appWarnings[warning.app]) {
      appWarnings[warning.app] = 0;
    }
    appWarnings[warning.app]++;
  });

  console.log('🏢 Warnings by App:');
  console.log('-'.repeat(20));
  Object.entries(appWarnings).forEach(([app, count]) => {
    const percentage = ((count / totalWarnings) * 100).toFixed(1);
    console.log(`  ${app}: ${count} warnings (${percentage}%)`);
  });
  console.log('');

  // File breakdown
  const fileWarnings = {};
  warnings.forEach(warning => {
    const fileKey = `${warning.app}:${warning.file}`;
    if (!fileWarnings[fileKey]) {
      fileWarnings[fileKey] = 0;
    }
    fileWarnings[fileKey]++;
  });

  console.log('📁 Top 10 Files with Most Warnings:');
  console.log('-'.repeat(40));

  Object.entries(fileWarnings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count]) => {
      console.log(`  ${count.toString().padStart(3)} warnings: ${file}`);
    });

  console.log('\n💡 Recommendations:');
  console.log('-'.repeat(20));
  console.log('1. Start with high-priority warnings (Next.js optimizations)');
  console.log('2. Focus on files with the most warnings for maximum impact');
  console.log('3. Use underscore prefix (_variable) for intentionally unused vars');
  console.log('4. Consider upgrading to Next.js 15 for better ESLint 9 support');

  return {
    totalWarnings,
    categorizedWarnings,
    fileWarnings
  };
}

function saveReport(reportData) {
  const reportPath = path.join(process.cwd(), 'lint-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    ...reportData
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Main execution
function main() {
  const lintOutput = runLint();
  const warnings = parseWarnings(lintOutput);
  const categorizedWarnings = categorizeWarnings(warnings);
  const reportData = generateReport(warnings, categorizedWarnings);

  saveReport(reportData);
}

if (require.main === module) {
  main();
}

module.exports = { parseWarnings, categorizeWarnings, generateReport };
