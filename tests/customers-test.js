import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  // GET - Listar clientes
  let resGetAll = http.get(`${BASE_URL}/customers`);
  check(resGetAll, {
    'GET /customers - status 200': (r) => r.status === 200,
    'GET /customers - retorna array': (r) => Array.isArray(JSON.parse(r.body)),
    'GET /customers - tempo < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // POST - Criar cliente
  const payload = JSON.stringify({
    email: `test${Date.now()}@email.com`,
    firstName: 'Test',
    lastName: 'User',
    phone: '11999999999'
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  let resPost = http.post(`${BASE_URL}/customers`, payload, params);
  check(resPost, {
    'POST /customers - status criado': (r) => r.status === 200 || r.status === 201,
    'POST /customers - tempo < 600ms': (r) => r.timings.duration < 600,
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "reports/customers-report.html": htmlReport(data),
  };
}
