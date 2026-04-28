import { sleep, check } from 'k6';
import { config } from '../../utils/config.js';
import { makeGetRequest } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Normal: 10 usuários
    { duration: '30s', target: 500 },  // SPIKE! Sobe para 500 em 30s
    { duration: '1m', target: 500 },   // Mantém 500 por 1min
    { duration: '30s', target: 10 },   // Volta para 10 em 30s
    { duration: '1m', target: 10 },    // Mantém normal
    { duration: '30s', target: 600 },  // SPIKE 2! Ainda maior
    { duration: '1m', target: 600 },   // Mantém 600
    { duration: '30s', target: 10 },   // Recovery
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Durante spike aceita até 2s
    http_req_failed: ['rate<0.25'],     // Aceita até 25% de erro no spike
  },
};

export default function spikeTest() {
  const posts = makeGetRequest(`${config.baseUrl}/posts`);
  
  check(posts, {
    'Spike - Status 200': (r) => r.status === 200,
    'Spike - Sistema respondeu': (r) => r.status !== 0,
  });
  
  sleep(0.5); // Sleep menor para simular tráfego intenso
}

export function handleSummary(data) {
  console.log('========================================');
  console.log('SPIKE TEST - RESUMO');
  console.log('========================================');
  console.log('Requests totais:', data.metrics.http_reqs.values.count);
  console.log('Taxa de erro:', (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%');
  console.log('P99 (pior caso):', data.metrics.http_req_duration.values['p(99)'].toFixed(2) + 'ms');
  console.log('Max:', data.metrics.http_req_duration.values.max.toFixed(2) + 'ms');
  console.log('========================================');
  
  return {
    'reports/spike-test-summary.json': JSON.stringify(data),
  };
}