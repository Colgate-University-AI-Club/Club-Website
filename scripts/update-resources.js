#!/usr/bin/env node

/**
 * Resource Update Helper Script
 *
 * This script helps you manage resources in the Resources page.
 *
 * Usage:
 * - Add a resource: node scripts/update-resources.js add
 * - List all resources: node scripts/update-resources.js list
 * - Clear sample data: node scripts/update-resources.js clear
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const RESOURCES_FILE = path.join(__dirname, '..', 'app', 'data', 'resources.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function addResource() {
  console.log('\n📚 Add New Resource\n');

  const resource = {
    id: `res-${Date.now()}`,
    title: await question('Title: '),
    description: await question('Description: '),
    category: await selectCategory(),
    tags: (await question('Tags (comma-separated): ')).split(',').map(t => t.trim()),
    fileType: await question('File type (pdf, pptx, youtube, py, etc.): '),
    uploadedAt: new Date().toISOString()
  };

  // Handle different resource types
  if (resource.fileType === 'youtube') {
    resource.embedUrl = await question('YouTube URL: ');
  } else {
    const useGitHub = await question('Is the file in GitHub? (y/n): ');
    if (useGitHub.toLowerCase() === 'y') {
      resource.githubPath = await question('GitHub path (e.g., /presentations/file.pdf): ');
      resource.downloadUrl = `https://raw.githubusercontent.com/Colgate-University-AI-Club/Club-Resources/main${resource.githubPath}`;
      resource.fileSize = await question('File size (e.g., 2.3 MB): ');
    } else {
      resource.downloadUrl = await question('Download URL: ');
      resource.fileSize = await question('File size (optional): ');
    }
  }

  // Optional fields
  resource.author = await question('Author (optional): ') || undefined;
  resource.course = await question('Course (optional): ') || undefined;

  // Load existing resources
  const data = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf8'));

  // Add new resource
  data.resources.push(resource);
  data.lastUpdated = new Date().toISOString();

  // Save back
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify(data, null, 2));

  console.log('\n✅ Resource added successfully!');
  console.log(`ID: ${resource.id}`);
}

async function selectCategory() {
  const categories = ['presentation', 'document', 'video', 'template', 'dataset', 'code', 'other'];
  console.log('\nSelect category:');
  categories.forEach((cat, i) => console.log(`  ${i + 1}. ${cat}`));

  const choice = await question('Choice (1-7): ');
  return categories[parseInt(choice) - 1] || 'other';
}

function listResources() {
  const data = JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf8'));

  console.log('\n📚 Current Resources:\n');
  console.log(`Total: ${data.resources.length} resources\n`);

  data.resources.forEach(r => {
    console.log(`[${r.id}] ${r.title}`);
    console.log(`  Category: ${r.category}`);
    console.log(`  Tags: ${r.tags.join(', ')}`);
    console.log(`  Author: ${r.author || 'N/A'}`);
    console.log('');
  });
}

function clearSampleData() {
  const emptyData = {
    lastUpdated: new Date().toISOString(),
    resources: []
  };

  fs.writeFileSync(RESOURCES_FILE, JSON.stringify(emptyData, null, 2));
  console.log('\n✅ Sample data cleared. Resources page is now empty.');
}

async function main() {
  const command = process.argv[2];

  switch(command) {
    case 'add':
      await addResource();
      break;
    case 'list':
      listResources();
      break;
    case 'clear':
      clearSampleData();
      break;
    default:
      console.log(`
📚 Resource Manager

Commands:
  add    - Add a new resource
  list   - List all resources
  clear  - Clear all sample data

Example:
  node scripts/update-resources.js add
      `);
  }

  rl.close();
}

main().catch(console.error);