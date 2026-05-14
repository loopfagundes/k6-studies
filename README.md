# 🚀 K6 Performance Testing - Estudos

Projeto de estudos sobre **testes de performance** utilizando k6, desde conceitos básicos.

[![k6](https://img.shields.io/badge/k6-latest-7d64ff?style=flat-square&logo=k6&logoColor=white)](https://k6.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📚 Sobre o Projeto

Este repositório documenta minha jornada de aprendizado em **Performance Testing** com k6, cobrindo desde testes básicos.

**Tecnologias:**
- k6 (Grafana)
- JavaScript ES6+
- JSONPlaceholder API (testes)
- Test API k6 (autenticação)

---

## 🛠️ Instalação

### Pré-requisitos

- Node.js (opcional, para gestão de dependências)
- k6 instalado

### Instalar k6


**Windows (Chocolatey):**
```bash
choco install k6
```


### Verificar instalação

```bash
k6 version
```

---

## 🚀 Como Executar

### Testes Básicos

```bash
# Load Test - Carga constante
k6 run tests/load/load-test.js

# Stress Test - Aumento gradual até o limite
k6 run tests/stress/stress-test.js

# Spike Test - Picos repentinos de tráfego
k6 run tests/spike/spike-test.js

# Soak Test - Estabilidade por longa duração
k6 run tests/soak/soak-test.js
```

---
```
# Web Dashboard (tempo real):

k6 run --out web-dashboard tests/load/load-test.js

# Acesse: http://localhost:5665
```

---

## 📊 Tipos de Teste

### 1. **Load Test** 
Simula carga **normal e esperada** do sistema.

**Quando usar:** Validar performance em condições normais de uso.

```bash
k6 run tests/load/load-test.js
```

---

### 2. **Stress Test**
Aumenta a carga **gradualmente** até encontrar o ponto de ruptura.

**Quando usar:** Descobrir limites do sistema.

```bash
k6 run tests/stress/stress-test.js
```

---

### 3. **Spike Test**
Simula **picos súbitos** de tráfego.

**Quando usar:** Black Friday, lançamentos, promoções.

```bash
k6 run tests/spike/spike-test.js
```

---

### 4. **Soak Test**
Mantém carga **constante por horas**.

**Quando usar:** Detectar memory leaks e degradação ao longo do tempo.

```bash
k6 run tests/soak/soak-test.js
```

---

## 📈 Métricas Customizadas

O projeto implementa 4 tipos de métricas:

| Tipo | Uso | Exemplo |
|------|-----|---------|
| **Counter** | Contagem de eventos | `postsCreated.add(1)` |
| **Gauge** | Valores instantâneos | `responseSize.add(size)` |
| **Rate** | Percentuais/taxas | `successRate.add(true)` |
| **Trend** | Distribuição estatística | `apiLatency.add(time)` |

```javascript
import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

const myCounter = new Counter('my_counter');
const myGauge = new Gauge('my_gauge');
const myRate = new Rate('my_rate');
const myTrend = new Trend('my_trend');
```

---

## 🔐 Autenticação

Exemplos de diferentes tipos de autenticação:

**JWT Bearer Token:**
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
};
```

**API Key:**
```javascript
const headers = {
  'X-API-Key': 'sua-chave-aqui',
};
```

**Basic Auth:**
```javascript
const credentials = encoding.b64encode(`${user}:${pass}`);
const headers = {
  'Authorization': `Basic ${credentials}`,
};
```
