# Fluxo de Envio de Respostas e Cálculo de Competências

## Visão geral

O fluxo atual permite que colaboradores respondam a formulários dinâmicos, gerando notas por pergunta e médias por competência para preparação do PDI.

## Passo a passo do envio

1. **Criação do envio**: `RespostasService::responder` cria um registro em `envios` com `pesquisa_id`, `formulario_id`, `token_respondente` e `tipo_envio`.
2. **Registro das respostas**: cada item recebido em `respostas` gera um registro em `respostas` com `pontuacao_resposta` (pontuação base da pergunta) e, quando houver, linhas em `respostas_opcoes` com as pontuações das opções selecionadas.
3. **Cálculo das competências**: após salvar todas as respostas, o serviço `CalcularNotaCompetenciaService` é chamado com o `envio_id` para calcular e persistir as médias ponderadas por competência em `envio_competencias`.

## Rotas

### `POST /api/externo-respostas` — Envio público de respostas

Autenticação: liberada pelo middleware `AcessoPublicoFormularioMiddleware`.

**Regras de negócio:**
- Só aceita respostas dentro do intervalo entre `data_inicio` e `data_fim` da pesquisa (quando definidos).
- Quando `resposta_unica` estiver ativa, o mesmo respondente não pode enviar mais de uma resposta para a pesquisa.

**Payload:**
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

**Comportamento:** cria o `envio`, registra cada resposta, soma pontuação base com as opções selecionadas e dispara o cálculo de competências.

**Retorno (200):**
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

**Erros:**
- `422`: pesquisa fora do prazo ou tentativa de resposta duplicada quando `resposta_unica` estiver ativa.

---

### `GET /api/externo-respostas/status` — Status de resposta do respondente

Autenticação: liberada pelo middleware `AcessoPublicoFormularioMiddleware`.

**Parâmetros de query:**
- `pesquisa_id` (obrigatório): id da pesquisa.
- `respondente` (obrigatório): token do respondente.
- `tipo_envio` (opcional): `COLABORADOR` (padrão) ou `LIDER`.

**Retorno (200):**
```json
{
  "respondido": true,
  "envio_id": 44,
  "pesquisa_id": 10,
  "tipo_envio": "COLABORADOR",
  "data_envio": "2025-11-20 12:00:00"
}
```

> Quando não houver envio, `respondido` retorna `false` e os campos `envio_id`/`data_envio` retornam `null`.

---

### `GET /api/empresas/respostas/relatorio-envio/{envioId}` — Relatório consolidado de um envio

Autenticação: rotas autenticadas do grupo `empresas`.

**Retorno:** coleção com texto da pergunta, resposta preenchida e pontuação total calculada por pergunta.

---

## Cálculo de nota por competência

- **Coleta das respostas**: o serviço reúne as respostas do envio, associando perguntas às respectivas competências (`perguntas.competencia_id`).
- **Nota por pergunta**: a nota de cada pergunta soma `pontuacao_resposta` à soma de `pontuacao_opcao_resposta` das opções selecionadas.
- **Agrupamento**: as notas são agrupadas por `competencia_id`.
- **Média por competência**: para cada competência, é calculada a média ponderada das notas das perguntas vinculadas, utilizando `pontuacao_base` da pergunta como peso mínimo (peso padrão igual a 1 quando não informado).
- **Persistência**: cada média é salva ou atualizada em `envio_competencias` por `envio_id` e `competencia_id`, permitindo reprocessar o envio sem duplicar registros.

## Preparação dos dados para PDI

Use `PdiService::montarDadosPdi($envioId)` para montar o payload pronto para consumo por IA. O retorno inclui os metadados do envio e a lista de competências avaliadas, contendo descrição, nota média ponderada e `prompt_pdi`.

## Reprocessamento

Caso novas respostas sejam adicionadas ou alteradas para um envio, basta chamar novamente `CalcularNotaCompetenciaService::calcularNotasPorEnvio($envioId)` para recalcular e atualizar as médias em `envio_competencias`.

## Campos adicionais em pesquisas

- `resposta_unica` (boolean): quando `true`, impede múltiplas respostas do mesmo respondente para a pesquisa.

## Ajustes recentes

- `perguntas.pergunta_texto` agora suporta textos longos (tipo `text`) para evitar truncamento em formulários extensos.
