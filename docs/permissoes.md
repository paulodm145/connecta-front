# Sistema de Permissões — Guia Completo (Backend + Frontend)

Este documento é a referência oficial do sistema de níveis e permissões: como ele funciona na arquitetura multi-tenant, quais endpoints consumir e, principalmente, **qual chave de permissão o frontend deve usar em cada tela, menu e ação**.

---

## 1. Arquitetura

### 1.1 Onde cada coisa vive

| Item | Banco | Tabela | Observação |
|---|---|---|---|
| Catálogo de permissões (fonte da verdade) | — | `config/permissoes.php` | Versionado no código. Nunca edite permissões direto no banco. |
| Permissões disponíveis no tenant | Tenant (`conexao_dinamica`) | `permissoes` | Cópia sincronizada do catálogo. |
| Níveis de acesso | Tenant (`conexao_dinamica`) | `nivel` | **Cada tenant tem seus próprios níveis**, independentes dos demais. |
| Associação nível ↔ permissões | Tenant (`conexao_dinamica`) | `nivel_permissao` | FK com `ON DELETE CASCADE` nas duas pontas. |
| Vínculo usuário → nível | Principal (`pgsql`) | `informacoes_usuario.nivel_id` | O `nivel_id` é interpretado **no tenant da empresa do usuário**. |
| Flag de super administrador | Principal (`pgsql`) | `users.super_administrador` | Ignora níveis: recebe todas as chaves do catálogo. |

### 1.2 Fluxo de resolução das permissões de um usuário

```
login → GET /api/me
          │
          ├── super_administrador = true → todas as chaves de config/permissoes.php
          │                                 (independente de tenant; funciona mesmo
          │                                  sem empresa vinculada)
          │
          └── usuário comum → informacoes_usuario.nivel_id
                                │
                                └── banco do tenant da empresa do usuário:
                                    nivel_permissao → permissoes.nome (chaves)
```

A resposta de `GET /api/me` traz `data.permissoes` como um array de chaves:

```json
{
  "data": {
    "id": 12,
    "name": "Maria",
    "super_administrador": false,
    "permissoes": [
      "cadastros.cadastros.menu.exibir",
      "cadastros.pessoas.adicionar",
      "pesquisas.pesquisas.exibir.menu"
    ]
  }
}
```

### 1.3 Independência entre tenants

- Os níveis são criados e gerenciados **dentro de cada tenant** (`/api/empresas/niveis`). O nível `id=3` da empresa A não tem nenhuma relação com o `id=3` da empresa B.
- Ao **criar um banco de tenant** (`php artisan empresa:criar {empresa_id}`), o catálogo de permissões é sincronizado automaticamente — o tenant nasce pronto para criar níveis.
- Ao **alterar o catálogo** (`config/permissoes.php`), rode a sincronização:

```bash
# todos os tenants
php artisan app:sincronizar-permissoes

# apenas o tenant de uma empresa
php artisan app:sincronizar-permissoes --empresa=42
```

A sincronização insere chaves novas, atualiza descrições e **remove chaves que saíram do catálogo** (as associações com níveis caem em cascata).

- No painel administrativo, o vínculo usuário ↔ nível é validado contra o tenant da empresa do usuário: o backend rejeita (`422`) um `nivel_id` que não exista no tenant da empresa informada.

---

## 2. Endpoints

### 2.1 Autenticação / sessão

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/api/me` | Retorna o usuário logado com `permissoes` (array de chaves). **Carregue no bootstrap do app e guarde em estado global.** |

### 2.2 Gestão de níveis (tenant do usuário logado)

Base: `/api/empresas` — autenticado via `auth:api`. Todas operam no tenant da empresa do usuário logado.

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/niveis` | Lista níveis com suas chaves de permissão |
| `GET` | `/niveis/{id}` | Detalhe de um nível |
| `POST` | `/niveis` | Cria nível. Body: `{ descricao, status, permissoes: ["chave", ...] }` |
| `PUT` | `/niveis/{id}` | Atualiza nível e sincroniza permissões |
| `DELETE` | `/niveis/{id}` | Exclui nível. Retorna **409** se houver usuários associados |
| `GET` | `/niveis/change-status/{id}` | Ativa/inativa nível |
| `GET` | `/permissoes` | Permissões sincronizadas no tenant (tabela `permissoes`) |
| `GET` | `/tree-view-permissoes-menu` | Catálogo agrupado por menu — use na tela de criação/edição de nível (tree view de checkboxes) |

