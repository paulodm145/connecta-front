# Fluxo de envio e cálculo de PDI

## Visão geral
O fluxo atual permite que colaboradores respondam a formulários dinâmicos, gerando notas por pergunta e, agora, médias por competência para preparação do PDI.

## Passo a passo do envio
1. **Criação do envio**: `RespostasService::responder` cria um registro em `envios` com `pesquisa_id`, `formulario_id`, `token_respondente` e `tipo_envio`.
2. **Registro das respostas**: cada item recebido em `respostas` gera um registro em `respostas` com `pontuacao_resposta` (pontuação base da pergunta) e, quando houver, linhas em `respostas_opcoes` com as pontuações das opções selecionadas.
3. **Cálculo das competências**: após salvar todas as respostas, o serviço `CalcularNotaCompetenciaService` é chamado com o `envio_id` para calcular e persistir as médias ponderadas por competência em `envio_competencias`.

## Rotas, payloads e retornos
- **Envio público de respostas**: `POST /api/externo-respostas`
  - Autenticação: liberada pelo middleware `AcessoPublicoFormularioMiddleware`.
  - Regras de negócio:
    - Só aceita respostas dentro do intervalo entre `data_inicio` e `data_fim` da pesquisa (quando definidos).
    - Quando `resposta_unica` estiver ativa, o mesmo respondente não pode enviar mais de uma resposta para a pesquisa.
  - Payload esperado:
    ```json
    {
      "pesquisa_id": 10,
      "formulario_id": 5,
      "respondente": "token_respondente_ou_id",
      "tipo_envio": "COLABORADOR",
      "respostas": [
        {
          "pergunta_id": 1,
          "resposta_texto": "Resposta descritiva",
          "tipo_resposta": "COLABORADOR",
          "opcoes": [3, 4]
        }
      ]
    }
    ```
  - Comportamento: cria o `envio`, registra cada resposta, soma pontuação base com as opções selecionadas e dispara o cálculo de competências.
  - Retorno esperado (exemplo):
    ```json
    [
      {
        "id": 120,
        "envio_id": 44,
        "pergunta_id": 1,
        "resposta_texto": "Resposta descritiva",
        "pontuacao_resposta": 3,
        "created_at": "2025-11-20T12:00:00Z"
      }
    ]
    ```
  - Possíveis erros:
    - `422`: pesquisa fora do prazo ou tentativa de resposta duplicada quando `resposta_unica` estiver ativa.

- **Status de resposta do respondente**: `GET /api/externo-respostas/status`
  - Autenticação: liberada pelo middleware `AcessoPublicoFormularioMiddleware`.
  - Parâmetros de query:
    - `pesquisa_id` (obrigatório): id da pesquisa.
    - `respondente` (obrigatório): token do respondente.
    - `tipo_envio` (opcional): `COLABORADOR` (padrão) ou `LIDER`.
  - Retorno esperado (exemplo):
    ```json
    {
      "respondido": true,
      "envio_id": 44,
      "pesquisa_id": 10,
      "tipo_envio": "COLABORADOR",
      "data_envio": "2025-11-20 12:00:00"
    }
    ```
  - Observação: quando não houver envio, `respondido` retorna `false` e os campos `envio_id`/`data_envio` retornam `null`.

- **Relatório consolidado de um envio**: `GET /api/empresas/respostas/relatorio-envio/{envioId}`
  - Autenticação: rotas autenticadas do grupo `empresas`.
  - Retorno esperado: coleção com texto da pergunta, resposta preenchida e pontuação total calculada por pergunta.

