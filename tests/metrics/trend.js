import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// 📈 Criando Trends customizados
const postCreationTime = new Trend('post_creation_time');
const responseProcessingTime = new Trend('response_processing_time');
const payloadSize = new Trend('payload_size');

export const options = {
  scenarios: {
    trend_test: {
      executor: 'constant-vus',
      vus: 8,
      duration: '1m',
    },
  },
  thresholds: {
    'post_creation_time': ['p(95)<300', 'avg<200'],  // P95 < 300ms, média < 200ms
    'response_processing_time': ['p(90)<50'],         // P90 < 50ms
  },
};

export default function trendTest() {
  // GET - Listar posts
  const startGet = Date.now();
  const listRes = http.get(`${BASE_URL}/posts`);
  const getTime = Date.now() - startGet;
  
  if (listRes.status === 200) {
    // Simula tempo de processamento da resposta
    const startProcessing = Date.now();
    const data = JSON.parse(listRes.body);
    const processingTime = Date.now() - startProcessing;
    
    responseProcessingTime.add(processingTime);  // Adiciona métrica
    
    console.log(`📈 VU${__VU} - Processing: ${processingTime}ms, Items: ${data.length}`);
  }
  
  sleep(1);
  
  // POST - Criar post com payload variável
  const randomBodySize = Math.floor(Math.random() * 500) + 100;
  const randomBody = 'x'.repeat(randomBodySize);
  
  const payload = JSON.stringify({
    title: `Post VU${__VU}`,
    body: randomBody,
    userId: 1,
  });
  
  payloadSize.add(payload.length);  // Tamanho do payload
  
  const headers = { 'Content-Type': 'application/json' };
  
  const startPost = Date.now();
  const createRes = http.post(`${BASE_URL}/posts`, payload, { headers });
  const postTime = Date.now() - startPost;
  
  if (createRes.status === 201) {
    postCreationTime.add(postTime);  // Tempo para criar post
    console.log(`📝 VU${__VU} - Post criado em: ${postTime}ms, Payload: ${payload.length} bytes`);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('📈 TREND METRICS - RESUMO');
  console.log('========================================\n');
  
  console.log('⏱️  Tempo de criação de post:');
  console.log('   Média:', data.metrics.post_creation_time.values.avg.toFixed(2), 'ms');
  console.log('   Min:', data.metrics.post_creation_time.values.min.toFixed(2), 'ms');
  console.log('   Max:', data.metrics.post_creation_time.values.max.toFixed(2), 'ms');
  console.log('   P95:', data.metrics.post_creation_time.values['p(95)'].toFixed(2), 'ms');
  console.log('   P99:', data.metrics.post_creation_time.values['p(99)'].toFixed(2), 'ms\n');
  
  console.log('🔄 Tempo de processamento:');
  console.log('   Média:', data.metrics.response_processing_time.values.avg.toFixed(2), 'ms');
  console.log('   P90:', data.metrics.response_processing_time.values['p(90)'].toFixed(2), 'ms\n');
  
  console.log('📦 Tamanho do payload:');
  console.log('   Média:', data.metrics.payload_size.values.avg.toFixed(0), 'bytes');
  console.log('   Min:', data.metrics.payload_size.values.min.toFixed(0), 'bytes');
  console.log('   Max:', data.metrics.payload_size.values.max.toFixed(0), 'bytes');
  
  console.log('\n========================================\n');
  
  return {
    'reports/trend-metrics-summary.json': JSON.stringify(data, null, 2),
  };
}