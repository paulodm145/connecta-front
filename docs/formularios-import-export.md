# Exportação e Importação de Formulários

## Visão geral

Dois endpoints permitem duplicar a estrutura completa de um formulário entre ambientes ou dentro do mesmo tenant, sem precisar recriar perguntas e opções manualmente.

- **Exportar** devolve um arquivo JSON com toda a estrutura (formulário + perguntas + opções), sem IDs do banco, pronto para ser salvo no computador do usuário.
- **Importar** recebe esse arquivo e cria um novo formulário com `(cópia)` no título, sempre com status `RASCUNHO`.

Nenhum dado de envio, resposta ou PDI é exportado — apenas a estrutura do formulário.

---

## Permissões

| Ação | Chave de permissão |
|---|---|
| Exportar formulário | `formularios.formularios.exportar` |
| Importar formulário | `formularios.formularios.importar` |

As permissões seguem o mesmo padrão do restante do sistema: definidas em `config/permissoes.php`, sincronizadas via `php artisan app:sincronizar-permissoes` e consumidas pelo frontend para controlar a visibilidade de botões e rotas. O backend não bloqueia por permissão — a guarda é feita na UI.

---

## Rotas

### `GET /api/empresas/formularios/{id}/exportar` — Exportar formulário

Autenticação: grupo autenticado `empresas` (bearer token).

**Parâmetros de URL:**
- `id` (integer, obrigatório): ID do formulário a exportar.

**Resposta (200):**

O servidor retorna um arquivo com `Content-Disposition: attachment; filename="formulario-{id}.json"`.  
O corpo é o JSON abaixo:

```json
{
  "titulo": "Avaliação de Desempenho",
  "descricao": "Formulário anual de avaliação de competências.",
  "ajuda": "Leia atentamente cada pergunta antes de responder.",
  "embed_youtube": null,
  "mostrar_ajuda": true,
  "mostrar_embed_youtube": false,
  "perguntas": [
    {
      "pergunta_texto": "Como você avalia sua comunicação?",
      "tipo_pergunta": "SINGLE_CHOICE",
      "obrigatoria": true,
      "pontuacao_base": 5,
      "mascara": null,
      "ordem": 1,
      "ajuda": null,
      "embed_youtube": null,
      "mostrar_ajuda": false,
      "mostrar_embed_youtube": false,
      "competencia_id": 3,
      "opcoes": [
        { "texto_opcao": "Ótimo",  "pontuacao_opcao": 5, "ordem": 1 },
        { "texto_opcao": "Bom",    "pontuacao_opcao": 3, "ordem": 2 },
        { "texto_opcao": "Regular","pontuacao_opcao": 1, "ordem": 3 }
      ]
    },
    {
      "pergunta_texto": "Descreva um desafio recente.",
      "tipo_pergunta": "TEXTAREA",
      "obrigatoria": false,
      "pontuacao_base": 0,
      "mascara": null,
      "ordem": 2,
      "ajuda": null,
      "embed_youtube": null,
      "mostrar_ajuda": false,
      "mostrar_embed_youtube": false,
      "competencia_id": null,
      "opcoes": []
    }
  ]
}
```

**Erros:**
- `404`: formulário não encontrado.
- `500`: erro interno.

---

### `POST /api/empresas/formularios/importar` — Importar formulário

Autenticação: grupo autenticado `empresas` (bearer token).

**Content-Type:** `multipart/form-data`

**Campo:**
- `arquivo` (file, obrigatório): arquivo `.json` gerado pelo endpoint de exportação.

**Comportamento:**
- O título do formulário importado recebe o sufixo ` (cópia)`. Ex.: `"Avaliação de Desempenho (cópia)"`.
- O status é sempre `RASCUNHO`, independente do valor no arquivo.
- Um novo slug único é gerado automaticamente a partir do título com `(cópia)`.
- Todas as perguntas e opções são recriadas com novos IDs.
- O campo `competencia_id` é preservado se a competência existir no tenant de destino. Caso não exista, a pergunta ainda é criada — apenas sem vínculo de competência.

**Resposta (201):**
```json
{
  "status": 201,
  "message": "Formulário importado com sucesso!",
  "data": {
    "form_id": 42,
    "titulo": "Avaliação de Desempenho (cópia)"
  }
}
```

**Erros:**
- `422`: campo `arquivo` ausente, tipo de arquivo inválido (aceita apenas `.json`) ou conteúdo JSON malformado.
- `500`: erro interno durante a criação.

---

## Instruções de implementação — Frontend

### Exportar

O endpoint retorna o arquivo diretamente como download (cabeçalho `Content-Disposition: attachment`). O navegador **não** exibe o JSON na tela — ele dispara o download automaticamente quando a requisição é feita corretamente.

**Exemplo com `fetch` + criação de link temporário:**