### 2.3 Painel administrativo (usuários de qualquer empresa)

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/api/usuarios-admin/niveis-empresa/{identificadorEmpresa}` | **Novo.** Lista os níveis ativos do tenant da empresa informada. Use no formulário de criação/edição de usuário do painel admin — **nunca** use `/api/empresas/niveis` nesse contexto, pois ele retorna os níveis do tenant do usuário logado, não da empresa alvo. |
| `POST` | `/api/usuarios-admin` | Cria usuário. O `nivel_id` deve pertencer ao tenant de `identificador_empresa` (validação no backend, `422` se inválido). |
| `PUT` | `/api/usuarios-admin/{id}` | Atualiza usuário; mesma validação de `nivel_id`. |

### 2.4 Enforcement no backend (middleware `permissao`)

Existe o middleware `permissao:<chave>[,<chave2>...]` (passa se o usuário tiver **ao menos uma** das chaves; super administradores sempre passam):

```php
Route::post('setores', [SetoresController::class, 'store'])
    ->middleware('permissao:cadastros.setores.adicionar');
```

Resposta em caso de bloqueio:

```json
// HTTP 403
{
  "message": "Você não tem permissão para executar esta ação.",
  "permissoes_necessarias": ["cadastros.setores.adicionar"]
}
```

> **Estado atual do rollout:** o middleware está disponível, mas ainda **não** está aplicado às rotas de negócio — a guarda continua sendo feita na UI. Antes de ativar rota a rota, garanta que os níveis de todos os tenants estejam com as permissões corretas, senão os usuários passarão a receber 403. O frontend deve, desde já, **tratar 403 globalmente** (toast "sem permissão" + não deslogar o usuário).

---

## 3. Orientações de uso no frontend

### 3.1 Regras gerais

1. **Fonte única**: use apenas `data.permissoes` de `GET /api/me`. Não infira permissão por nível, nome de nível ou flag de admin — a exceção é `super_administrador`, que já vem com todas as chaves no próprio array.
2. **Cache**: carregue as permissões uma vez no login/bootstrap e recarregue após qualquer troca de nível do próprio usuário. Não consulte `/me` a cada render.
3. **Três camadas de aplicação**:
   - **Menu**: chaves `*.menu.*` / `*.exibir.menu` controlam a visibilidade de itens do menu lateral.
   - **Rota/tela**: proteja a rota da tela com a mesma chave do menu correspondente (usuário sem a chave não deve acessar a URL diretamente).
   - **Ação**: botões/ícones (adicionar, editar, excluir, bloquear, importar, exportar...) usam as chaves de ação. Sem a chave → **oculte** o controle (preferível a desabilitar).
4. **Chave inexistente no array = negado.** Nunca use fallback "permitir se não encontrar".
5. **403 do backend**: trate como "sem permissão" (a UI pode estar desatualizada em relação ao nível), não como erro de sessão.

### 3.2 Exemplo de helper (React)

```ts
// permissions.ts
export function usePermissions() {
  const { user } = useAuth(); // data de GET /api/me
  const set = useMemo(() => new Set(user?.permissoes ?? []), [user]);
  return {
    can: (...chaves: string[]) => chaves.some((c) => set.has(c)),
  };
}

