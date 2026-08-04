# Setores e Cargos — CRUD e Ordenação Alfabética

Documentação dos CRUDs de **Setores** e **Cargos** da empresa, com foco na ordenação padrão das listagens.

> Rotas sob `/api/empresas/*` exigem bearer token (Passport, `auth:api`) e operam no tenant do usuário autenticado.

---

## Rotas — Setores

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/empresas/setores` | Lista setores (com responsável) |
| `POST` | `/api/empresas/setores` | Cria setor |
| `GET` | `/api/empresas/setores/{id}` | Busca setor |
| `PUT` | `/api/empresas/setores/{id}` | Atualiza setor |
| `DELETE` | `/api/empresas/setores/{id}` | Remove setor (soft delete) |
| `GET` | `/api/empresas/setores/change-status/{id}` | Alterna ativo/inativo |
| `GET` | `/api/empresas/setores-ativos` | Lista apenas ativos |

### Campos

| Campo | Descrição |
|---|---|
| `descricao` | Nome do setor (usado como critério de ordenação) |
| `pessoa_id` | ID da pessoa responsável pelo setor (opcional) |
| `status` | Ativo/inativo |

---

## Rotas — Cargos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/empresas/cargos` | Lista cargos (com setor) |
| `POST` | `/api/empresas/cargos` | Cria cargo |
| `GET` | `/api/empresas/cargos/{id}` | Busca cargo |
| `PUT` | `/api/empresas/cargos/{id}` | Atualiza cargo |
| `DELETE` | `/api/empresas/cargos/{id}` | Remove cargo (soft delete) — bloqueado se houver pessoas vinculadas |
| `GET` | `/api/empresas/cargos/change-status/{id}` | Alterna ativo/inativo |

### Campos

| Campo | Descrição |
|---|---|
| `descricao` | Nome do cargo (usado como critério de ordenação) |
| `setor_id` | ID do setor ao qual o cargo pertence (opcional) |
| `status` | Ativo/inativo |

---

## Ordenação padrão alfabética

As listagens abaixo passaram a ordenar por **ordem alfabética** (`ASC`) em vez de por ordem de cadastro (`id DESC`) ou sem ordenação:

| Endpoint | Campo de ordenação | Antes |
|---|---|---|
| `GET /api/empresas/setores` | `descricao ASC` | `id DESC` |
| `GET /api/empresas/setores-ativos` | `descricao ASC` | `id DESC` |
| `GET /api/empresas/cargos` | `descricao ASC` | `id DESC` |

A ordenação é feita no backend — **o frontend não precisa mais ordenar a lista localmente** para exibir em ordem alfabética, mas pode continuar oferecendo outras ordenações (por status, por data etc.) via `sort_field`/`sort_direction` se essas telas já suportarem parâmetros de ordenação customizados. Hoje esses dois controllers **não** aceitam parâmetros de ordenação via query string — o `orderBy` é fixo no backend.

> A mesma mudança foi aplicada às listagens de **Pessoas** — veja [pessoas.md](pessoas.md#ordenação-padrão-alfabética).

### Instruções para o frontend

- Remover qualquer `sort()`/`localeCompare` aplicado no cliente sobre essas listas, caso exista, para evitar reordenações redundantes ou divergentes da ordenação do backend.
- Nenhuma mudança de contrato (nenhum campo novo, nenhum campo removido) — apenas a ordem dos itens no array retornado muda.
