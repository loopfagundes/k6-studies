import { sleep, check } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 20,              // 20 VUs fixos
      duration: '2m',       // Por 2 minutos
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function constant_load() {
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  
  check(res, {
    'Constant - Status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}