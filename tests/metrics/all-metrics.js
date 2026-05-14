import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// 🎯 Todas as métricas customizadas
const requestCounter = new Counter('total_requests');
const errorCounter = new Counter('total_errors');
const activeUsers = new Gauge('active_users');
const responseSize = new Gauge('response_size');
const successRate = new Rate('success_rate');
const cacheHitRate = new Rate('cache_hit_rate');
const apiLatency = new Trend('api_latency');
const processingTime = new Trend('processing_time');

export const options = {
  scenarios: {
    all_metrics: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    'total_requests': ['count>100'],
    'total_errors': ['count<10'],
    'success_rate': ['rate>0.95'],
    'api_latency': ['p(95)<500', 'avg<300'],
  },
};

export default function allMetricsTest() {
  // Atualiza gauge de usuários ativos
  activeUsers.add(__VU);
  
  // Incrementa contador de requests
  requestCounter.add(1);
  
  const start = Date.now();
  const res = http.get(`${BASE_URL}/posts`);
  const latency = Date.now() - start;
  
  // Adiciona latência no Trend
  apiLatency.add(latency);
  
  // Simula verificação de cache (aleatório)
  const isCacheHit = Math.random() > 0.7;  // 30% cache hit
  cacheHitRate.add(isCacheHit);
  
  if (res.status === 200) {
    successRate.add(1);
    
    // Mede tamanho da resposta
    responseSize.add(res.body.length);
    
    // Simula processamento
    const procStart = Date.now();
    const data = JSON.parse(res.body);
    const procTime = Date.now() - procStart;
    processingTime.add(procTime);
    
    console.log(`📊 VU${__VU} | Latency: ${latency}ms | Size: ${res.body.length}b | Cache: ${isCacheHit ? '✅' : '❌'}`);
  } else {
    successRate.add(0);
    errorCounter.add(1);
  }
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('🎯 ALL CUSTOM METRICS - RESUMO COMPLETO');
  console.log('========================================\n');
  
  console.log('🔢 COUNTERS:');
  console.log('   Total requests:', data.metrics.total_requests.values.count);
  console.log('   Total errors:', data.metrics.total_errors.values.count);
  
  console.log('\n📏 GAUGES:');
  console.log('   Active users (último):', data.metrics.active_users.values.value);
  console.log('   Response size (último):', data.metrics.response_size.values.value, 'bytes');
  
  console.log('\n📊 RATES:');
  console.log('   Success rate:', (data.metrics.success_rate.values.rate * 100).toFixed(2) + '%');
  console.log('   Cache hit rate:', (data.metrics.cache_hit_rate.values.rate * 100).toFixed(2) + '%');
  
  console.log('\n📈 TRENDS:');
  console.log('   API Latency:');
  console.log('      Avg:', data.metrics.api_latency.values.avg.toFixed(2), 'ms');
  console.log('      P95:', data.metrics.api_latency.values['p(95)'].toFixed(2), 'ms');
  console.log('   Processing Time:');
  console.log('      Avg:', data.metrics.processing_time.values.avg.toFixed(2), 'ms');
  
  console.log('\n========================================\n');
  
  return {
    'reports/all-metrics-summary.json': JSON.stringify(data, null, 2),
  };
}