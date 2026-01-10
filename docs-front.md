# Orientações para desenvolver o front-end do fluxo de PDI

## Objetivo
Disponibilizar no front-end a visualização das competências avaliadas em um envio e preparar a interface para geração de PDI via IA.

## Pontos de integração
- **Envio de respostas**: acione `POST /api/externo-respostas` com o payload abaixo ao submeter o formulário público:
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
  O backend cria o envio, salva respostas e calcula automaticamente as médias ponderadas por competência (usando `pontuacao_base` de cada pergunta como peso), retornando a lista de respostas persistidas.

- **Serviço de cálculo**: o backend chama `RespostasService::responder`; não é necessário acionar manualmente o cálculo no front-end.

- **Dados consolidados de PDI**: consumir o endpoint autenticado `GET /api/empresas/envios/{envioId}/pdi` (enviar bearer token padrão da API). Ele retorna:
  - Metadados do envio: `envio_id`, `pesquisa_id`, `formulario_id`, `respondente`, `token_respondente`, `data_envio`.
  - Lista de competências: `competencia_id`, `descricao`, `prompt_pdi`, `nota` (média ponderada pela `pontuacao_base` das perguntas da competência).
  - PDI salvo (quando existir): `id`, `modelo`, `prompt`, `resposta` (JSON com recomendações e plano), timestamps de criação/atualização.
  - Exemplo de resposta:
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

