# Formulários — CRUD e Exclusão Segura

Documentação do CRUD de formulários, com foco no novo endpoint de **exclusão**, que antes não existia (a rota estava registrada, mas sem implementação).

> Rotas sob `/api/empresas/*` exigem bearer token (Passport, `auth:api`) e operam no tenant do usuário autenticado.
>
> Para exportação/importação de estrutura de formulários, veja [formularios-import-export.md](formularios-import-export.md).

---

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/empresas/formularios` | Lista formulários |
| `POST` | `/api/empresas/formularios` | Cria formulário (com perguntas e opções) |
| `GET` | `/api/empresas/formularios/{id}` | Busca formulário (com perguntas e opções) |
| `PUT` | `/api/empresas/formularios/{id}` | Atualiza formulário (sincroniza perguntas/opções) |
| `DELETE` | `/api/empresas/formularios/{id}` | **Novo** — Exclui formulário (soft delete) |
| `GET` | `/api/empresas/formularios/change-status/{id}` | Alterna `RASCUNHO` ⇄ `PUBLICADO` |
| `GET` | `/api/empresas/formularios-ativos` | Lista apenas formulários `PUBLICADO` |
| `GET` | `/api/empresas/formularios/{id}/exportar` | Exporta estrutura como JSON |
| `POST` | `/api/empresas/formularios/importar` | Importa formulário de JSON |
| `GET` | `/api/empresas/formularios/slug/{slug}` | Busca formulário por slug |

---

## `DELETE /api/empresas/formularios/{id}` — Excluir formulário

### Por que a exclusão é condicional

Um formulário pode estar vinculado a **pesquisas** (`pesquisas.formulario_id`) e a **envios/respostas** (`envios.formulario_id`) já existentes. Excluir um formulário nessas condições quebraria a pesquisa (o link de resposta pública deixaria de encontrar o formulário) e apagaria o acesso a respostas já coletadas.

Por isso, a exclusão é **bloqueada** quando o formulário tem qualquer pesquisa ou envio vinculado. Nesses casos, a orientação é **inativar** o formulário (`changeStatus` → `RASCUNHO`) em vez de excluí-lo — ele deixa de aparecer em `formularios-ativos` e não pode ser selecionado para novas pesquisas, mas o histórico permanece intacto.

Quando não há vínculos, a exclusão é permitida e remove (soft delete) o formulário junto com suas perguntas e opções, para não deixar registros órfãos no banco.

### Respostas

```json
// 200 — excluído com sucesso
{
  "status": 200,
  "message": "Formulário excluído com sucesso!",
  "data": []
}
```

```json
// 400 — bloqueado por ter pesquisas/envios vinculados
{
  "status": 400,
  "message": "Não é possível excluir: existem pesquisas ou respostas vinculadas a este formulário. Utilize a inativação (status RASCUNHO) em vez da exclusão.",
  "data": []
}
```

```json
// 404 — formulário não encontrado
{
  "status": 404,
  "message": "Formulário não encontrado.",
  "data": []
}
```

> Nota: diferente de outros CRUDs do sistema (que retornam `204` sem corpo em exclusões bem-sucedidas), este endpoint retorna `200` com um corpo `{ status, message, data }`, no mesmo padrão já usado pelos endpoints de `store`/`update` de formulários. Trate o sucesso pelo `status: 200`, não pela ausência de corpo.

---

## Instruções para o frontend

### 1. Botão de excluir na listagem/detalhe de formulário

- Chamar `DELETE /api/empresas/formularios/{id}`.
- Tratar a resposta pelo campo `status` do corpo (200/400/404), não apenas pelo HTTP status — os três casos retornam JSON com essa mesma forma.
- Em caso de `400`, exibir a mensagem retornada (`message`) em vez de um erro genérico, e sugerir a ação alternativa: **"Inativar este formulário"** (chamando `GET /api/empresas/formularios/change-status/{id}`), já que ele está em uso.

Exemplo:

```typescript
async function excluirFormulario(id: number, token: string) {
  const res = await fetch(`/api/empresas/formularios/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (data.status === 400) {
    // Formulário em uso — oferecer inativação como alternativa
    throw new FormularioEmUsoError(data.message);
  }

  if (data.status !== 200) {
    throw new Error(data.message ?? 'Erro ao excluir formulário');
  }

  return data;
}
```

### 2. UX sugerida

- Confirmar a exclusão com um modal antes de disparar a requisição (ação destrutiva).
- Se a API retornar `400` (em uso), trocar o modal de confirmação por um aviso explicando que o formulário possui pesquisas/respostas vinculadas, com um botão de atalho para inativá-lo em vez de excluir.
- Após sucesso, remover o item da listagem local e exibir um toast de confirmação.
- Formulários excluídos não aparecem mais em nenhuma listagem (`formularios`, `formularios-ativos`, `slug/{slug}`) — o soft delete já filtra automaticamente.

---

## Alterações no backend (referência)

- `FormularioService::delete()` verifica `pesquisas()` e `envios()` do formulário antes de excluir.
- A exclusão soft-deleta o formulário e, em cascata, suas `perguntas` e `opcoes` associadas.
- Nenhuma migration nova foi necessária — o modelo `Formularios` já usava `SoftDeletes`.
