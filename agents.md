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
  O backend cria o envio, salva respostas e calcula automaticamente as médias por competência, retornando a lista de respostas persistidas.

- **Serviço de cálculo**: o backend chama `RespostasService::responder`; não é necessário acionar manualmente o cálculo no front-end.

- **Dados consolidados de PDI**: consumir o endpoint autenticado `GET /api/empresas/envios/{envioId}/pdi` (enviar bearer token padrão da API). Ele retorna:
  - Metadados do envio: `envio_id`, `pesquisa_id`, `formulario_id`, `respondente`, `token_respondente`, `data_envio`.
  - Lista de competências: `competencia_id`, `descricao`, `prompt_pdi`, `nota`.
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
          "nota": 4.5
        }
      ]
    }
    ```

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
