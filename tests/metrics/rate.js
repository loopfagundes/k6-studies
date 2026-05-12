import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// 📊 Criando Rates customizados
const successRate = new Rate('success_rate');
const postCreationRate = new Rate('post_creation_rate');
const fastResponseRate = new Rate('fast_response_rate');  // < 200ms

export const options = {
  scenarios: {
    rate_test: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
    },
  },
  thresholds: {
    'success_rate': ['rate>0.95'],           // 95% de sucesso
    'post_creation_rate': ['rate>0.90'],     // 90% dos posts criados
    'fast_response_rate': ['rate>0.80'],     // 80% abaixo de 200ms
  },
};

export default function rateTest() {
  // GET - Listar posts
  const listRes = http.get(`${BASE_URL}/posts`);
  
  // Verifica se foi rápido (< 200ms)
  fastResponseRate.add(listRes.timings.duration < 200);
  
  // Verifica se foi sucesso
  const listSuccess = check(listRes, {
    'GET - Status 200': (r) => r.status === 200,
  });
  
  successRate.add(listSuccess);  // true = 1, false = 0
  
  sleep(1);
  
  // POST - Criar post
  const payload = JSON.stringify({
    title: `Post VU${__VU}`,
    body: 'Testing rates',
    userId: 1,
  });
  
  const headers = { 'Content-Type': 'application/json' };
  const createRes = http.post(`${BASE_URL}/posts`, payload, { headers });
  
  // Taxa de criação de posts
  const postCreated = createRes.status === 201;
  postCreationRate.add(postCreated);
  
  // Taxa geral de sucesso
  successRate.add(postCreated);
  
  console.log(`📊 VU${__VU} - Success: ${listSuccess && postCreated ? '✅' : '❌'}`);
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('📊 RATE METRICS - RESUMO');
  console.log('========================================\n');
  console.log('✅ Taxa de sucesso geral:', (data.metrics.success_rate.values.rate * 100).toFixed(2) + '%');
  console.log('📝 Taxa de criação de posts:', (data.metrics.post_creation_rate.values.rate * 100).toFixed(2) + '%');
  console.log('⚡ Taxa de respostas rápidas (<200ms):', (data.metrics.fast_response_rate.values.rate * 100).toFixed(2) + '%');
  console.log('\n========================================\n');
  
  return {
    'reports/rate-metrics-summary.json': JSON.stringify(data, null, 2),
  };
}