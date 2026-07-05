# PDI Individual — Geração, Status e Consulta

## Visão geral

A geração de PDI é **assíncrona**. A rota despacha um job para a fila e retorna imediatamente com `202 Accepted`. O processamento (chamada à OpenAI) ocorre em background. O registro em `pdis` só é inserido quando o worker inicia o job.

---

## Rotas

### `POST /api/empresas/envios/{envioId}/pdi/gerar` — Gerar PDI

Autenticação: grupo autenticado `empresas`.

**Payload (opcional):**
```json
{
  "contexto_adicional": "observações de liderança ou RH para enriquecer o plano"
}
```

**Resposta (202):**
```json
{
  "message": "Geração do PDI iniciada.",
  "envio_id": 44
}
```

**Ciclo de vida do status** (`status` na tabela `pdis`):

| Valor | Quando ocorre |
|---|---|
| `processando` | worker pegou o job e montou o prompt — chamada à OpenAI em andamento |
| `concluido` | OpenAI respondeu e o PDI foi salvo com sucesso |
| `falhou` | erro durante a geração (detalhes em `erro`) |

> **Importante**: não existe estado `pendente` no banco. Entre o `202` e o worker iniciar o job, `GET /pdi` retorna `"pdi": null`. O front-end deve tratar `null` pós-disparo como "aguardando início".

---

### `GET /api/empresas/envios/{envioId}/pdi` — Dados consolidados para PDI

Autenticação: grupo autenticado `empresas`.

Este endpoint também serve para verificar o andamento de uma geração em curso: checar `pdi.status` antes de exibir o conteúdo.

**Retorno — PDI ainda não gerado:**
```json
{
  "avaliacao": { "..." : "..." },
  "competencias": [],
  "pdi": null
}
```

**Retorno — geração em andamento (`status = processando`):**
```json
{
  "avaliacao": { "..." : "..." },
  "competencias": [],
  "pdi": {
    "id": 99,
    "status": "processando",
    "erro": null,
    "modelo": "gpt-4o-mini",
    "prompt": "...prompt montado localmente...",
    "resposta": null,
    "created_at": "2025-12-01 10:00:00",
    "updated_at": "2025-12-01 10:00:00"
  }
}
```

**Retorno — geração concluída (`status = concluido`):**
```json
{
  "avaliacao": {
    "envio_id": 44,
    "pesquisa_id": 10,
    "formulario_id": 5,
    "respondente": "Fulano da Silva",
    "token_respondente": "token_respondente_ou_id",
    "data_envio": "2025-11-20 12:00:00"
  },
  "competencias": [
    {
      "competencia_id": 1,
      "descricao": "Comunicação",
      "prompt_pdi": "Sugira ações para comunicação...",
      "nota": 4.5,
      "livros_pdi": [
        {
          "id": 10,
          "titulo": "Comunicação não violenta",
          "link": "https://exemplo.com/livro",
          "descricao": "Técnicas práticas para diálogos difíceis."
        }
      ],
      "videos_pdi": [
        {
          "id": 22,
          "titulo": "Como dar feedback",
          "link": "https://www.youtube.com/watch?v=abc123",
          "descricao": "Exemplos práticos e roteiro de conversa."
        }
      ]
    }
  ],
  "pdi": {
    "id": 99,
    "status": "concluido",
    "erro": null,
    "modelo": "gpt-4o-mini",
    "prompt": "...prompt enviado para a IA...",
    "resposta": {
      "avaliacao": { "envio_id": 44, "respondente": "Fulano da Silva" },
      "pdi": {
        "objetivo_geral": "objetivo resumido",
        "competencias": [
          {
            "competencia_id": 1,
            "descricao": "Comunicação",
            "nota": 4.5,
            "acoes_recomendadas": ["até 3 ações práticas"],
            "indicadores_sucesso": ["indicadores medíveis"],
            "prazo_meses": 3
          }
        ]
      }
    },
    "created_at": "2025-12-01 10:00:00",
    "updated_at": "2025-12-01 10:00:00"
  }
}
```

**Retorno — geração falhou (`status = falhou`):**
```json
{
  "avaliacao": { "..." : "..." },
  "competencias": [],
  "pdi": {
    "id": 99,
    "status": "falhou",
    "erro": "descrição do erro",
    "modelo": "gpt-4o-mini",
    "prompt": "...prompt montado localmente...",
    "resposta": null,
    "created_at": "2025-12-01 10:00:00",
    "updated_at": "2025-12-01 10:00:00"
  }
}
```

---

### `GET /api/empresas/envios/{envioId}/pdi/status` — Status dedicado

Autenticação: grupo autenticado `empresas`.

Alternativa ao polling via `GET /pdi` — resposta mais enxuta.

**Resposta — processando (200):**
```json
{
  "envio_id": 44,
  "status": "processando",
  "erro": null,
  "pdi": null
}
```

**Resposta — concluído (200):**
```json
{
  "envio_id": 44,
  "status": "concluido",
  "erro": null,
  "pdi": {
    "id": 1,
    "envio_id": 44,
    "status": "concluido",
    "modelo": "gpt-4o-mini",
    "prompt": "...",
    "resposta": {
      "avaliacao": {
        "envio_id": 44,
        "pesquisa_id": 10,
        "formulario_id": 5,
        "respondente": "Fulano da Silva",
        "data_envio": "2025-11-20 12:00:00"
      },
      "pdi": {
        "objetivo_geral": "objetivo resumido",
        "competencias": [
          {
            "competencia_id": 1,
            "descricao": "Comunicação",
            "nota": 4.5,
            "acoes_recomendadas": ["até 3 ações práticas"],
            "indicadores_sucesso": ["indicadores medíveis"],
            "prazo_meses": 3,
            "recomendacoes": {
              "livros": [
                {
                  "titulo": "Comunicação não violenta",
                  "link": "https://exemplo.com/livro",
                  "descricao": "Resumo de contribuição."
                }
              ],
              "videos": [
                {
                  "titulo": "Como dar feedback",
                  "link": "https://www.youtube.com/watch?v=abc123",
                  "descricao": "Resumo de contribuição."
                }
              ]
            }
          }
        ]
      }
    },
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-01T10:00:00Z"
  }
}
```

**Resposta — falhou (200):**
```json
{
  "envio_id": 44,
  "status": "falhou",
  "erro": "descrição do erro",
  "pdi": null
}
```

---

## Fluxo recomendado para o front-end

1. Ao abrir a tela, chamar `GET /api/empresas/envios/{envioId}/pdi` e verificar `pdi`:
   - `null`: PDI não solicitado ainda — exibir botão "Gerar PDI".
   - `status = processando`: geração em andamento — exibir indicador e iniciar polling.
   - `status = concluido`: exibir PDI a partir de `pdi.resposta`.
   - `status = falhou`: exibir `pdi.erro` e botão para tentar novamente.
2. Ao clicar em "Gerar PDI", chamar `POST /pdi/gerar` (202) e iniciar polling imediatamente.
3. **Polling**: chamar `GET /pdi/status` (ou `GET /pdi`) a cada 3–5 segundos:
   - `pdi === null`: worker ainda não iniciou — continuar polling.
   - `status = processando`: continuar polling.
   - `status = concluido`: encerrar polling e exibir PDI.
   - `status = falhou`: encerrar polling, exibir `erro` e permitir nova tentativa.
4. Aplicar **timeout de polling** no front-end (sugestão: 3 minutos) e exibir aviso caso o PDI demore além do esperado.
