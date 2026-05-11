import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    scenarios: {
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '1m', target: 10 },    // normal como 10 usuarios
                { duration: '30s', target: 500 },  // SPIKE! aumentar para 500 em 30s
                { duration: '1m', target: 500 },   // mantem 500 por 1min
                { duration: '30s', target: 10 },   // volta para 10 em 30s
                { duration: '1m', target: 10 },    // mantem normal
                { duration: '30s', target: 600 },  // SPIKE 2 Ainda maior
                { duration: '1m', target: 600 },   // mantem 600
                { duration: '30s', target: 10 },   // volta para 10 em 30s
            ],
            gracefulRampDown: '0s',
        },
    },
};

export default function spikeTest() {
    http.get('URL'); // substitua URL endpoint que quer testar
    sleep(0.5);
}