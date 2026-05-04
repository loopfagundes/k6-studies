import { sleep, check } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    per_vu_scenario: {
      executor: 'per-vu-iterations',
      vus: 10,              // 10 VUs
      iterations: 5,        // Cada VU faz 5 iterações
      maxDuration: '1m',    // Timeout máximo
    },
  },
};

export default function perVuTest() {
  console.log(`VU ${__VU} - Iteração ${__ITER}`);
  
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  
  check(res, {
    'Per-VU - Status 200': (r) => r.status === 200,
  });
  
  sleep(0.5);
}

// Total de iterações: 10 VUs × 5 iterações = 50 iterações