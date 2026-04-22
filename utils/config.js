export const config = {
  baseUrl: 'https://jsonplaceholder.typicode.com',
  
  // Configurações load testing
  loadTest: {
    vus: 10,
    duration: '30s',
  },
  
  // Configurações stress 
  stressTest: {
    stages: [
      { duration: '1m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '1m', target: 0 },
    ],
  },
  
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests abaixo 500ms
    http_req_failed: ['rate<0.1'],     // Taxa erro menor que 10%
  },
};