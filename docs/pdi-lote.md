# PDI em Lote — Geração e Status

## Visão geral

O fluxo em lote permite que o front-end selecione múltiplos envios de uma pesquisa e dispare a geração de PDI para todos ao mesmo tempo. Cada envio é tratado de forma independente na fila, mantendo a mesma lógica assíncrona do fluxo individual.

---

## Rotas

### `POST /api/empresas/pdis/gerar-lote` — Disparar geração em lote

Autenticação: bearer token padrão (`auth:api`).

Despacha um `GerarPdiJob` para cada `envio_id` informado. Retorna imediatamente com `202 Accepted`.

**Payload:**
```json
{
  "envio_ids": [44, 45, 46],
  "contexto_adicional": "Observações do RH para enriquecer os planos (opcional)"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `envio_ids` | array de inteiros | sim | IDs dos envios cujos PDIs devem ser gerados |
| `contexto_adicional` | string | não | Contexto extra enviado para a IA em todos os PDIs do lote |

**Resposta (202):**
```json
{
  "message": "Geração em lote iniciada.",
  "envio_ids": [44, 45, 46],
  "total": 3
}
```

> O `contexto_adicional` é compartilhado entre todos os PDIs do lote. Se cada PDI precisar de contexto diferente, use o endpoint individual `POST /api/empresas/envios/{envioId}/pdi/gerar`.

---

### `POST /api/empresas/pdis/status-lote` — Consultar status do lote

Autenticação: bearer token padrão (`auth:api`).

Retorna o status atual de cada PDI do lote. Ideal para polling após o disparo.

**Payload:**
```json
{
  "envio_ids": [44, 45, 46]
}
```

**Resposta (200):**
```json
{
  "pdis": [
    { "envio_id": 44, "status": "concluido", "erro": null },
    { "envio_id": 45, "status": "processando", "erro": null },
    { "envio_id": 46, "status": null, "erro": null }
  ]
}
```

| `status` | Significado |
|---|---|
| `null` | PDI ainda não registrado — worker ainda não iniciou o job |
| `processando` | Chamada à OpenAI em andamento |
| `concluido` | PDI gerado com sucesso |
| `falhou` | Erro durante a geração — detalhe em `erro` |

---

## Fluxo recomendado para o front-end React

### 1. Seleção e disparo

```tsx
const response = await api.post('/empresas/pdis/gerar-lote', {
  envio_ids: enviosSelecionados, // number[]
  contexto_adicional: contexto || undefined,
});
// response.status === 202 — geração iniciada
```

### 2. Polling de status

Após o disparo, iniciar polling a cada **3–5 segundos**:

```tsx
const POLLING_INTERVAL = 4000; // ms
const POLLING_TIMEOUT  = 3 * 60 * 1000; // 3 minutos

async function pollStatusLote(envioIds: number[]) {
  const inicio = Date.now();

  const intervalo = setInterval(async () => {
    if (Date.now() - inicio > POLLING_TIMEOUT) {
      clearInterval(intervalo);
      // Exibir aviso de timeout
      return;
    }

    const { data } = await api.post('/empresas/pdis/status-lote', { envio_ids: envioIds });

    const pendentes = data.pdis.filter(
      (p) => p.status === null || p.status === 'processando'
    );

    atualizarStatusNaTela(data.pdis);

    if (pendentes.length === 0) {
      clearInterval(intervalo); // Todos concluíram ou falharam
    }
  }, POLLING_INTERVAL);
}
```

### 3. Renderização por status

| `status` | O que exibir |
|---|---|
| `null` | Spinner — aguardando início do worker |
| `processando` | Spinner — IA gerando o PDI |
| `concluido` | Ícone de sucesso — PDI disponível |
| `falhou` | Ícone de erro + botão "Tentar novamente" |

Para exibir o PDI de um envio concluído, chamar individualmente `GET /api/empresas/envios/{envioId}/pdi` e ler `pdi.resposta`.

### 4. Nova tentativa para falhas

```tsx
const falhos = data.pdis
  .filter((p) => p.status === 'falhou')
  .map((p) => p.envio_id);

if (falhos.length > 0) {
  await api.post('/empresas/pdis/gerar-lote', { envio_ids: falhos });
}
```
