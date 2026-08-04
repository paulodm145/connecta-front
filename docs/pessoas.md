# Pessoas (Colaboradores) — Cadastro, Importação e E-mail Opcional

Documentação do CRUD de colaboradores e da importação por planilha, com foco na regra de **e-mail opcional** e nas instruções de adequação do frontend.

> Rotas sob `/api/empresas/*` exigem bearer token (Passport, `auth:api`) e operam no tenant do usuário autenticado.

---

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/empresas/pessoas` | Lista colaboradores (com cargo) |
| `POST` | `/api/empresas/pessoas` | Cria colaborador |
| `GET` | `/api/empresas/pessoas/{id}` | Busca colaborador |
| `PUT` | `/api/empresas/pessoas/{id}` | Atualiza colaborador |
| `DELETE` | `/api/empresas/pessoas/{id}` | Remove colaborador (soft delete) |
| `GET` | `/api/empresas/pessoas/change-status/{id}` | Alterna ativo/inativo |
| `GET` | `/api/empresas/pessoas-ativas` | Lista apenas ativos |
| `GET` | `/api/empresas/pessoas-responsaveis` | Lista responsáveis ativos |
| `POST` | `/api/empresas/pessoas/importar` | Importa colaboradores de planilha `.xlsx`/`.xls` |
| `POST` | `/api/t/{cnpj}/auth/pessoas/login` | Login do colaborador (portal) |

---

## Ordenação padrão alfabética

As listagens abaixo passaram a ordenar por **nome, em ordem alfabética** (`ASC`) em vez de retornar sem ordenação explícita (ordem de inserção no banco):

| Endpoint | Campo de ordenação | Antes |
|---|---|---|
| `GET /api/empresas/pessoas` | `nome ASC` | sem ordenação |
| `GET /api/empresas/pessoas-ativas` | `nome ASC` | sem ordenação |

`GET /api/empresas/pessoas-responsaveis` já ordenava por `nome ASC` e não foi alterado.

A ordenação é feita no backend — **o frontend não precisa mais ordenar a lista localmente** para exibir em ordem alfabética. Nenhuma mudança de contrato (nenhum campo novo, nenhum campo removido) — apenas a ordem dos itens no array retornado muda.

> A mesma mudança foi aplicada às listagens de **Setores** e **Cargos** — veja [setores-cargos.md](setores-cargos.md#ordenação-padrão-alfabética).

---

## Regra: e-mail é opcional

O campo `email` **não é mais obrigatório** no cadastro nem na importação de pessoas. Alguns colaboradores não possuem e-mail, e isso não pode impedir o cadastro.

Comportamento com e-mail ausente (`null`):

- O colaborador é criado e gerenciado normalmente (pesquisas, PDI, relatórios).
- **Não consegue acessar o portal do colaborador** — o login (`/auth/pessoas/login`) é feito por e-mail.
- **Não recebe e-mails** de link de pesquisa nem de PDI: os serviços de envio pulam pessoas sem e-mail silenciosamente (a pessoa aparece nos contadores de "pulados"/não enviados quando aplicável).
- O e-mail continua **único** quando informado: duas pessoas não podem ter o mesmo e-mail, mas várias pessoas podem estar sem e-mail.

---

## `POST /api/empresas/pessoas` — criar colaborador

### Payload

```json
{
  "nome": "João da Silva",
  "cpf": "12345678901",
  "email": "joao@empresa.com.br",
  "telefone": "27999998888",
  "registro_funcional": "RF-001",
  "cargo_id": 1,
  "status": true,
  "responsavel": false,
  "data_admissao": "2024-01-15"
}
```

### Validação

| Campo | Regras |
|---|---|
| `nome` | obrigatório |
| `cpf` | obrigatório, string, único |
| `email` | **opcional** (`nullable`), formato de e-mail válido quando informado, único |
| `telefone` | obrigatório |
| `registro_funcional` | obrigatório |
| `cargo_id` | obrigatório, inteiro |
| `status` | obrigatório, booleano |
| `responsavel` | obrigatório |
| `data_admissao` | obrigatório, data |

Para cadastrar sem e-mail, envie `"email": null` ou simplesmente omita a chave do payload. **Não envie string vazia `""`** — string vazia falha na validação de formato de e-mail.

### Respostas

- `201` — colaborador criado (objeto da pessoa; `email` pode vir `null`)
- `400` — `{"error": "CPF já cadastrado"}` ou `{"error": "E-mail já cadastrado"}`
- `422` — erro de validação (formato de e-mail inválido, campo obrigatório ausente etc.)

---

## `POST /api/empresas/pessoas/importar` — importação por planilha

Envia um arquivo `arquivo` (`multipart/form-data`, `.xlsx` ou `.xls`) com cabeçalho na primeira linha.

### Colunas esperadas

| Coluna | Obrigatória | Observação |
|---|---|---|
| `nome` | sim | |
| `cpf` | sim | apenas números são considerados |
| `email` | **não** | célula pode ficar vazia |
| `telefone` | não | apenas números são considerados |
| `registro_funcional` | sim | |
| `cod_cargo` | sim | precisa existir na tabela de cargos, senão a linha é rejeitada |
| `status` | sim | `1`/`0` |
| `responsavel` | sim | `1`/`0` |
| `data_admissao` | não | aceita `DD/MM/YYYY`, `DD-MM-YYYY`, `YYYY-MM-DD`, `MM/DD/YYYY` ou serial do Excel |

### Chave de atualização (upsert)

A importação faz `updateOrCreate`:

- **Com e-mail na linha** → a pessoa é localizada pelo **e-mail** (comportamento original).
- **Sem e-mail na linha** → a pessoa é localizada pelo **CPF**.

Ou seja: reimportar a mesma planilha atualiza os registros em vez de duplicá-los, com ou sem e-mail.

### Resposta

```json
{
  "sucesso": 10,
  "erros": 2,
  "erros_detalhados": [
    {
      "linha": 5,
      "erro": "Cargo não encontrado: 99",
      "dados": { "nome": "...", "cod_cargo": 99 }
    },
    {
      "linha": 8,
      "erro": "Já existe um cadastro com o CPF informado (12345678901).",
      "dados": { "nome": "..." }
    }
  ]
}
```

---

## Instruções para o frontend

### 1. Formulário de cadastro/edição de pessoa

- Remover o `required` do campo **E-mail** (validação de formulário e marcação visual de obrigatório `*`).
- Manter a validação de **formato** quando o campo for preenchido.
- Ao submeter com o campo vazio, enviar `email: null` ou omitir a chave — **nunca enviar `""`** (string vazia retorna `422` do backend).
- Tipagem: `email` passa a ser `string | null` no tipo da pessoa (regenerar os tipos a partir de `GET /docs.openapi` já reflete isso).

### 2. Listagens e telas de detalhe

- Tratar `email === null` na renderização (exibir `—` ou "Sem e-mail" em vez de string vazia/`undefined`).

### 3. Tela de importação de pessoas

- Atualizar o texto de ajuda/modelo de planilha: a coluna `email` deixa de ser obrigatória.
- Se o frontend valida a planilha antes do upload, remover a exigência de e-mail preenchido.

### 4. Fluxos de envio de e-mail (link de pesquisa, PDI)

- Pessoas sem e-mail não recebem mensagens; o backend as pula sem erro.
- Recomendado: nas telas de disparo de e-mail, desabilitar a ação individual (ou exibir aviso) para pessoas com `email === null`, para o operador entender por que aquela pessoa não receberá o link.

### 5. Portal do colaborador

- O login do colaborador continua exigindo e-mail e senha. Pessoas sem e-mail não têm acesso ao portal — nenhuma mudança necessária, apenas ciência de que esse é o comportamento esperado.

---

## Alterações no banco (referência backend)

- Migration de tenant `2026_07_12_000001_alter_pessoas_email_nullable` torna `pessoas.email` nullable. Aplicar com `php artisan tenants:migrate` em cada ambiente.
- O índice `unique` de `email` permanece; no PostgreSQL, múltiplos `NULL` não violam a unicidade.
