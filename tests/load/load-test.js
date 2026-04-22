import { sleep, check } from 'k6';
import { config } from '../../utils/config.js';
import { makeGetRequest, makePostRequest } from '../../utils/helpers.js';

export const options = {
  vus: 50,              // 50 usuários virtuais
  duration: '30s',       // 30 segundos rodar
  
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% abaixo de 500ms
    http_req_failed: ['rate<0.1'],      // menos de 10% de erros
  },
};

export default function loadTest() {
  // fluxo real de usuário
  
  //Listar posts
  const posts = makeGetRequest(`${config.baseUrl}/posts`);
  check(posts, {
    'Load - GET posts OK': (r) => r.status === 200,
  });
  
  sleep(1);
  
  //Ver detalhes post
  const postDetail = makeGetRequest(`${config.baseUrl}/posts/1`);
  check(postDetail, {
    'Load - GET post detalhe OK': (r) => r.status === 200,
  });
  
  sleep(2);
  
  //Criar novo post
  const newPost = {
    title: 'Load Test Post',
    body: 'Testando carga normal',
    userId: 1,
  };
  
  const createPost = makePostRequest(`${config.baseUrl}/posts`, newPost);
  check(createPost, {
    'Load - POST criar post OK': (r) => r.status === 201,
  });
  
  sleep(1);
}