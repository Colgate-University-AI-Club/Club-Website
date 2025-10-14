#!/usr/bin/env node

/**
 * Test script to simulate n8n webhook response and test local API integration
 */

const http = require('http');

// Mock articles that simulate what n8n should return
const mockArticles = [
  {
    "url": "https://example.com/ai-breakthrough-2025",
    "title": "Major AI Breakthrough Announced by Research Team",
    "published_date": "Thu, 03 Oct 2025 18:30:00 GMT",
    "content": "# Major AI Breakthrough Announced by Research Team\n\nResearchers at a leading university have announced a significant breakthrough in artificial intelligence that could revolutionize how we approach machine learning. The new approach demonstrates unprecedented efficiency in training large language models while reducing computational requirements by 40%.\n\nThe research team, led by Dr. Sarah Chen, has been working on this project for over two years. Their findings suggest that current AI training methods could be significantly optimized using novel mathematical approaches.\n\n\"This breakthrough represents a paradigm shift in how we think about AI training,\" said Dr. Chen. \"We're essentially doing more with less, which has huge implications for both research institutions and commercial applications.\"\n\nThe paper will be published in the upcoming issue of Nature Machine Intelligence.",
    "card_summary": "Researchers announce a breakthrough in AI training that reduces computational requirements by 40% while improving efficiency, potentially revolutionizing machine learning approaches."
  },
  {
    "url": "https://techcrunch.com/2025/10/03/startup-funding-ai",
    "title": "AI Startup Raises $50M Series A for Revolutionary Computer Vision Platform",
    "published_date": "Thu, 03 Oct 2025 16:15:00 GMT",
    "content": "# AI Startup Raises $50M Series A for Revolutionary Computer Vision Platform\n\nVisionAI, a promising startup in the computer vision space, has successfully closed a $50 million Series A funding round led by Andreessen Horowitz. The company's platform uses advanced neural networks to provide real-time object detection and analysis for industrial applications.\n\nThe funding will be used to expand the team and accelerate product development. VisionAI's technology is already being used by several Fortune 500 companies in manufacturing and logistics.\n\n\"Computer vision is at an inflection point,\" said CEO Michael Rodriguez. \"Our platform can process visual data 10x faster than existing solutions while maintaining 99.5% accuracy rates.\"\n\nThe company plans to launch its enterprise platform publicly in Q1 2026.",
    "card_summary": "VisionAI secures $50M Series A funding for its computer vision platform that offers 10x faster processing speeds with 99.5% accuracy for industrial applications."
  }
];

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

    const req = http.request(options, (res) => {
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
            console.log('✅ Articles processed successfully');
            resolve({});
          }
        } else {
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
    console.log('🧪 Testing news sync with mock articles...');
    console.log(`📊 Sending ${mockArticles.length} mock articles to API...`);

    await sendArticlesToAPI(mockArticles);
    console.log('🎉 Test completed successfully!');
    console.log('💡 You can now view the articles at http://localhost:3001/news');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}