// uso
const { can } = usePermissions();
{can('cadastros.pessoas.adicionar') && <BotaoNovaPessoa />}
```

---

## 4. Catálogo de permissões por tela e ação

> Fonte: `config/permissoes.php`. O endpoint `GET /api/empresas/tree-view-permissoes-menu` retorna exatamente esta estrutura.

### 4.1 Grupo `superadmin` — Painel administrativo (SaaS)

Contexto: telas do painel de administração da plataforma (fora do tenant). Normalmente restritas a operadores internos.

| Chave | Onde aplicar |
|---|---|
| `superadmin.menu.superadmin` | Menu raiz "SuperAdmin" |
| `superadmin.menu.clientes` | Item de menu "Clientes" |
| `superadmin.menu.empresas` | Item de menu "Empresas" (tela `/empresas-admin`) |
| `superadmin.menu.usuarios` | Item de menu "Usuários" (tela `/usuarios-admin`) |
| `superadmin.menu.usuarios.niveis` | Item de menu "Níveis de usuário" |
| `superadmin.empresas.adicionar` | Botão "Nova empresa" |
| `superadmin.empresas.editar` | Ação editar na listagem de empresas |
| `superadmin.empresas.bloquear` | Ação bloquear/ativar empresa (`change-status`) |
| `superadmin.empresas.excluir` | Ação excluir empresa |
| `superadmin.usuarios.adicionar` | Botão "Novo usuário" |
| `superadmin.usuarios.editar` | Ação editar usuário |
| `superadmin.usuarios.excluir` | Ação excluir usuário |
| `superadmin.usuarios.bloquear` | Ação bloquear/ativar usuário (`change-status`) |

### 4.2 Grupo `cadastros` — Setores, Cargos e Pessoas

Contexto: telas de cadastro básicos do tenant.

| Chave | Onde aplicar |
|---|---|
| `cadastros.cadastros.menu.exibir` | Menu raiz "Cadastros" |
| `cadastros.setor.menu.exibir` | Item de menu / rota da tela de Setores |
| `cadastros.setores.adicionar` | Botão "Novo setor" |
| `cadastros.setores.editar` | Ação editar setor |
| `cadastros.setores.excluir` | Ação excluir setor |
| `cadastros.setores.bloquear` | Ação bloquear/ativar setor (`change-status`) |
| `cadastros.cargos.menu.exibir` | Item de menu / rota da tela de Cargos |
| `cadastros.cargos.adicionar` | Botão "Novo cargo" |
| `cadastros.cargos.editar` | Ação editar cargo |
| `cadastros.cargos.excluir` | Ação excluir cargo |
| `cadastros.cargos.bloquear` | Ação bloquear/ativar cargo (`change-status`) |
| `cadastros.pessoas.menu.exibir` | Item de menu / rota da tela de Pessoas (colaboradores) |
| `cadastros.pessoas.adicionar` | Botão "Nova pessoa" |
| `cadastros.pessoas.editar` | Ação editar pessoa |
| `cadastros.pessoas.excluir` | Ação excluir pessoa |
| `cadastros.pessoas.bloquear` | Ação bloquear/ativar pessoa (`change-status`) |
| `cadastros.pessoas.importar` | Botão "Importar planilha" (`POST /pessoas/importar`) |

### 4.3 Grupo `formularios` — Formulários

Contexto: tela de construção de formulários (perguntas e opções).

| Chave | Onde aplicar |
|---|---|
| `formularios.formularios.exibir.menu` | Item de menu / rota da tela de Formulários |
| `formularios.formularios.adicionar` | Botão "Novo formulário" |
| `formularios.formularios.editar` | Ação editar formulário (e o builder de perguntas) |
| `formularios.formularios.alterar.status` | Toggle Publicado/Rascunho (`change-status`) |
| `formularios.formularios.exportar` | Botão "Exportar" (`GET /formularios/{id}/exportar`) |
| `formularios.formularios.importar` | Botão "Importar" (`POST /formularios/importar`) |

### 4.4 Grupo `competencias` — Competências, Livros e Vídeos PDI

Contexto: telas de competências e do acervo de recomendações do PDI.

| Chave | Onde aplicar |
|---|---|
| `competencias.competencias.exibir.menu` | Item de menu / rota da tela de Competências |
| `competencias.competencias.adicionar` | Botão "Nova competência" |
| `competencias.competencias.editar` | Ação editar competência (inclui recomendações) |
| `competencias.competencias.excluir` | Ação excluir competência |
| `competencias.competencias.ativar.inativar` | Toggle ativo/inativo (`change-status`) |
| `competencias.competencias.exportar` | Botão "Exportar JSON" |
| `competencias.competencias.importar` | Botão "Importar JSON" |
| `competencias.livros.exibir.menu` | Item de menu / rota da tela de Livros PDI |
| `competencias.livros.adicionar` | Botão "Novo livro" |
| `competencias.livros.editar` | Ação editar livro |
| `competencias.livros.excluir` | Ação excluir livro |
| `competencias.livros.exportar` | Botão "Exportar livros" |
| `competencias.livros.importar` | Botão "Importar livros" |
| `competencias.videos.exibir.menu` | Item de menu / rota da tela de Vídeos PDI |
| `competencias.videos.adicionar` | Botão "Novo vídeo" |
| `competencias.videos.editar` | Ação editar vídeo |
| `competencias.videos.excluir` | Ação excluir vídeo |
| `competencias.videos.exportar` | Botão "Exportar vídeos" |
| `competencias.videos.importar` | Botão "Importar vídeos" |

### 4.5 Grupo `pesquisas` — Pesquisas, Respondentes, Relatórios e PDI

Contexto: tela de listagem/gestão de pesquisas, tela de respondentes, relatório do envio e ações de PDI.

| Chave | Onde aplicar |
|---|---|
| `pesquisas.pesquisas.exibir.menu` | Menu raiz "Pesquisas" |
| `pesquisas.listagem.exibir.menu` | Item de menu / rota da listagem de pesquisas |
| `pesquisas.pesquisas.adicionar` | Botão "Nova pesquisa" |
| `pesquisas.pesquisas.editar` | Ação editar pesquisa |
| `pesquisas.pesquisas.ativar.inativar` | Toggle ativo/inativo da pesquisa (`change-status`) |
| `pesquisas.pesquisas.adicionar.respondentes` | Botão "Adicionar respondentes" no contexto da pesquisa |
| `pesquisas.pesquisas.adicionar.respondentes.tela` | Botão "Adicionar" dentro da tela de respondentes |
| `pesquisas.pesquisas.adicionar.respondentes.lote` | Botão "Adicionar em lote" (`POST /respondentes/adicionar-multiplos`) |
| `pesquisas.pesquisas.bloquear.respondentes` | Ação bloquear respondente (`change-status`) |
| `pesquisas.pesquisas.editar.respondentes` | Ação editar respondente |
| `pesquisas.pesquisas.excluir.respondentes` | Ação excluir respondente |
| `pesquisas.pesquisas.copiar.link.pesquisa` | Botão "Copiar link" da pesquisa/respondente |
| `pesquisas.pesquisas.enviar.link.email` | Botões "Enviar link por e-mail" (individual e em massa) |
| `pesquisas.pesquisas.enviar.link.setores` | Botões "Enviar links aos responsáveis de setor" |
| `pesquisas.pesquisas.ver.relatorio` | Ação "Ver relatório" do envio (rota do relatório) |
| `pesquisas.relatorio.anotacoes.avaliado` | Aba/bloco "Anotações do avaliado" no relatório |
| `pesquisas.relatorio.anotacoes.lider` | Aba/bloco "Anotações do avaliador/líder" no relatório |
| `pesquisas.relatorio.anotacoes.pdi` | Aba/bloco "PDI do avaliado" no relatório |
| `pesquisas.pdi.gerar` | Botão "Gerar PDI" (individual, `POST /envios/{id}/pdi/gerar`) |
| `pesquisas.pdi.gerar.lote` | Botão "Gerar PDI em lote" (`POST /pdis/gerar-lote`) |
| `pesquisas.pdi.enviar.email` | Botões "Enviar PDI por e-mail" (individual e em massa) |
| `pesquisas.exportar.xlsx` | Botão "Exportar XLSX" das respostas |
| `pesquisas.avaliacao.lider` | Fluxo/tela de avaliação do líder |
| `pesquisas.tipo.pesquisa.exibir.menu` | Item de menu / rota da tela de Tipos de Pesquisa |
| `pesquisas.tipo.pesquisa.adicionar` | Botão "Novo tipo de pesquisa" |
| `pesquisas.tipo.pesquisa.editar` | Ação editar tipo de pesquisa |
| `pesquisas.tipo.pesquisa.ativar.inativar` | Toggle ativo/inativo (`change-status`) |
| `pesquisas.tipo.pesquisa.excluir` | Ação excluir tipo de pesquisa ⚠️ chave renomeada, ver §5 |

### 4.6 Grupo `minha_empresa` — Dados da empresa

| Chave | Onde aplicar |
|---|---|
| `minha.empresa.exibir.menu` | Item de menu / rota da tela "Minha empresa" |
| `minha.empresa.editar` | Botão "Salvar/Editar dados" (`PUT /empresa-cliente`) |

---

## 5. Notas de migração (breaking changes desta revisão)

1. **Chave renomeada**: `pesquisas.tipo.pesquisa.esxcluir.respondentes` (typo) → **`pesquisas.tipo.pesquisa.excluir`**.
   - Após rodar `php artisan app:sincronizar-permissoes`, a chave antiga é removida dos tenants e a associação com níveis se perde. **Reatribua a nova chave aos níveis que tinham a antiga** e atualize qualquer verificação no frontend.
2. **Chaves novas** (precisam ser atribuídas aos níveis para surtirem efeito):
   - `pesquisas.pesquisas.enviar.link.email`
   - `pesquisas.pesquisas.enviar.link.setores`
   - `pesquisas.pdi.gerar`
   - `pesquisas.pdi.gerar.lote`
   - `pesquisas.pdi.enviar.email`
3. **`DELETE /api/empresas/niveis/{id}`** agora retorna `409` quando o nível está em uso por usuários da empresa.
4. **`POST/PUT /api/usuarios-admin`** agora retornam `422` quando o `nivel_id` não pertence ao tenant da empresa do usuário.
5. **Novo endpoint**: `GET /api/usuarios-admin/niveis-empresa/{identificadorEmpresa}` — o painel admin deve migrar a listagem de níveis do formulário de usuários para ele.

---

## 6. Checklist para adicionar uma permissão nova

1. Adicionar a chave em `config/permissoes.php` no grupo adequado (padrão: `grupo.entidade.acao`).
2. Rodar `php artisan app:sincronizar-permissoes` (todos os tenants) — em produção, incluir no deploy.
3. Documentar a chave na tabela da seção 4 deste arquivo (grupo correspondente), informando tela e ação.
4. (Opcional) Proteger a rota no backend com `->middleware('permissao:chave')`.
5. Avisar o frontend para aplicar a chave no menu/rota/ação correspondente.