```typescript
async function exportarFormulario(formularioId: number, token: string) {
  const res = await fetch(
    `/api/empresas/formularios/${formularioId}/exportar`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error('Erro ao exportar formulário');

  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);

  const link    = document.createElement('a');
  link.href     = url;
  link.download = `formulario-${formularioId}.json`;
  link.click();

  URL.revokeObjectURL(url);
}
```

> **Atenção:** não use `window.open(url)` ou `<a href={url} target="_blank">` diretamente — o bearer token não seria enviado e a rota retornaria 401.

**UX sugerida:**
- Botão "Exportar" na listagem e no detalhe do formulário.
- Nenhum modal necessário — o download inicia automaticamente.
- Exibir um toast de sucesso após o download disparar.

---

### Importar

A importação usa `multipart/form-data` com um campo `arquivo` do tipo `File`. Não envie JSON no body — o backend espera o arquivo.

**Exemplo com `fetch`:**

```typescript
async function importarFormulario(arquivo: File, token: string) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const res = await fetch('/api/empresas/formularios/importar', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    // NÃO defina Content-Type manualmente — o browser define com o boundary correto
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message ?? 'Erro ao importar formulário');

  return data; // { status: 201, message: '...', data: { form_id, titulo } }
}
```

**Exemplo de input de arquivo em React:**

```tsx
function BotaoImportar() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    importarFormulario(arquivo, token)
      .then(({ data }) => {
        toast.success(`"${data.titulo}" importado com sucesso!`);
        // Redirecionar para o formulário criado ou recarregar lista
      })
      .catch((err) => toast.error(err.message))
      .finally(() => {
        // Limpar o input para permitir importar o mesmo arquivo novamente
        if (inputRef.current) inputRef.current.value = '';
      });
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button onClick={() => inputRef.current?.click()}>
        Importar formulário
      </button>
    </>
  );
}
```

**UX sugerida:**
- Botão "Importar formulário" na listagem de formulários.
- O seletor de arquivo deve filtrar por `.json` (`accept=".json"`).
- Após sucesso, recarregar a lista e exibir toast informando o nome com `(cópia)`.
- Exibir mensagem de erro amigável caso o arquivo não seja um JSON válido exportado por este sistema.

---

## Observações

- O arquivo JSON exportado não contém informações sensíveis (nenhum ID de respondente, resposta ou PDI).
- A importação pode ser feita entre tenants diferentes — o sistema gera novos IDs e slug automaticamente.
- Se o `competencia_id` de uma pergunta não existir no tenant de destino, a pergunta é importada normalmente, mas sem vínculo de competência. O frontend pode alertar o usuário sobre isso quando relevante.
- Não há validação de versão no arquivo JSON. Recomenda-se importar apenas arquivos gerados pelo próprio sistema para garantir compatibilidade dos campos.

---

## Fluxo completo — replicar formulários entre tenants

Ao mover formulários para um tenant diferente, os vínculos de competência não são preservados automaticamente (os IDs mudam entre bancos). O fluxo correto é:

**1. No tenant de origem — exportar competências e formulários:**
```
GET /api/empresas/competencias/exportar   → salvar competencias.json
GET /api/empresas/formularios/{id}/exportar → salvar formulario-{id}.json
```

**2. No tenant de destino — importar competências primeiro:**
```
POST /api/empresas/competencias/importar   (campo: arquivo = competencias.json)
```
Anote no retorno quais competências foram criadas. Os novos IDs estarão disponíveis em `GET /api/empresas/competencias`.

**3. No tenant de destino — importar o formulário:**
```
POST /api/empresas/formularios/importar   (campo: arquivo = formulario-{id}.json)
```
O formulário é criado com status `RASCUNHO` e título `(cópia)`. As perguntas que tinham `competencia_id` no arquivo original chegam com esse campo preenchido — se o ID não existir no novo tenant, o campo será ignorado pelo banco (a pergunta é criada sem vínculo).

**4. Remapear vínculos de competência (quando necessário):**

Após a importação, abrir o formulário no editor e reatribuir manualmente a competência de cada pergunta. O frontend pode facilitar esse processo exibindo um aviso quando detectar que alguma pergunta importada tem `competencia_id` que não existe na lista atual de competências:

```typescript
// Após importar o formulário, buscar as competências disponíveis no tenant
const competenciasDoTenant = await fetchCompetencias(); // GET /api/empresas/competencias
const idsDisponiveis = new Set(competenciasDoTenant.map(c => c.id));

// Verificar se alguma pergunta tem vínculo quebrado
const perguntasSemVinculo = formularioImportado.perguntas.filter(
  p => p.competencia_id && !idsDisponiveis.has(p.competencia_id)
);

if (perguntasSemVinculo.length > 0) {
  // Exibir aviso: "X pergunta(s) perderam o vínculo de competência. Revise no editor."
}
```
