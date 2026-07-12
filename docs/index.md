# Documentação de API — Connecta Back

Índice da documentação de contratos, fluxos e comportamentos de API. Use os links abaixo para navegar entre os tópicos.

> Para a documentação interativa completa (Scribe), acesse `GET /docs` com o servidor rodando.

---

## Tópicos

| Arquivo | O que cobre |
|---|---|
| [respostas.md](respostas.md) | Envio de respostas de formulário, status, relatório consolidado, cálculo de notas por competência |
| [pdi-individual.md](pdi-individual.md) | Geração assíncrona de PDI por envio, consulta de status, dados consolidados, fluxo de polling |
| [pdi-lote.md](pdi-lote.md) | Geração em lote de PDI, consulta de status em lote, fluxo de polling para múltiplos envios |
| [emails.md](emails.md) | Envio de PDI por e-mail, link de pesquisa para respondentes, links de avaliação para responsáveis de setor |
| [competencias.md](competencias.md) | CRUD de competências, recomendações, livros e vídeos de PDI |
| [formularios-import-export.md](formularios-import-export.md) | Exportação e importação de estrutura de formulários (perguntas e opções), instruções de implementação para o frontend |
| [permissoes.md](permissoes.md) | Sistema de níveis e permissões multi-tenant: arquitetura, endpoints, catálogo completo de chaves e orientações de aplicação por tela/ação para o frontend |
| [pessoas.md](pessoas.md) | CRUD de colaboradores e importação por planilha, regra de e-mail opcional e instruções de adequação do frontend |

---

## Resumo das rotas por arquivo

### respostas.md
- `POST /api/externo-respostas` — envio público de respostas
- `GET /api/externo-respostas/status` — status de resposta de um respondente
- `GET /api/empresas/respostas/relatorio-envio/{envioId}` — relatório consolidado

### pdi-individual.md
- `POST /api/empresas/envios/{envioId}/pdi/gerar` — iniciar geração (202)
- `GET /api/empresas/envios/{envioId}/pdi` — dados completos + status do PDI
- `GET /api/empresas/envios/{envioId}/pdi/status` — status enxuto para polling

### pdi-lote.md
- `POST /api/empresas/pdis/gerar-lote` — disparar geração para múltiplos envios (202)
- `POST /api/empresas/pdis/status-lote` — status de todos os PDIs do lote

### emails.md
- `POST /api/empresas/envios/{envioId}/pdi/enviar-email` — PDI de um envio por e-mail
- `POST /api/empresas/pesquisas/{pesquisaId}/pdi/enviar-email` — PDI em massa por pesquisa
- `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-email` — link de pesquisa para um respondente
- `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-email` — link de pesquisa para todos os respondentes
- `POST /api/empresas/pesquisas/{pesquisaId}/setores/{setorId}/responsavel/enviar-email` — links de avaliação para responsável de um setor
- `POST /api/empresas/pesquisas/{pesquisaId}/setores/responsaveis/enviar-email` — links de avaliação para todos os responsáveis de setores

### competencias.md
- `GET|POST /api/empresas/competencias` — listar e criar
- `GET|PUT|DELETE /api/empresas/competencias/{id}` — buscar, atualizar, remover
- `GET /api/empresas/competencias/change-status/{id}` — alternar ativo/inativo
- `GET /api/empresas/competencias/exportar` — baixar todas as competências como arquivo JSON (com recomendações, livros e vídeos)
- `POST /api/empresas/competencias/importar` — importar competências de arquivo JSON (ignora duplicatas por descrição)
- `GET|POST|PUT|DELETE /api/empresas/competencia-recomendacoes` — CRUD de recomendações
- `GET|POST|PUT|DELETE /api/empresas/livros-pdi` — CRUD de livros
- `GET /api/empresas/livros-pdi/exportar` — baixar todos os livros agrupados por competência como arquivo JSON
- `POST /api/empresas/livros-pdi/importar` — importar livros de arquivo JSON (ignora duplicatas por título + competência; reporta competências não encontradas)
- `GET|POST|PUT|DELETE /api/empresas/videos-pdi` — CRUD de vídeos
- `GET /api/empresas/videos-pdi/exportar` — baixar todos os vídeos agrupados por competência como arquivo JSON
- `POST /api/empresas/videos-pdi/importar` — importar vídeos de arquivo JSON (ignora duplicatas por título + competência; reporta competências não encontradas)

### formularios-import-export.md
- `GET /api/empresas/formularios/{id}/exportar` — baixar estrutura do formulário como arquivo JSON
- `POST /api/empresas/formularios/importar` — criar formulário a partir de arquivo JSON exportado

### pessoas.md
- `GET|POST /api/empresas/pessoas` — listar e criar colaboradores (e-mail **opcional**)
- `GET|PUT|DELETE /api/empresas/pessoas/{id}` — buscar, atualizar, remover
- `GET /api/empresas/pessoas/change-status/{id}` — alternar ativo/inativo
- `GET /api/empresas/pessoas-ativas` — listar apenas ativos
- `GET /api/empresas/pessoas-responsaveis` — listar responsáveis ativos
- `POST /api/empresas/pessoas/importar` — importar planilha `.xlsx`/`.xls` (sem e-mail, o upsert usa o CPF como chave)

---

## Sistema de Permissões

> **Documentação completa: [permissoes.md](permissoes.md)** — arquitetura multi-tenant, endpoints, catálogo completo de chaves e a orientação de qual permissão aplicar em cada tela/menu/ação do frontend.

Resumo:

- Catálogo canônico em `config/permissoes.php`, propagado para o banco de cada tenant via `php artisan app:sincronizar-permissoes` (use `--empresa={id}` para um tenant específico). Tenants novos (`empresa:criar`) já nascem com o catálogo sincronizado.
- Níveis (`nivel`, `nivel_permissao`) são **por tenant** e totalmente independentes entre empresas; o vínculo do usuário está em `informacoes_usuario.nivel_id` (banco principal) e é validado contra o tenant da empresa do usuário.
- O frontend recebe a lista de chaves do usuário em `GET /api/me` (`data.permissoes`) e controla menus, rotas e botões.
- Existe o middleware `permissao:<chave>` para bloqueio de rotas no backend (403), ainda não aplicado às rotas de negócio — rollout gradual descrito em `permissoes.md`.

---

## Conceitos-chave

- **Status do PDI**: `null` (não iniciado) → `processando` → `concluido` | `falhou`
- **Polling recomendado**: 3–5 s; timeout de 3 minutos no front-end
- **Geração assíncrona**: todas as rotas `/pdi/gerar` retornam `202 Accepted` e processam em background
- **Autenticação pública**: endpoints `/api/externo-*` usam `AcessoPublicoFormularioMiddleware`
- **Autenticação interna**: demais rotas usam bearer token via Passport (`auth:api`)
