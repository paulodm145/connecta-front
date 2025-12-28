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

- **Relatório consolidado de um envio**: `GET /api/empresas/respostas/relatorio-envio/{envioId}`
  - Autenticação: rotas autenticadas do grupo `empresas`.
  - Retorno esperado: coleção com texto da pergunta, resposta preenchida e pontuação total calculada por pergunta.

- **Dados consolidados para PDI**: `GET /api/empresas/envios/{envioId}/pdi`
  - Autenticação: grupo autenticado `empresas` (enviar bearer token padrão da aplicação).
  - Retorno esperado (exemplo):
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

- **Geração de PDI com IA**: `POST /api/empresas/envios/{envioId}/pdi/gerar`
  - Autenticação: grupo autenticado `empresas`.
  - Payload opcional:
    ```json
    {
      "contexto_adicional": "observações de liderança ou RH para enriquecer o plano"
    }
    ```
  - Comportamento: monta o payload via `PdiService::montarDadosPdi`, cria um prompt e envia para a API da OpenAI usando o modelo configurado em `OPENAI_MODEL`. O retorno é persistido em `pdis` e devolvido na resposta.
  - Resposta (201):
    ```json
    {
      "id": 1,
      "envio_id": 44,
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
    ```

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
