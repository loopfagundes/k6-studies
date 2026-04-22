import http from 'k6/http';

export function makeGetRequest(url) {
  const response = http.get(url);
  return response;
}

export function makePostRequest(url, payload) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(url, JSON.stringify(payload), params);
  return response;
}

export function makePutRequest(url, payload) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.put(url, JSON.stringify(payload), params);
  return response;
}

export function makeDeleteRequest(url) {
  const response = http.del(url);
  return response;
}

// Gerar dados
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}