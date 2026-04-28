import { sleep, check } from 'k6';
import { config } from '../../utils/config.js';
import { makeGetRequest, makePostRequest } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp-up: sobe para 50
    { duration: '3m', target: 50 },   // Mantém 50 por 2 HORAS
    { duration: '1m', target: 0 },    // Ramp-down: desce para 0
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],    // Soak test é mais rigoroso
  },
};

export default function soakTest() {
  // Fluxo completo de usuário
  
  // GET posts
  const posts = makeGetRequest(`${config.baseUrl}/posts`);
  check(posts, { 'Soak - GET posts OK': (r) => r.status === 200 });
  
  sleep(2);
  
  // GET post específico
  const post = makeGetRequest(`${config.baseUrl}/posts/1`);
  check(post, { 'Soak - GET post OK': (r) => r.status === 200 });
  
  sleep(3);
  
  // POST novo post
  const newPost = {
    title: 'Soak Test Post',
    body: 'Teste de estabilidade',
    userId: 1,
  };
  
  const create = makePostRequest(`${config.baseUrl}/posts`, newPost);
  check(create, { 'Soak - POST OK': (r) => r.status === 201 });
  
  sleep(5); // Simula tempo leitura e navegação
}

export function handleSummary(data) {
  console.log('========================================');
  console.log('SOAK TEST - RESUMO (2 HORAS)');
  console.log('========================================');
  console.log('Requests totais:', data.metrics.http_reqs.values.count);
  console.log('Taxa de erro:', (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%');
  console.log('Tempo médio:', data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms');
  console.log('P95:', data.metrics.http_req_duration.values['p(95)'].toFixed(2) + 'ms');
  console.log('Degradação detectada?', 
    data.metrics.http_req_duration.values.avg > 300 ? 'SIM ⚠️' : 'NÃO ✅'
  );
  console.log('========================================');
  
  return {
    'reports/soak-test-summary.json': JSON.stringify(data),
  };
}