- **Dados consolidados para PDI**: `GET /api/empresas/envios/{envioId}/pdi`
  - Autenticação: grupo autenticado `empresas` (enviar bearer token padrão da aplicação).
  - Este endpoint também serve para o front-end verificar o andamento de uma geração em curso: quando a chave `pdi` estiver presente, checar `pdi.status` antes de exibir o conteúdo.
  - Retorno quando PDI ainda não foi gerado:
    ```json
    {
      "avaliacao": { ... },
      "competencias": [ ... ],
      "pdi": null
    }
    ```
  - Retorno quando geração está em andamento (`status` = `processando`):
    ```json
    {
      "avaliacao": { ... },
      "competencias": [ ... ],
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
  - Retorno quando geração foi concluída (`status` = `concluido`):
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
  - Retorno quando geração falhou (`status` = `falhou`):
    ```json
    {
      "avaliacao": { ... },
      "competencias": [ ... ],
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
  - **Orientação ao front-end**: ao carregar a tela de PDI, chamar este endpoint e verificar `pdi.status`:
    - `null` (pdi ausente): PDI ainda não solicitado — exibir botão "Gerar PDI".
    - `processando`: job está em execução — exibir indicador de carregamento e fazer polling a cada 3–5 s neste mesmo endpoint.
    - `concluido`: exibir o PDI a partir de `pdi.resposta`.
    - `falhou`: exibir mensagem de erro (`pdi.erro`) e permitir nova tentativa (chamar `POST /pdi/gerar` novamente).

- **Envio de PDI por e-mail** (rotas autenticadas em `/api/empresas`):
  - `POST /api/empresas/envios/{envioId}/pdi/enviar-email`
    - Pré-requisitos: existir um PDI cadastrado para o `envioId` informado e o respondente possuir e-mail.
    - Retorno (200): `{"message": "PDI enviado com sucesso.", "destinatario": "email@dominio.com"}`.
    - Conteúdo: o HTML do e-mail inclui os dados do plano e as recomendações de desenvolvimento salvas no PDI, tanto na chave `resposta.recomendacoes` quanto dentro de cada `resposta.pdi.competencias[].recomendacoes` (livros, vídeos, ações, etc.).
    - Retornos de erro (400): mensagem explicando ausência de respondente ou de e-mail cadastrado.
  - `POST /api/empresas/pesquisas/{pesquisaId}/pdi/enviar-email`
    - Envia o PDI para todos os respondentes com PDI associado à pesquisa informada.
    - Retorno (200): objeto resumo com contadores `total_com_pdi`, `enviados`, `sem_email` e `sem_respondente`.
    - Registros sem respondente ou sem e-mail são ignorados e contabilizados no resumo.

- **Envio de link de pesquisa por e-mail** (rotas autenticadas em `/api/empresas`):
  - `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-email`
    - Envia o link de resposta da pesquisa para um único respondente.
    - Payload: vazio.
    - Retorno (200):
      ```json
      {
        "message": "E-mail de pesquisa enviado com sucesso.",
        "destinatario": "email@dominio.com",
        "link": "https://front.exemplo.com/pesquisas/pesquisa-slug?token=XXXX-XXXX-XXXX-XXXX"
      }
      ```
    - Retornos de erro (400): mensagem explicando ausência de respondente, pesquisa vinculada ou e-mail cadastrado.
  - `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-email`
    - Envia o link de resposta da pesquisa para todos os respondentes vinculados à pesquisa.
    - Payload: vazio.
    - Retorno (200): objeto resumo com contadores `total_respondentes`, `enviados`, `sem_email` e `sem_pessoa`.
    - O link enviado é montado a partir da variável `PESQUISA_RESPONDER_URL` (com fallback para `APP_URL`), seguindo o formato `/pesquisas/{slug}?token=...`.

---

## Envio de links de avaliação para responsáveis de setor

### Visão geral

Neste fluxo, o responsável por um setor recebe um único e-mail contendo a lista de todos os colaboradores do seu setor que são respondentes de uma pesquisa, cada um com seu link individual de avaliação. Ele não precisa acessar o sistema para saber quem deve avaliar — tudo chega consolidado no e-mail.

### Pré-requisitos

- A pesquisa deve ter respondentes cadastrados.
- O setor deve ter o campo `pessoa_id` preenchido (responsável definido).
- O responsável deve ter `email` cadastrado em `pessoas`.
- Os respondentes do setor são identificados pelo relacionamento `pessoas → cargos → setores` (via `cargo_id` e `cargos.setor_id`).

### Rotas

#### `POST /api/empresas/pesquisas/{pesquisaId}/setores/{setorId}/responsavel/enviar-email`

Autenticação: bearer token padrão (`auth:api`).

Envia o e-mail de links de avaliação para o responsável de um setor específico dentro de uma pesquisa.

**Parâmetros de URL:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `pesquisaId` | integer | ID da pesquisa |
| `setorId` | integer | ID do setor cujo responsável receberá o e-mail |

**Payload:** vazio.

**Retorno (200):**
```json
{
  "message": "E-mail enviado com sucesso ao responsável do setor.",
  "setor": "Tecnologia",
  "responsavel": "Ana Silva",
  "destinatario": "ana.silva@empresa.com",
  "total_avaliados": 5
}
```

**Retornos de erro (400):**
```json
{ "message": "O setor \"Tecnologia\" não possui responsável cadastrado." }
{ "message": "O responsável do setor \"Tecnologia\" não possui e-mail cadastrado." }
{ "message": "Nenhum respondente encontrado para o setor \"Tecnologia\" nesta pesquisa." }
```

**Retorno de erro (404):** pesquisa ou setor não encontrado.

---

#### `POST /api/empresas/pesquisas/{pesquisaId}/setores/responsaveis/enviar-email`

Autenticação: bearer token padrão (`auth:api`).

Envia o e-mail de links de avaliação para os responsáveis de **todos os setores** que possuam respondentes cadastrados na pesquisa. Setores sem responsável, sem e-mail ou sem respondentes na pesquisa são ignorados e contabilizados no resumo.

**Parâmetros de URL:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `pesquisaId` | integer | ID da pesquisa |

**Payload:** vazio.

**Retorno (200):**
```json
{
  "total_setores": 4,
  "enviados": 3,
  "sem_responsavel": 0,
  "sem_email_responsavel": 1,
  "sem_respondentes": 0,
  "detalhes": [
    {
      "setor": "Tecnologia",
      "responsavel": "Ana Silva",
      "destinatario": "ana.silva@empresa.com",
      "total_avaliados": 5
    },
    {
      "setor": "Comercial",
      "responsavel": "João Souza",
      "destinatario": "joao.souza@empresa.com",
      "total_avaliados": 3
    }
  ]
}
```

| Campo | Significado |
|---|---|
| `total_setores` | Total de setores com responsável preenchido |
| `enviados` | Setores cujo responsável recebeu o e-mail com sucesso |
| `sem_responsavel` | Setores sem `pessoa_id` cadastrado |
| `sem_email_responsavel` | Setores cujo responsável não tem e-mail |
| `sem_respondentes` | Setores sem respondentes nesta pesquisa |
| `detalhes` | Array com o resumo de cada e-mail enviado |

**Retorno de erro (404):** pesquisa não encontrada.

---

### Fluxo recomendado para o front-end React

#### Caso de uso: disparar e-mail para um setor específico

```tsx
async function enviarEmailSetor(pesquisaId: number, setorId: number) {
  try {
    const { data } = await api.post(
      `/empresas/pesquisas/${pesquisaId}/setores/${setorId}/responsavel/enviar-email`
    );
    // data.message, data.setor, data.responsavel, data.total_avaliados
    toast.success(`E-mail enviado para ${data.responsavel} com ${data.total_avaliados} avaliados.`);
  } catch (error) {
    // error.response.data.message descreve o motivo da falha
    toast.error(error.response?.data?.message ?? 'Erro ao enviar e-mail.');
  }
}
```

#### Caso de uso: disparar e-mail para todos os responsáveis

```tsx
async function enviarEmailTodosResponsaveis(pesquisaId: number) {
  const { data } = await api.post(
    `/empresas/pesquisas/${pesquisaId}/setores/responsaveis/enviar-email`
  );

  // data.enviados — quantos foram enviados com sucesso
  // data.sem_responsavel — setores ignorados por ausência de responsável
  // data.sem_email_responsavel — setores ignorados por e-mail ausente
  // data.sem_respondentes — setores sem respondentes na pesquisa
  // data.detalhes — array com detalhes de cada envio realizado
  return data;
}
```

#### Sugestão de UX

- Exibir um botão **"Enviar links para responsáveis"** na tela de gestão de pesquisa.
- Ao clicar, disparar o endpoint em massa e mostrar o resumo retornado em um modal ou toast:
  - "X setores notificados com sucesso."
  - "Y setores ignorados: responsável sem e-mail."
- Oferecer também a ação individual por setor na listagem de setores da pesquisa.
- Não há polling necessário — o envio é síncrono e a resposta já traz o resultado final.

#### Estrutura do e-mail recebido pelo responsável

O responsável recebe uma tabela com:
- Nome de cada colaborador do setor que é respondente da pesquisa.
- Link individual de acesso ao formulário de avaliação.
- Prazo final da pesquisa (se configurado).

O link segue o mesmo padrão dos demais links de pesquisa:
```
{PESQUISA_RESPONDER_URL}/respostas/formulario/{formulario-slug}?t={token}&p={pesquisa-slug}&e={empresa_id}&tpo=1
```

## Campos adicionais em pesquisas
- `resposta_unica` (boolean): quando `true`, impede múltiplas respostas do mesmo respondente para a pesquisa.

## Ajustes recentes
- `perguntas.pergunta_texto` agora suporta textos longos (tipo `text`) para evitar truncamento em formulários extensos.

- **Geração de PDI com IA**: `POST /api/empresas/envios/{envioId}/pdi/gerar`
  - Autenticação: grupo autenticado `empresas`.
  - Payload opcional:
    ```json
    {
      "contexto_adicional": "observações de liderança ou RH para enriquecer o plano"
    }
    ```
  - Comportamento: a geração é **assíncrona**. A rota despacha um job para a fila e retorna imediatamente com `202 Accepted`. O processamento (chamada à OpenAI) ocorre em background sem bloquear a requisição HTTP. Nenhum registro é criado no banco neste momento — o registro em `pdis` só é inserido quando o worker inicia o job.
  - Resposta (202):
    ```json
    {
      "message": "Geração do PDI iniciada.",
      "envio_id": 44
    }
    ```
  - **Ciclo de vida do status** (`status` na tabela `pdis`):
    | Valor | Quando ocorre |
    |---|---|
    | `processando` | worker pegou o job e montou o prompt — chamada à OpenAI em andamento |
    | `concluido` | OpenAI respondeu e o PDI foi salvo com sucesso |
    | `falhou` | erro durante a geração (detalhes em `erro`) |

    > **Importante**: não existe estado `pendente` no banco. Entre o `202` e o worker iniciar o job, `GET /pdi` retorna `"pdi": null`. O front-end deve tratar `null` pós-disparo como "aguardando início".

  - **Consulta de status dedicada**: `GET /api/empresas/envios/{envioId}/pdi/status`
    - Autenticação: grupo autenticado `empresas`.
    - Alternativa ao polling via `GET /pdi` quando se deseja uma resposta mais enxuta.
    - Resposta enquanto em processamento (200):
      ```json
      {
        "envio_id": 44,
        "status": "processando",
        "erro": null,
        "pdi": null
      }
      ```
    - Resposta quando concluído (200):
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
    - Resposta quando falhou (200):
      ```json
      {
        "envio_id": 44,
        "status": "falhou",
        "erro": "descrição do erro",
        "pdi": null
      }
      ```

  - **Fluxo recomendado para o front-end**:
    1. Ao abrir a tela, chamar `GET /api/empresas/envios/{envioId}/pdi` e verificar `pdi`:
       - `null`: PDI não solicitado ainda — exibir botão "Gerar PDI".
       - `status = processando`: geração em andamento — exibir indicador e iniciar polling.
       - `status = concluido`: exibir PDI.
       - `status = falhou`: exibir erro e botão para tentar novamente.
    2. Ao clicar em "Gerar PDI", chamar `POST /pdi/gerar` (202) e iniciar polling imediatamente.
    3. Polling: chamar `GET /pdi/status` (ou `GET /pdi`) a cada 3–5 segundos.
       - `pdi === null`: worker ainda não iniciou — continuar polling.
       - `status = processando`: continuar polling.
       - `status = concluido`: encerrar polling e exibir PDI.
       - `status = falhou`: encerrar polling, exibir `erro` e permitir nova tentativa.
    4. Aplicar timeout de polling no front-end (sugestão: 3 minutos) e exibir aviso caso o PDI demore além do esperado.

---

## Geração de PDI em lote

### Visão geral

O fluxo em lote permite que o front-end selecione múltiplos envios de uma pesquisa e dispare a geração de PDI para todos ao mesmo tempo. Cada envio é tratado de forma independente na fila, mantendo a mesma lógica assíncrona do fluxo individual.

### Rotas

#### `POST /api/empresas/pdis/gerar-lote`

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

> O campo `contexto_adicional` é compartilhado entre todos os PDIs do lote. Se cada PDI precisar de contexto diferente, use o endpoint individual `POST /api/empresas/envios/{envioId}/pdi/gerar`.

---

#### `POST /api/empresas/pdis/status-lote`

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

### Fluxo recomendado para o front-end React

#### 1. Seleção e disparo

```tsx
// Enviar IDs selecionados para a fila
const response = await api.post('/empresas/pdis/gerar-lote', {
  envio_ids: enviosSelecionados, // number[]
  contexto_adicional: contexto || undefined,
});
// response.status === 202 — geração iniciada
```

#### 2. Polling de status

Após o disparo, iniciar polling a cada **3–5 segundos** com o endpoint de status em lote:

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

    // Atualizar estado local com os status recebidos
    atualizarStatusNaTela(data.pdis);

    if (pendentes.length === 0) {
      clearInterval(intervalo); // Todos concluíram ou falharam
    }
  }, POLLING_INTERVAL);
}
```

#### 3. Renderização por status

| `status` | O que exibir |
|---|---|
| `null` | Spinner — aguardando início do worker |
| `processando` | Spinner — IA gerando o PDI |
| `concluido` | Ícone de sucesso — PDI disponível |
| `falhou` | Ícone de erro + botão "Tentar novamente" |

Para exibir o PDI gerado de um envio concluído, chamar individualmente:

```
GET /api/empresas/envios/{envioId}/pdi
```

e ler `pdi.resposta`.

#### 4. Nova tentativa para falhas

Se algum envio retornar `status = falhou`, o front-end pode reenviar apenas os IDs com falha:

```tsx
const falhos = data.pdis
  .filter((p) => p.status === 'falhou')
  .map((p) => p.envio_id);

