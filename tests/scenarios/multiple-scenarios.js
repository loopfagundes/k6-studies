import { sleep, check } from 'k6';
import http from 'k6/http';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const options = {
  scenarios: {
    // Cenário 1: Usuários navegando (leitura)
    readers: {
      executor: 'constant-vus',
      vus: 20,
      duration: '3m',
      exec: 'readPosts',  // Chama função específica
      tags: { scenario: 'readers' },
    },
    
    // Cenário 2: Usuários criando posts (escrita)
    writers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '1m', target: 0 },
      ],
      exec: 'createPosts',
      tags: { scenario: 'writers' },
    },
    
    // Cenário 3: Teste de stress pontual
    stress_spike: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 100,
      startTime: '1m',  // Começa depois de 1 minuto
      exec: 'stressPosts',
      tags: { scenario: 'stress' },
    },
  },
  
  thresholds: {
    'http_req_duration{scenario:readers}': ['p(95)<300'],
    'http_req_duration{scenario:writers}': ['p(95)<500'],
    'http_req_duration{scenario:stress}': ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

// Função 1: Leitores
export function readPosts() {
  const res = http.get(`${BASE_URL}/posts`);
  
  check(res, {
    'Readers - Status 200': (r) => r.status === 200,
  });
  
  sleep(2);
}

// Função 2: Escritores
export function createPosts() {
  const payload = JSON.stringify({
    title: 'Post by Writer',
    body: 'Testing multiple scenarios',
    userId: 1,
  });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const res = http.post(`${BASE_URL}/posts`, payload, params);
  
  check(res, {
    'Writers - Status 201': (r) => r.status === 201,
  });
  
  sleep(3);
}

// Função 3: Stress
export function stressPosts() {
  const res = http.get(`${BASE_URL}/posts`);
  
  check(res, {
    'Stress - Status 200': (r) => r.status === 200,
  });
  
  sleep(0.2); // Sleep curto para gerar mais carga
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('📊 MÚLTIPLOS SCENARIOS - RESUMO');
  console.log('========================================\n');
  
  console.log('🔹 Requests totais:', data.metrics.http_reqs.values.count);
  console.log('❌ Taxa de erro:', (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%');
  console.log('⏱️  Tempo médio geral:', data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms');
  
  console.log('\n📈 Por cenário:');
  console.log('   Readers P95:', data.metrics['http_req_duration{scenario:readers}']?.values['p(95)']?.toFixed(2) + 'ms');
  console.log('   Writers P95:', data.metrics['http_req_duration{scenario:writers}']?.values['p(95)']?.toFixed(2) + 'ms');
  console.log('   Stress P95:', data.metrics['http_req_duration{scenario:stress}']?.values['p(95)']?.toFixed(2) + 'ms');
  
  console.log('\n========================================\n');
  
  return {
    'reports/multiple-scenarios-summary.json': JSON.stringify(data, null, 2),
  };
}