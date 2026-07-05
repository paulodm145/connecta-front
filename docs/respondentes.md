# Respondentes

Endpoints para gestão de respondentes vinculados a pesquisas.

> **Autenticação**: todas as rotas usam bearer token via Passport (`auth:api`).
> **Prefixo**: `/api/empresas/`

---

## Rotas

### `GET /api/empresas/respondentes/pesquisa/{slug}` — Listar por pesquisa

Retorna todos os respondentes vinculados a uma pesquisa, incluindo dados da pessoa, cargo e setor.

**Parâmetros de URL**

| Param | Tipo   | Obrigatório | Descrição          |
|-------|--------|-------------|--------------------|
| slug  | string | sim         | Slug da pesquisa   |

**Resposta 200**

```json
[
  {
    "id": 1,
    "pessoa_id": 10,
    "pesquisa_id": 3,
    "token": "ABCD-EFGH-IJKL-MNOP",
    "status": true,
    "created_at": "01/06/2026 10:00:00",
    "updated_at": "01/06/2026 10:00:00",
    "deleted_at": null,
    "pesquisa_slug": "pesquisa-teste",
    "pessoa_nome": "João Silva",
    "pessoa_email": "joao@email.com",
    "pessoa_telefone": "11999999999",
    "pessoa_cpf": "12345678901",
    "setor_id": 1,
    "setor_descricao": "Tecnologia",
    "cargo_id": 2,
    "cargo_descricao": "Analista"
  }
]
```

**Campos retornados**

| Campo              | Origem              | Descrição                          |
|--------------------|---------------------|------------------------------------|
| `id`               | `respondentes`      | ID do respondente                  |
| `pessoa_id`        | `respondentes`      | ID da pessoa vinculada             |
| `pesquisa_id`      | `respondentes`      | ID da pesquisa                     |
| `token`            | `respondentes`      | Token único do respondente         |
| `status`           | `respondentes`      | Ativo/inativo                      |
| `pesquisa_slug`    | `pesquisas`         | Slug da pesquisa                   |
| `pessoa_nome`      | `pessoas`           | Nome da pessoa                     |
| `pessoa_email`     | `pessoas`           | E-mail da pessoa                   |
| `pessoa_telefone`  | `pessoas`           | Telefone da pessoa                 |
| `pessoa_cpf`       | `pessoas`           | CPF da pessoa                      |
| `setor_id`         | `setores`           | ID do setor (via cargo)            |
| `setor_descricao`  | `setores`           | Descrição do setor                 |
| `cargo_id`         | `cargos`            | ID do cargo                        |
| `cargo_descricao`  | `cargos`            | Descrição do cargo                 |

---

### `GET /api/empresas/respondentes` — Listar todos

Retorna todos os respondentes cadastrados.

---

### `POST /api/empresas/respondentes` — Criar respondente

Cria um novo respondente. O token é gerado automaticamente.

**Body**

| Campo        | Tipo    | Obrigatório | Descrição             |
|-------------|---------|-------------|-----------------------|
| pessoa_id   | integer | sim         | ID da pessoa          |
| pesquisa_id | integer | sim         | ID da pesquisa        |
| status      | boolean | não         | Ativo por padrão      |

---

### `GET /api/empresas/respondentes/{id}` — Buscar por ID

Retorna um respondente pelo ID.

---

### `PUT /api/empresas/respondentes/{id}` — Atualizar respondente

Atualiza os dados de um respondente. O token não pode ser alterado.

---

### `DELETE /api/empresas/respondentes/{id}` — Remover respondente

Remove (soft delete) um respondente.

---

### `GET /api/empresas/respondentes/change-status/{id}` — Alternar status

Alterna o status ativo/inativo do respondente.

---

### `POST /api/empresas/respondentes/adicionar-multiplos` — Adicionar em massa

Adiciona múltiplos respondentes a uma pesquisa. IDs já cadastrados na pesquisa são ignorados.

**Body**

| Campo            | Tipo      | Obrigatório | Descrição                    |
|-----------------|-----------|-------------|------------------------------|
| idsRespondentes | integer[] | sim         | Lista de IDs de pessoas      |
| pesquisaId      | integer   | sim         | ID da pesquisa               |

**Resposta 201**: lista dos respondentes recém-criados.

**Resposta 400**: `{ "success": false, "message": "Nenhum respondente foi adicionado, pois todos já estavam cadastrados." }`

---

### `GET /api/empresas/respondentes/respondentes-combo` — Combo para seleção

Retorna lista simplificada de pessoas ativas (`id` e `label`) para uso em selects/combos no front-end.

```json
[
  { "id": 1, "label": "João Silva" },
  { "id": 2, "label": "Maria Souza" }
]
```
