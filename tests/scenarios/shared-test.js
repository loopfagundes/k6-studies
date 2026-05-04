import { sleep, check } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    shared_iters: {
      executor: 'shared-iterations',
      vus: 10,              // 10 VUs competindo
      iterations: 50,       // 50 iterações no TOTAL
      maxDuration: '1m',
    },
  },
};

export default function sharedTest() {
  console.log(`VU ${__VU} pegou a iteração ${__ITER}`);
  
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  
  check(res, {
    'Shared - Status 200': (r) => r.status === 200,
  });
  
  sleep(0.5);
}

// Total: 50 iterações divididas entre 10 VUs (alguns fazem mais, outros menos)