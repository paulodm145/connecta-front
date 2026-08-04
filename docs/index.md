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
| [whatsapp.md](whatsapp.md) | Envio de link de pesquisa via WhatsApp (Twilio) — individual e em massa |
| [respondentes.md](respondentes.md) | CRUD de respondentes, listagem por pesquisa, adição em massa |
| [competencias.md](competencias.md) | CRUD de competências, recomendações, livros e vídeos de PDI |
| [formularios-import-export.md](formularios-import-export.md) | Exportação e importação de estrutura de formulários (perguntas e opções), instruções de implementação para o frontend |
| [permissoes.md](permissoes.md) | Sistema de níveis e permissões multi-tenant: arquitetura, endpoints, catálogo completo de chaves e orientações de aplicação por tela/ação para o frontend |
| [pessoas.md](pessoas.md) | CRUD de colaboradores e importação por planilha, regra de e-mail opcional, ordenação alfabética padrão e instruções de adequação do frontend |
| [setores-cargos.md](setores-cargos.md) | CRUD de setores e cargos, ordenação alfabética padrão nas listagens |
| [formularios.md](formularios.md) | CRUD de formulários, com foco no novo endpoint de exclusão segura (bloqueado quando há pesquisas/envios vinculados) |
| [tipos-pesquisa.md](tipos-pesquisa.md) | CRUD de tipos de pesquisa e os 8 tipos padrão (incluindo Avaliação de Desempenho A–D) criados automaticamente para todo tenant novo |

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

### respondentes.md
- `GET /api/empresas/respondentes` — listar todos
- `POST /api/empresas/respondentes` — criar respondente
- `GET /api/empresas/respondentes/{id}` — buscar por ID
- `PUT /api/empresas/respondentes/{id}` — atualizar respondente
- `DELETE /api/empresas/respondentes/{id}` — remover respondente
- `GET /api/empresas/respondentes/pesquisa/{slug}` — listar por pesquisa (com telefone, cargo, setor)
- `GET /api/empresas/respondentes/change-status/{id}` — alternar status
- `POST /api/empresas/respondentes/adicionar-multiplos` — adicionar em massa
- `GET /api/empresas/respondentes/respondentes-combo` — combo para seleção

### emails.md
- `POST /api/empresas/envios/{envioId}/pdi/enviar-email` — PDI de um envio por e-mail
- `POST /api/empresas/pesquisas/{pesquisaId}/pdi/enviar-email` — PDI em massa por pesquisa
- `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-email` — link de pesquisa para um respondente
- `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-email` — link de pesquisa para todos os respondentes
- `POST /api/empresas/pesquisas/{pesquisaId}/setores/{setorId}/responsavel/enviar-email` — links de avaliação para responsável de um setor
- `POST /api/empresas/pesquisas/{pesquisaId}/setores/responsaveis/enviar-email` — links de avaliação para todos os responsáveis de setores

### whatsapp.md
- `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-whatsapp` — link de pesquisa via WhatsApp para um respondente
- `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-whatsapp` — link de pesquisa via WhatsApp para todos os respondentes

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

### formularios.md
- `GET|POST /api/empresas/formularios` — listar e criar formulários
- `GET|PUT /api/empresas/formularios/{id}` — buscar, atualizar
- `DELETE /api/empresas/formularios/{id}` — **novo** — excluir (soft delete; bloqueado se houver pesquisas/envios vinculados — usar inativação nesse caso)
- `GET /api/empresas/formularios/change-status/{id}` — alternar `RASCUNHO`/`PUBLICADO`
- `GET /api/empresas/formularios-ativos` — listar apenas publicados

### pessoas.md
- `GET|POST /api/empresas/pessoas` — listar (ordem alfabética por `nome`) e criar colaboradores (e-mail **opcional**)
- `GET|PUT|DELETE /api/empresas/pessoas/{id}` — buscar, atualizar, remover
- `GET /api/empresas/pessoas/change-status/{id}` — alternar ativo/inativo
- `GET /api/empresas/pessoas-ativas` — listar apenas ativos (ordem alfabética por `nome`)
- `GET /api/empresas/pessoas-responsaveis` — listar responsáveis ativos (ordem alfabética por `nome`)
- `POST /api/empresas/pessoas/importar` — importar planilha `.xlsx`/`.xls` (sem e-mail, o upsert usa o CPF como chave)

### setores-cargos.md
- `GET|POST /api/empresas/setores` — listar (ordem alfabética por `descricao`) e criar setores
- `GET|PUT|DELETE /api/empresas/setores/{id}` — buscar, atualizar, remover
- `GET /api/empresas/setores/change-status/{id}` — alternar ativo/inativo
- `GET /api/empresas/setores-ativos` — listar apenas ativos (ordem alfabética por `descricao`)
- `GET|POST /api/empresas/cargos` — listar (ordem alfabética por `descricao`) e criar cargos
- `GET|PUT|DELETE /api/empresas/cargos/{id}` — buscar, atualizar, remover (bloqueado se houver pessoas vinculadas)
- `GET /api/empresas/cargos/change-status/{id}` — alternar ativo/inativo

### tipos-pesquisa.md
- `GET|POST /api/empresas/tipos-pesquisas` — listar e criar tipos de pesquisa
- `GET|PUT|DELETE /api/empresas/tipos-pesquisas/{id}` — buscar, atualizar, remover
- `GET /api/empresas/tipos-pesquisas/change-status/{id}` — alternar ativo/inativo
- `GET /api/empresas/tipos-pesquisas/pesquisas-ativas` — listar apenas ativos
- Todo tenant novo já nasce com 8 tipos padrão, incluindo Avaliação de Desempenho A–D

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
