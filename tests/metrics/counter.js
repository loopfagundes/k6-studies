import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// 🔢 Criando Counters customizados
const postsCreated = new Counter('posts_created');
const errors500 = new Counter('errors_500');
const successfulRequests = new Counter('successful_requests');

export const options = {
  scenarios: {
    counter_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
    },
  },
  thresholds: {
    'posts_created': ['count>10'],           // Deve criar mais de 10 posts
    'errors_500': ['count<5'],                // Menos de 5 erros 500
    'successful_requests': ['count>50'],      // Mais de 50 requests bem-sucedidos
  },
};

export default function counterTest() {
  // GET - Listar posts
  const listRes = http.get(`${BASE_URL}/posts`);
  
  if (listRes.status === 200) {
    successfulRequests.add(1);  // ✅ Incrementa contador
  }
  
  if (listRes.status === 500) {
    errors500.add(1);  // ❌ Conta erro 500
  }
  
  sleep(1);
  
  // POST - Criar post
  const payload = JSON.stringify({
    title: `Post by VU${__VU}`,
    body: 'Testing counters',
    userId: 1,
  });
  
  const headers = { 'Content-Type': 'application/json' };
  const createRes = http.post(`${BASE_URL}/posts`, payload, { headers });
  
  if (createRes.status === 201) {
    postsCreated.add(1);  // ✅ Incrementa posts criados
    successfulRequests.add(1);
    console.log(`✅ VU${__VU} criou post #${postsCreated}`);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('🔢 COUNTER METRICS - RESUMO');
  console.log('========================================\n');
  console.log('📝 Posts criados:', data.metrics.posts_created.values.count);
  console.log('❌ Erros 500:', data.metrics.errors_500.values.count);
  console.log('✅ Requests bem-sucedidos:', data.metrics.successful_requests.values.count);
  console.log('\n========================================\n');
  
  return {
    'reports/counter-metrics-summary.json': JSON.stringify(data, null, 2),
  };
}