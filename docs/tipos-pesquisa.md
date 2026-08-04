# Tipos de Pesquisa — CRUD e Padrões de Tenant

Documentação do CRUD de **Tipos de Pesquisa** e dos tipos padrão que todo tenant novo recebe automaticamente.

> Rotas sob `/api/empresas/*` exigem bearer token (Passport, `auth:api`) e operam no tenant do usuário autenticado.

---

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/empresas/tipos-pesquisas` | Lista todos os tipos de pesquisa |
| `POST` | `/api/empresas/tipos-pesquisas` | Cria tipo de pesquisa |
| `GET` | `/api/empresas/tipos-pesquisas/{id}` | Busca tipo de pesquisa |
| `PUT` | `/api/empresas/tipos-pesquisas/{id}` | Atualiza tipo de pesquisa |
| `DELETE` | `/api/empresas/tipos-pesquisas/{id}` | Remove tipo de pesquisa (soft delete) |
| `GET` | `/api/empresas/tipos-pesquisas/change-status/{id}` | Alterna ativo/inativo |
| `GET` | `/api/empresas/tipos-pesquisas/pesquisas-ativas` | Lista apenas os ativos (`status = true`) |

### Campos

| Campo | Tipo | Observação |
|---|---|---|
| `descricao` | string (até 255 caracteres) | Texto livre. Alguns tipos padrão usam textos longos com exemplos — ver seção abaixo |
| `status` | boolean | Ativo/inativo |

Não há um campo separado para "detalhamento" ou "exemplos" — o texto completo (incluindo explicações do tipo "Ex: ...") vive dentro de `descricao`.

---

## Tipos padrão criados para todo tenant novo

Ao criar uma empresa (`EmpresaService::store()`), o sistema executa `tenants:seed`, que roda `TipoPesquisaSeeder` e garante os seguintes 8 tipos no tenant:

### Genéricos (já existiam)

1. Pesquisa de Clima Organizacional
2. Pesquisa de satisfação do cliente
3. Pesquisa de satisfação do colaborador
4. Pesquisa de satisfação do fornecedor

### Avaliação de Desempenho — Padrão A a D (novos)

| Tipo | Descrição completa (campo `descricao`) |
|---|---|
| **Padrão A** | Avaliação de Desempenho Padrão A – Para Funcionários cuja mão de obra não exige qualificação prévia. Ex: Auxiliar de Serviços Gerais |
| **Padrão B** | Avaliação de Desempenho Padrão B – Para Funcionários cuja mão de obra exige alguma qualificação prévia. Ex: Auxiliares e Assistentes |
| **Padrão C** | Avaliação de Desempenho Padrão C – Para Funcionários cuja mão de obra exige qualificação prévia e que trabalham sozinhos ao executarem a função. Também podemos dizer que é para mão de obra especializada. Ex: Motorista, Eletricista e etc |
| **Padrão D** | Avaliação de Desempenho Padrão D – Para Funcionários que ocupam cargo de Chefia. Ex: Encarregado, Supervisor, Gerente e etc |

Esses 4 tipos definem qual modelo de avaliação de desempenho se aplica a cada perfil de colaborador, com base na complexidade/autonomia da função — do trabalho sem qualificação prévia (A) até cargos de chefia (D).

Todos os 8 tipos são criados com `status = true` (ativos) e, depois de criados, são **tipos de pesquisa normais**: podem ser editados, renomeados, inativados ou excluídos pelo tenant via o CRUD acima, sem nenhuma proteção especial.

---

## Correção aplicada no seeder (referência backend)

O `TipoPesquisaSeeder` tinha dois problemas corrigidos nesta mudança:

- **Coluna errada**: inseria na coluna `ativo`, que uma migration posterior renomeou para `status`. O insert estava falhando silenciosamente (a exceção era capturada e apenas logada por `RunTenantSeeders`, tenant a tenant).
- **Sem checagem de duplicidade**: `tenants:seed` roda para **todos os tenants ativos** toda vez que uma nova empresa é criada (não só para o tenant novo). Sem checar existência prévia, cada empresa nova cadastrada duplicaria os tipos de pesquisa em todos os tenants já existentes.

Agora o seeder verifica, por `descricao`, se o tipo já existe no tenant antes de inserir — é seguro rodar repetidamente. Se um tenant já removeu (soft delete) algum tipo padrão, ele **não** é recriado automaticamente nas próximas execuções.

### Tenants já existentes

Essa correção só passa a valer a partir de agora, para novas execuções de `tenants:seed`. Tenants criados antes desta mudança **não recebem os 4 tipos novos retroativamente** — para populá-los é necessário:

- Rodar `php artisan tenants:seed` manualmente (repopula todos os tenants ativos, de forma segura/idempotente agora); ou
- Cadastrar os tipos manualmente via `POST /api/empresas/tipos-pesquisas` no tenant desejado.

---

## Instruções para o frontend

### 1. Exibição em listas e seletores (`select`/`combobox`)

Os 4 novos tipos têm `descricao` bem mais longa (até ~237 caracteres) do que os tipos genéricos anteriores (~30–40 caracteres). Se a tela de cadastro de pesquisa usa um `<select>` ou combobox para escolher o `tipo_pesquisa_id`, ajustar para não quebrar o layout:

- Truncar o texto exibido (ex.: `text-overflow: ellipsis` com `max-width`) e mostrar a `descricao` completa em `title`/tooltip ao passar o mouse ou focar o item.
- Evitar componentes de select nativos de largura fixa pequena — considerar um combobox com item multi-linha ou um texto secundário menor exibindo o restante da descrição.

### 2. Formulário de criação/edição de tipo de pesquisa

- O campo `descricao` já aceita até 255 caracteres — se o formulário tiver uma validação de tamanho máximo mais curta (ex.: pensada para os textos genéricos antigos), aumentar o limite para 255 e ajustar contador de caracteres, se houver.
- Nenhuma mudança de campo: continua sendo só `descricao` + `status`, sem campos novos no payload.

### 3. Nenhuma ação necessária para novos tenants

Os 8 tipos padrão (incluindo os 4 novos de Avaliação de Desempenho) já chegam prontos automaticamente na criação de uma empresa — não é preciso nenhuma chamada extra do frontend no fluxo de onboarding de tenant.

### 4. Tenants já existentes (se o produto decidir retroagir)

Caso o time decida que tenants já existentes também devem ganhar os 4 novos tipos, isso é uma ação manual de backend (`tenants:seed` ou cadastro avulso) — não há endpoint de "aplicar padrões" que o frontend deva disparar.