if (falhos.length > 0) {
  await api.post('/empresas/pdis/gerar-lote', { envio_ids: falhos });
}
```

---

- **CRUD de competências** (rotas autenticadas em `/api/empresas`):
  - `GET /api/empresas/competencias`: lista todas as competências.
    - Retorno esperado: array com `id`, `descricao`, `prompt_pdi`, `ativo`, `created_at`, `updated_at`.
  - `POST /api/empresas/competencias`: cria uma competência.
    - Payload mínimo:
      ```json
      {
        "descricao": "Comunicação",
        "prompt_pdi": "Sugira ações para comunicação...",
        "ativo": true
      }
      ```
    - Retorno esperado: objeto criado com `201 Created`.
  - `GET /api/empresas/competencias/{id}`: retorna uma competência específica.
  - `PUT /api/empresas/competencias/{competencia}`: atualiza os campos informados.
    - Retorno esperado: objeto atualizado.
  - `DELETE /api/empresas/competencias/{competencia}`: remove (soft delete) a competência.
    - Retorno esperado: `204 No Content`.
  - `GET /api/empresas/competencias/change-status/{idCompetencia}`: alterna o campo `ativo`.
    - Retorno esperado: objeto atualizado com o novo status.

- **CRUD de recomendações por competência** (rotas autenticadas em `/api/empresas/competencia-recomendacoes`):
  - Estrutura obrigatória dos campos de recomendação:
    - `livros_recomendados`: array de objetos `{ "titulo": string, "descricao": string, "link": string|null }`.
    - `videos_recomendados`: array de objetos `{ "titulo": string, "descricao": string, "url": string }` (URL precisa ser do YouTube).
    - `prompt_recomendacao`: texto que contextualiza a geração das recomendações (mínimo 10 caracteres).
  - `GET /api/empresas/competencia-recomendacoes`: lista todas as recomendações incluindo a competência relacionada.
  - `POST /api/empresas/competencia-recomendacoes`: cria recomendações para uma competência.
    - Payload mínimo:
      ```json
      {
        "competencia_id": 1,
        "livros_recomendados": [
          {"titulo": "Comunicação não violenta", "descricao": "Explica técnicas práticas para diálogos difíceis", "link": "https://exemplo.com/livro"}
        ],
        "videos_recomendados": [
          {"titulo": "Como dar feedback", "descricao": "Mostra exemplos e scripts de conversas", "url": "https://www.youtube.com/watch?v=abc123"}
        ],
        "prompt_recomendacao": "Sugira conteúdos para melhorar comunicação assertiva"
      }
      ```
    - Retorno esperado (201): objeto criado com as relações carregadas.
  - `GET /api/empresas/competencia-recomendacoes/{id}`: retorna as recomendações de uma competência específica.
  - `PUT /api/empresas/competencia-recomendacoes/{competenciaRecomendacao}`: atualiza livros, vídeos ou prompt.
    - Payload: mesma estrutura do `POST` (campos não enviados não são alterados).
    - Retorno esperado: objeto atualizado com a competência vinculada.
  - `DELETE /api/empresas/competencia-recomendacoes/{competenciaRecomendacao}`: remove (soft delete) a recomendação.
    - Retorno esperado: `204 No Content`.

- **CRUD de livros de PDI** (rotas autenticadas em `/api/empresas/livros-pdi`):
  - Campos obrigatórios: `competencia_id`, `titulo`, `link` (URL válida) e `descricao` (texto livre para relevância e resumo do conteúdo).
  - `GET /api/empresas/livros-pdi`: lista todos os livros com a competência vinculada.
  - `POST /api/empresas/livros-pdi`: cria um livro associado à competência.
    - Payload mínimo:
      ```json
      {
        "competencia_id": 1,
        "titulo": "Comunicação não violenta",
        "link": "https://exemplo.com/livro",
        "descricao": "Mostra técnicas práticas para conversas difíceis e indica por que é relevante."
      }
      ```
    - Retorno esperado (201): objeto criado com o relacionamento `competencia`.
  - `GET /api/empresas/livros-pdi/{id}`: retorna um livro específico com a competência.
  - `PUT /api/empresas/livros-pdi/{livroPdi}`: atualiza os dados do livro.
    - Payload: mesma estrutura do `POST`.
  - `DELETE /api/empresas/livros-pdi/{livroPdi}`: remove (soft delete) o livro.

- **CRUD de vídeos de PDI** (rotas autenticadas em `/api/empresas/videos-pdi`):
  - Campos obrigatórios: `competencia_id`, `titulo`, `link` (URL válida) e `descricao` (texto livre para relevância e resumo do conteúdo).
  - `GET /api/empresas/videos-pdi`: lista todos os vídeos com a competência vinculada.
  - `POST /api/empresas/videos-pdi`: cria um vídeo associado à competência.
    - Payload mínimo:
      ```json
      {
        "competencia_id": 1,
        "titulo": "Como dar feedback",
        "link": "https://www.youtube.com/watch?v=abc123",
        "descricao": "Explica a importância do conteúdo e dá exemplos práticos para aplicar."
      }
      ```
    - Retorno esperado (201): objeto criado com o relacionamento `competencia`.
  - `GET /api/empresas/videos-pdi/{id}`: retorna um vídeo específico com a competência.
  - `PUT /api/empresas/videos-pdi/{videoPdi}`: atualiza os dados do vídeo.
    - Payload: mesma estrutura do `POST`.
  - `DELETE /api/empresas/videos-pdi/{videoPdi}`: remove (soft delete) o vídeo.

## Cálculo de nota por competência
- **Coleta das respostas**: o serviço reúne as respostas do envio, associando perguntas às respectivas competências (`perguntas.competencia_id`).
- **Nota por pergunta**: a nota de cada pergunta soma `pontuacao_resposta` à soma de `pontuacao_opcao_resposta` das opções selecionadas.
- **Agrupamento**: as notas são agrupadas por `competencia_id`.
- **Média por competência**: para cada competência, é calculada a média ponderada das notas das perguntas vinculadas, utilizando `pontuacao_base` da pergunta como peso mínimo (peso padrão igual a 1 quando não informado).
- **Persistência**: cada média é salva ou atualizada em `envio_competencias` por `envio_id` e `competencia_id`, permitindo reprocessar o envio sem duplicar registros.

## Preparação dos dados para PDI
- Use `PdiService::montarDadosPdi($envioId)` para montar o payload pronto para consumo por IA.
- O retorno inclui os metadados do envio e a lista de competências avaliadas, contendo descrição, nota média ponderada e `prompt_pdi`.

## Reprocessamento
Caso novas respostas sejam adicionadas ou alteradas para um envio, basta chamar novamente `CalcularNotaCompetenciaService::calcularNotasPorEnvio($envioId)` para recalcular e atualizar as médias em `envio_competencias`.
