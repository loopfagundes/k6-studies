import http from 'k6/http';
import { check, sleep } from 'k6';
import { Gauge } from 'k6/metrics';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// 📏 Criando Gauges customizados
const responseSize = new Gauge('response_size_bytes');
const itemsReturned = new Gauge('items_returned');
const activeVUs = new Gauge('active_vus_custom');

export const options = {
  scenarios: {
    gauge_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '20s', target: 5 },
        { duration: '20s', target: 0 },
      ],
    },
  },
  thresholds: {
    'response_size_bytes': ['value<50000'],  // Response menor que 50KB
    'items_returned': ['value>0'],            // Deve retornar items
  },
};

export default function gaugeTest() {
  // Atualiza gauge de VUs ativos
  activeVUs.add(__VU);
  
  // GET - Listar posts
  const res = http.get(`${BASE_URL}/posts`);
  
  if (res.status === 200) {
    // Mede tamanho da resposta
    const size = res.body.length;
    responseSize.add(size);
    
    // Conta quantos items vieram
    const items = JSON.parse(res.body);
    itemsReturned.add(items.length);
    
    console.log(`📏 VU${__VU} - Response: ${size} bytes, Items: ${items.length}`);
  }
  
  check(res, {
    'Status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('📏 GAUGE METRICS - RESUMO');
  console.log('========================================\n');
  console.log('📦 Tamanho médio response:', data.metrics.response_size_bytes.values.value.toFixed(0), 'bytes');
  console.log('📋 Items retornados (último):', data.metrics.items_returned.values.value);
  console.log('👥 VUs ativos (último):', data.metrics.active_vus_custom.values.value);
  console.log('\n========================================\n');
  
  return {
    'reports/gauge-metrics-summary.json': JSON.stringify(data, null, 2),
  };
}