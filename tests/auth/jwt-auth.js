import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://test-api.k6.io';

function parseJsonSafe(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
    return null;
  }
}

export const options = {
  scenarios: {
    jwt_auth_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function jwtAuthTest() {
  // PASSO 1: Registrar novo usuário
  const username = `testuser_${Date.now()}_${__VU}`;
  const password = `SuperSecret_${Date.now()}_${__VU}!`;
  
  const registerPayload = JSON.stringify({
    username: username,
    password: password,
  });
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const registerRes = http.post(
    `${BASE_URL}/user/register/`,
    registerPayload,
    { headers }
  );
  
  check(registerRes, {
    'Registro - Status 201': (r) => r.status === 201,
    'Registro - Retornou username': (r) => {
      const body = JSON.parse(r.body);
      return body.username === username;
    },
  });
  
  sleep(1);
  
  // PASSO 2: Fazer login e obter TOKEN
  const loginPayload = JSON.stringify({
    username: username,
    password: password,
  });
  
  const loginRes = http.post(
    `${BASE_URL}/auth/token/login/`,
    loginPayload,
    { headers }
  );
  
  const token = check(loginRes, {
    'Login - Status 200': (r) => r.status === 200,
    'Login - Retornou access token': (r) => {
      const body = JSON.parse(r.body);
      return body.access !== undefined;
    },
  }) && JSON.parse(loginRes.body).access;
  
  if (!token) {
    console.error('❌ Falha ao obter token!');
    return;
  }
  
  console.log(`✅ VU ${__VU} - Token obtido: ${token.substring(0, 20)}...`);
  
  sleep(1);
  
  // PASSO 3: Usar token para acessar endpoint protegido
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,  // 🔑 TOKEN JWT aqui!
  };
  
  const protectedRes = http.get(
    `${BASE_URL}/my/crocodiles/`,
    { headers: authHeaders }
  );
  
  check(protectedRes, {
    'Protegido - Status 200': (r) => r.status === 200,
    'Protegido - Retornou lista': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body);
    },
  });
  
  sleep(2);
  
  // PASSO 4: Criar um crocodilo (POST autenticado)
  const crocodilePayload = JSON.stringify({
    name: `Croc_VU${__VU}`,
    sex: 'M',
    date_of_birth: '2020-01-01',
  });
  
  const createCrocRes = http.post(
    `${BASE_URL}/my/crocodiles/`,
    crocodilePayload,
    { headers: authHeaders }
  );
  
  check(createCrocRes, {
    'Criar Croc - Status 201': (r) => r.status === 201,
    'Criar Croc - Retornou ID': (r) => {
      const body = JSON.parse(r.body);
      return body.id !== undefined;
    },
  });
  
  sleep(1);
}

export function handleSummary(data) {
  console.log('\n========================================');
  console.log('🔐 JWT AUTHENTICATION - RESUMO');
  console.log('========================================\n');
  console.log('🔹 Requests totais:', data.metrics.http_reqs.values.count);
  console.log('❌ Taxa de erro:', (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%');
  console.log('⏱️  Tempo médio:', data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms');
  console.log('\n========================================\n');
  
  return {
    'reports/jwt-auth-summary.json': JSON.stringify(data, null, 2),
  };
}