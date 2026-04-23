import { sleep, check } from 'k6';
import { config } from '../../utils/config.js';
import { makeGetRequest } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Sobe para 20
    { duration: '30s', target: 40 },   // Sobe para 40
    { duration: '30s', target: 60 },   // Sobe para 60 (STRESS!)
    { duration: '30s', target: 0 },    // Desce para 0
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.2'],
  },
};

export default function stressTest() {
  const posts = makeGetRequest(`${config.baseUrl}/posts`);
  
  check(posts, {
    'Stress - Status 200': (r) => r.status === 200,
    'Stress - Tempo < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('STRESS TEST - RESUMO');
  console.log('========================================\n');
  console.log('Requests totais:', data.metrics.http_reqs.values.count);
  console.log('Taxa de erro:', (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%');
  console.log('Tempo médio:', data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms');
  console.log('P95:', data.metrics.http_req_duration.values['p(95)'].toFixed(2) + 'ms');
  console.log('Max:', data.metrics.http_req_duration.values.max.toFixed(2) + 'ms');
  console.log('\n========================================\n');
  
  return {
    'reports/stress-test-summary.json': JSON.stringify(data, null, 2),
  };
}