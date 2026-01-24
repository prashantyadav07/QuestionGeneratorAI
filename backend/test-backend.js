#!/usr/bin/env node

/**
 * Backend Health Check Script
 * Run with: node test-backend.js
 */

import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

const tests = [
  {
    name: '✅ Server Health Check',
    test: async () => {
      const response = await axios.get(`${BACKEND_URL}/`);
      console.log(`Response: ${response.data}`);
      return response.status === 200;
    }
  },
  {
    name: '✅ Text Generation Test',
    test: async () => {
      const response = await axios.post(`${BACKEND_URL}/api/pdf/generate-from-text`, {
        text: 'Artificial Intelligence is transforming industries. Machine Learning enables systems to learn from data. Deep Learning uses neural networks.',
        questionCount: 3
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`Generated Questions: ${response.data.data.questions.length}`);
      console.log(`First Question: ${response.data.data.questions[0]?.questionText?.substring(0, 50)}...`);
      return response.status === 201 && response.data.success;
    }
  },
  {
    name: '✅ Question Retrieval Test',
    test: async () => {
      // First get a topic ID from generation
      const genResponse = await axios.post(`${BACKEND_URL}/api/pdf/generate-from-text`, {
        text: 'Cloud computing provides on-demand services over the internet.',
        questionCount: 2
      });
      
      const topicId = genResponse.data.data.topic._id;
      const response = await axios.get(`${BACKEND_URL}/api/questions/topic/${topicId}`);
      
      console.log(`Retrieved ${response.data.data.questions.length} questions for topic ${topicId}`);
      return response.status === 200 && Array.isArray(response.data.data.questions);
    }
  }
];

async function runTests() {
  console.log('\n🔍 BACKEND HEALTH CHECK\n');
  console.log(`Testing: ${BACKEND_URL}\n`);
  
  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      console.log(`Running: ${name}`);
      const result = await test();
      if (result) {
        console.log(`✅ PASSED\n`);
        passed++;
      } else {
        console.log(`❌ FAILED\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