- **Geração de PDI via IA**: endpoint autenticado `POST /api/empresas/envios/{envioId}/pdi/gerar`
  - Payload opcional:
    ```json
    {
      "contexto_adicional": "observações da liderança para enriquecer o plano"
    }
    ```
  - Retorno (201) com o PDI salvo no backend e pronto para exibição:
    ```json
    {
      "id": 12,
      "envio_id": 44,
      "modelo": "gpt-4o-mini",
      "prompt": "...prompt enviado para a OpenAI...",
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
  - O front-end pode exibir `resposta.pdi` diretamente, mantendo o histórico pelo `id` retornado.

- **Envio do PDI por e-mail**: endpoints autenticados
  - Individual: `POST /api/empresas/envios/{envioId}/pdi/enviar-email`
    - Sucesso (200): retorna `message` e `destinatario` com o e-mail usado.
    - Conteúdo do e-mail: inclui os dados do plano e as recomendações de desenvolvimento salvas no PDI, tanto em `resposta.recomendacoes` quanto em cada `resposta.pdi.competencias[].recomendacoes` (livros, vídeos, ações etc.).
    - Erros (400): texto explicando ausência de respondente ou de e-mail cadastrado.
  - Em massa: `POST /api/empresas/pesquisas/{pesquisaId}/pdi/enviar-email`
    - Sucesso (200): objeto resumo com `total_com_pdi`, `enviados`, `sem_email` e `sem_respondente`.
    - Use para disparar apenas para respondentes que já possuem PDI gerado.

- **Envio do link de pesquisa por e-mail**: endpoints autenticados
  - Individual: `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-email`
    - Payload: vazio.
    - Sucesso (200): retorna `message`, `destinatario` e `link` com a URL de resposta da pesquisa.
    - Erros (400): texto explicando ausência de respondente, pesquisa vinculada ou e-mail cadastrado.
  - Em massa: `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-email`
    - Payload: vazio.
    - Sucesso (200): objeto resumo com `total_respondentes`, `enviados`, `sem_email` e `sem_pessoa`.
    - O link enviado é montado a partir de `PESQUISA_RESPONDER_URL` (fallback em `APP_URL`), no formato `/pesquisas/{slug}?token=...`.

- **CRUD de competências** (rotas autenticadas em `/api/empresas`):
  - `GET /api/empresas/competencias`: lista todas as competências para montar combos de cadastro de perguntas.
    - Retorno esperado: array de objetos com `id`, `descricao`, `prompt_pdi`, `ativo`, `created_at`, `updated_at`.
  - `POST /api/empresas/competencias`: cria uma nova competência.
    - Payload mínimo: `{ "descricao": "Comunicação", "prompt_pdi": "Sugira ações...", "ativo": true }`.
    - Retorno esperado: objeto criado com `201 Created`.
  - `GET /api/empresas/competencias/{id}`: detalhe de uma competência.
  - `PUT /api/empresas/competencias/{competencia}`: atualiza campos informados.
  - `DELETE /api/empresas/competencias/{competencia}`: remove (soft delete) a competência.
  - `GET /api/empresas/competencias/change-status/{idCompetencia}`: alterna o campo `ativo` e devolve o objeto atualizado.

- **CRUD de recomendações de competência** (rotas autenticadas em `/api/empresas/competencia-recomendacoes`):
  - Estrutura dos campos de recomendação:
    - `livros_recomendados`: array de objetos `{ titulo, descricao, link? }`.
    - `videos_recomendados`: array de objetos `{ titulo, descricao, url }` (URL precisa ser YouTube).
    - `prompt_recomendacao`: string (mínimo 10 caracteres) contextualizando a curadoria das sugestões.
  - Criar/atualizar (`POST`/`PUT`):
    ```json
    {
      "competencia_id": 1,
      "livros_recomendados": [
        {"titulo": "Comunicação não violenta", "descricao": "Guia prático para conversas difíceis", "link": "https://exemplo.com/livro"}
      ],
      "videos_recomendados": [
        {"titulo": "Feedback assertivo", "descricao": "Exemplos práticos e roteiros de fala", "url": "https://www.youtube.com/watch?v=abc123"}
      ],
      "prompt_recomendacao": "Sugira conteúdos para melhorar comunicação assertiva"
    }
    ```
  - Listar (`GET /api/empresas/competencia-recomendacoes`): retorna a coleção com a competência vinculada; útil para montar tabelas de curadoria.
  - Detalhar (`GET /api/empresas/competencia-recomendacoes/{id}`): retorna um registro com o relacionamento `competencia` carregado.
  - Excluir (`DELETE /api/empresas/competencia-recomendacoes/{competenciaRecomendacao}`): remove o item (soft delete) e retorna `204`.
  - Use os campos `descricao` e `prompt_recomendacao` no front-end para exibir contexto e prevenir a geração de links inexistentes.

- **CRUD de livros do PDI** (rotas autenticadas em `/api/empresas/livros-pdi`):
  - Campos obrigatórios: `competencia_id`, `titulo`, `link` (URL válida) e `descricao` (texto livre com relevância e resumo).
  - Criar/atualizar (`POST`/`PUT`):
    ```json
    {
      "competencia_id": 1,
      "titulo": "Comunicação não violenta",
      "link": "https://exemplo.com/livro",
      "descricao": "Resumo do conteúdo e indicação da relevância para o PDI."
    }
    ```
  - Listar (`GET /api/empresas/livros-pdi`): retorna a coleção com a competência vinculada para exibir no grid.
  - Detalhar (`GET /api/empresas/livros-pdi/{id}`): retorna um item com a competência carregada.
  - Excluir (`DELETE /api/empresas/livros-pdi/{livroPdi}`): remove (soft delete) o item e retorna `204`.

- **CRUD de vídeos do PDI** (rotas autenticadas em `/api/empresas/videos-pdi`):
  - Campos obrigatórios: `competencia_id`, `titulo`, `link` (URL válida) e `descricao` (texto livre com relevância e resumo).
  - Criar/atualizar (`POST`/`PUT`):
    ```json
    {
      "competencia_id": 1,
      "titulo": "Como dar feedback",
      "link": "https://www.youtube.com/watch?v=abc123",
      "descricao": "Explica a importância do tema e dá exemplos práticos de aplicação."
    }
    ```
  - Listar (`GET /api/empresas/videos-pdi`): retorna a coleção com a competência vinculada para exibir no grid.
  - Detalhar (`GET /api/empresas/videos-pdi/{id}`): retorna um item com a competência carregada.
  - Excluir (`DELETE /api/empresas/videos-pdi/{videoPdi}`): remove (soft delete) o item e retorna `204`.

## Sugestão de componentes
- Tela de detalhes do envio com seção "Competências" listando descrição, nota média e botão para "Gerar PDI".
- Modal ou página dedicada para montar o payload a partir do retorno do backend e exibir o `prompt_pdi` associado.
- Estado de carregamento e tratamento de erros para a chamada que busca os dados consolidados.

## Boas práticas esperadas
- Usar nomes de variáveis, componentes e propriedades em português, sem abreviações.
- Seguir os padrões de estilo já adotados no projeto (estrutura de pastas, organização de componentes, convenções de hooks/stores se existirem).
- Evitar duplicação de lógica: centralizar chamadas ao backend em serviços/utilitários de API já usados no projeto.
- Não adicionar novas dependências externas; reutilizar a stack já presente (ex.: axios/fetch, bibliotecas de UI existentes).

## Checklist mínimo
- Endpoint chamado recebe `envio_id` e retorna a estrutura do `PdiService`.
- Listagem das competências com nota formatada.
- Exibição do `prompt_pdi` para cada competência ao preparar o payload de IA.
- Documentar no código (quando necessário) a origem dos dados e o serviço utilizado.
