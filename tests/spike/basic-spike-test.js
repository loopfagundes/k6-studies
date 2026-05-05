import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    scenarios: {
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '1m', target: 10 },    // Normal: 10 usuários
                { duration: '30s', target: 500 },  // SPIKE! Sobe para 500 em 30s
                { duration: '1m', target: 500 },   // Mantém 500 por 1min
                { duration: '30s', target: 10 },   // Volta para 10 em 30s
                { duration: '1m', target: 10 },    // Mantém normal
                { duration: '30s', target: 600 },  // SPIKE 2! Ainda maior
                { duration: '1m', target: 600 },   // Mantém 600
                { duration: '30s', target: 10 },   // Recovery
            ],
            gracefulRampDown: '0s',
        },
    },
};

export default function spikeTest() {
    http.get('URL'); // Substitua 'URL' pelo endpoint que deseja testar
    sleep(0.5);
}