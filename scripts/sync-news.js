#!/usr/bin/env node

/**
 * Script to trigger n8n workflow and sync news articles
 * Usage: node scripts/sync-news.js
 */

const https = require('https');

const N8N_WEBHOOK_URL = 'https://seabass34.app.n8n.cloud/webhook/e72f4374-f5b6-4dc8-9e75-29d942960d23';

async function triggerN8NWorkflow() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(N8N_WEBHOOK_URL, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const articles = JSON.parse(data);
            if (Array.isArray(articles) && articles.length > 0) {
              console.log(`✅ Successfully received ${articles.length} articles from n8n`);
              resolve(articles);
            } else {
              console.log('✅ n8n workflow triggered successfully (no articles returned)');
              resolve([]);
            }
          } catch (error) {
            console.log('✅ n8n workflow triggered successfully');
            resolve([]);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Send empty body to trigger the workflow
    req.write(JSON.stringify({}));
    req.end();
  });
}

async function sendArticlesToAPI(articles) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(articles);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/news',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = require('http').request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(responseData);
            console.log(`📰 ${result.message}`);
            resolve(result);
          } catch (error) {
            if (responseData) {
              console.log(`📰 Response: ${responseData}`);
            }
            console.log('✅ Articles processed successfully');
            resolve({});
          }
        } else {
          console.log(`❌ API Error - Status: ${res.statusCode}, Response: ${responseData}`);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Triggering n8n workflow...');
    const articles = await triggerN8NWorkflow();

    if (articles.length > 0) {
      console.log('📊 Debug - First article structure:', JSON.stringify(articles[0], null, 2));
      console.log('📤 Sending articles to local API...');
      await sendArticlesToAPI(articles);
      console.log('🎉 News sync completed successfully!');
    } else {
      console.log('✅ Workflow triggered - no new articles to process');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}