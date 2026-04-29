import { sleep, check } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Sobe para 10
        { duration: '1m', target: 20 },   // Sobe para 20
        { duration: '30s', target: 0 },   // Desce para 0
      ],
      gracefulRampDown: '10s',
    },
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function ramping_load() {
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  
  check(res, {
    'Ramping - Status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}