# Competências — CRUD, Recursos e Recomendações

Todas as rotas são autenticadas no grupo `empresas`.

---

## Permissões

As chaves abaixo são consumidas pelo frontend para controlar a visibilidade de cada ação. O backend não bloqueia por permissão — a guarda é feita na UI. Sincronize com `php artisan app:sincronizar-permissoes` sempre que adicionar novas chaves.

### Competências

| Ação | Chave de permissão |
|---|---|
| Exibir menu | `competencias.competencias.exibir.menu` |
| Adicionar | `competencias.competencias.adicionar` |
| Editar | `competencias.competencias.editar` |
| Excluir | `competencias.competencias.excluir` |
| Ativar/Inativar | `competencias.competencias.ativar.inativar` |
| Exportar | `competencias.competencias.exportar` |
| Importar | `competencias.competencias.importar` |

### Livros PDI

| Ação | Chave de permissão |
|---|---|
| Exibir menu | `competencias.livros.exibir.menu` |
| Adicionar | `competencias.livros.adicionar` |
| Editar | `competencias.livros.editar` |
| Excluir | `competencias.livros.excluir` |
| Exportar | `competencias.livros.exportar` |
| Importar | `competencias.livros.importar` |

### Vídeos PDI

| Ação | Chave de permissão |
|---|---|
| Exibir menu | `competencias.videos.exibir.menu` |
| Adicionar | `competencias.videos.adicionar` |
| Editar | `competencias.videos.editar` |
| Excluir | `competencias.videos.excluir` |
| Exportar | `competencias.videos.exportar` |
| Importar | `competencias.videos.importar` |

---

## CRUD de Competências

### `GET /api/empresas/competencias` — Listar

Retorno: array com `id`, `descricao`, `prompt_pdi`, `ativo`, `created_at`, `updated_at`.

### `POST /api/empresas/competencias` — Criar

**Payload:**
```json
{
  "descricao": "Comunicação",
  "prompt_pdi": "Sugira ações para comunicação...",
  "ativo": true
}
```

Retorno (201): objeto criado.

### `GET /api/empresas/competencias/{id}` — Buscar

Retorna uma competência específica.

### `PUT /api/empresas/competencias/{competencia}` — Atualizar

Retorno: objeto atualizado.

### `DELETE /api/empresas/competencias/{competencia}` — Remover

Retorno: `204 No Content` (soft delete).

### `GET /api/empresas/competencias/change-status/{idCompetencia}` — Alternar status

Alterna o campo `ativo`. Retorno: objeto atualizado com o novo status.

---

## Exportação e Importação de Competências

### `GET /api/empresas/competencias/exportar` — Exportar todas as competências

Baixa um arquivo `competencias.json` com todas as competências do tenant, incluindo recomendações, livros e vídeos vinculados. Nenhum ID interno é exportado.

**Resposta (200):** arquivo JSON com `Content-Disposition: attachment; filename="competencias.json"`.

Estrutura do arquivo:
```json
[
  {
    "descricao": "Comunicação",
    "prompt_pdi": "Sugira ações para desenvolver comunicação assertiva...",
    "ativo": true,
    "recomendacoes": [
      {
        "livros_recomendados": [{"titulo": "...", "descricao": "...", "link": "..."}],
        "videos_recomendados": [{"titulo": "...", "descricao": "...", "url": "..."}],
        "prompt_recomendacao": "Sugira conteúdos para..."
      }
    ],
    "livros": [
      { "titulo": "Comunicação não violenta", "link": "https://...", "descricao": "..." }
    ],
    "videos": [
      { "titulo": "Como dar feedback", "link": "https://...", "descricao": "..." }
    ]
  }
]
```

---

### `POST /api/empresas/competencias/importar` — Importar competências

**Content-Type:** `multipart/form-data`

**Campo:**
- `arquivo` (file, obrigatório): arquivo `.json` gerado pelo endpoint de exportação. Tamanho máximo: 5 MB.

**Comportamento:**
- Cada competência do arquivo é avaliada individualmente.
- Se já existir uma competência com a mesma `descricao` no tenant, ela é **ignorada** (não atualizada, não duplicada).
- As que não existem são criadas com todas as recomendações, livros e vídeos vinculados.
- A operação é transacional — qualquer erro interno reverte todas as inserções.

**Resposta (200):**
```json
{
  "message": "Importação concluída.",
  "criadas": 3,
  "ignoradas": 1,
  "detalhes": {
    "criadas": ["Comunicação", "Liderança", "Trabalho em equipe"],
    "ignoradas": ["Proatividade"]
  }
}
```

**Erros:**
- `422`: campo `arquivo` ausente, tipo inválido (aceita apenas `.json`) ou conteúdo JSON malformado.
- `500`: erro interno durante a importação (toda a transação é revertida).

---

## Fluxo recomendado — criar formulários com competências em novo tenant

1. No tenant de origem, exportar competências: `GET /api/empresas/competencias/exportar`.
2. No tenant de destino, importar o arquivo: `POST /api/empresas/competencias/importar`.
3. Verificar no retorno quais foram criadas e quais ignoradas.
4. Agora os IDs das competências do novo tenant estão disponíveis para vincular às perguntas ao exportar/importar formulários.

> **Atenção:** os IDs de competência **não são preservados** entre tenants. Ao importar formulários depois de importar competências, as perguntas podem ficar com `competencia_id` apontando para IDs do tenant de origem. O front-end deve oferecer um passo de remapeamento, ou o usuário pode editar os vínculos de competência após a importação do formulário.

---

## CRUD de Recomendações por Competência

Rota base: `/api/empresas/competencia-recomendacoes`

**Estrutura obrigatória dos campos:**
- `livros_recomendados`: array de `{ "titulo": string, "descricao": string, "link": string|null }`.
- `videos_recomendados`: array de `{ "titulo": string, "descricao": string, "url": string }` (URL do YouTube).
- `prompt_recomendacao`: texto mínimo de 10 caracteres.

### `GET /api/empresas/competencia-recomendacoes` — Listar

Retorna todas as recomendações incluindo a competência relacionada.

### `POST /api/empresas/competencia-recomendacoes` — Criar

**Payload:**
```json
{
  "competencia_id": 1,
  "livros_recomendados": [
    {
      "titulo": "Comunicação não violenta",
      "descricao": "Explica técnicas práticas para diálogos difíceis",
      "link": "https://exemplo.com/livro"
    }
  ],
  "videos_recomendados": [
    {
      "titulo": "Como dar feedback",
      "descricao": "Mostra exemplos e scripts de conversas",
      "url": "https://www.youtube.com/watch?v=abc123"
    }
  ],
  "prompt_recomendacao": "Sugira conteúdos para melhorar comunicação assertiva"
}
```

Retorno (201): objeto criado com as relações carregadas.

### `GET /api/empresas/competencia-recomendacoes/{id}` — Buscar

Retorna as recomendações de uma competência específica.

### `PUT /api/empresas/competencia-recomendacoes/{competenciaRecomendacao}` — Atualizar

Payload: mesma estrutura do `POST`. Campos não enviados não são alterados.

Retorno: objeto atualizado com a competência vinculada.

### `DELETE /api/empresas/competencia-recomendacoes/{competenciaRecomendacao}` — Remover

Retorno: `204 No Content` (soft delete).

---

## CRUD de Livros de PDI

Rota base: `/api/empresas/livros-pdi`

**Campos obrigatórios:** `competencia_id`, `titulo`, `link` (URL válida), `descricao` (texto livre sobre relevância e resumo do conteúdo).

### `GET /api/empresas/livros-pdi` — Listar

Retorna todos os livros com a competência vinculada.

### `POST /api/empresas/livros-pdi` — Criar

**Payload:**
```json
{
  "competencia_id": 1,
  "titulo": "Comunicação não violenta",
  "link": "https://exemplo.com/livro",
  "descricao": "Mostra técnicas práticas para conversas difíceis e indica por que é relevante."
}
```

Retorno (201): objeto criado com o relacionamento `competencia`.

### `GET /api/empresas/livros-pdi/{id}` — Buscar

Retorna um livro específico com a competência.

### `PUT /api/empresas/livros-pdi/{livroPdi}` — Atualizar

Payload: mesma estrutura do `POST`.

### `DELETE /api/empresas/livros-pdi/{livroPdi}` — Remover

Soft delete.

### `GET /api/empresas/livros-pdi/exportar` — Exportar livros

Baixa `livros-pdi.json` com todos os livros do tenant agrupados por competência. Apenas competências que possuem ao menos um livro são incluídas.

**Resposta (200):** arquivo JSON com `Content-Disposition: attachment; filename="livros-pdi.json"`.

Estrutura do arquivo:
```json
[
  {
    "competencia": "Comunicação",
    "livros": [
      {
        "titulo": "Comunicação não violenta",
        "link": "https://exemplo.com/livro",
        "descricao": "Mostra técnicas práticas para conversas difíceis."
      }
    ]
  }
]
```

### `POST /api/empresas/livros-pdi/importar` — Importar livros

**Content-Type:** `multipart/form-data` — campo `arquivo` (.json, máx. 5 MB).

**Comportamento:**
- Cada grupo do arquivo é associado a uma competência pelo campo `competencia` (nome exato, case-sensitive).
- Se a competência não existir no tenant, o grupo inteiro é ignorado e o nome aparece em `nao_encontradas`.
- Dentro de cada competência, livros com mesmo `titulo` já cadastrados são ignorados (não duplicados).
- A operação é transacional.

**Resposta (200):**
```json
{
  "message": "Importação concluída.",
  "criados": 5,
  "ignorados": 1,
  "nao_encontradas": ["Liderança Estratégica"],
  "detalhes": {
    "criados": ["Comunicação / Comunicação não violenta", "Comunicação / Como ouvir melhor"],
    "ignorados": ["Comunicação / Livro já existente"]
  }
}
```

**Erros:**
- `422`: campo `arquivo` ausente, tipo inválido ou JSON malformado.
- `500`: erro interno (transação revertida).

---

## CRUD de Vídeos de PDI

Rota base: `/api/empresas/videos-pdi`

**Campos obrigatórios:** `competencia_id`, `titulo`, `link` (URL válida), `descricao` (texto livre sobre relevância e resumo do conteúdo).

### `GET /api/empresas/videos-pdi` — Listar

Retorna todos os vídeos com a competência vinculada.

### `POST /api/empresas/videos-pdi` — Criar

**Payload:**
```json
{
  "competencia_id": 1,
  "titulo": "Como dar feedback",
  "link": "https://www.youtube.com/watch?v=abc123",
  "descricao": "Explica a importância do conteúdo e dá exemplos práticos para aplicar."
}
```

Retorno (201): objeto criado com o relacionamento `competencia`.

### `GET /api/empresas/videos-pdi/{id}` — Buscar

Retorna um vídeo específico com a competência.

### `PUT /api/empresas/videos-pdi/{videoPdi}` — Atualizar

Payload: mesma estrutura do `POST`.

### `DELETE /api/empresas/videos-pdi/{videoPdi}` — Remover

Soft delete.

### `GET /api/empresas/videos-pdi/exportar` — Exportar vídeos

Baixa `videos-pdi.json` com todos os vídeos do tenant agrupados por competência. Apenas competências com ao menos um vídeo são incluídas.

**Resposta (200):** arquivo JSON com `Content-Disposition: attachment; filename="videos-pdi.json"`.

Estrutura do arquivo:
```json
[
  {
    "competencia": "Comunicação",
    "videos": [
      {
        "titulo": "Como dar feedback",
        "link": "https://www.youtube.com/watch?v=abc123",
        "descricao": "Explica scripts práticos para conversas de avaliação."
      }
    ]
  }
]
```

### `POST /api/empresas/videos-pdi/importar` — Importar vídeos

**Content-Type:** `multipart/form-data` — campo `arquivo` (.json, máx. 5 MB).

**Comportamento:** idêntico ao de livros — associa pelo nome da competência, ignora vídeos com mesmo `titulo` já cadastrados na mesma competência, ignora grupos cujas competências não existem no tenant.

**Resposta (200):**
```json
{
  "message": "Importação concluída.",
  "criados": 4,
  "ignorados": 0,
  "nao_encontradas": [],
  "detalhes": {
    "criados": ["Comunicação / Como dar feedback"],
    "ignorados": []
  }
}
```

**Erros:**
- `422`: campo `arquivo` ausente, tipo inválido ou JSON malformado.
- `500`: erro interno (transação revertida).

---

## Instruções de implementação — Frontend (livros e vídeos)

O padrão de implementação é idêntico ao de competências. Use os mesmos helpers de exportação e importação, apenas trocando a URL.

**Exportar livros:**
```typescript
async function exportarLivros(token: string) {
  const res = await fetch('/api/empresas/livros-pdi/exportar', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erro ao exportar livros');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'livros-pdi.json'; link.click();
  URL.revokeObjectURL(url);
}
```

**Importar livros ou vídeos (mesmo padrão):**
```typescript
async function importarArquivoPdi(endpoint: string, arquivo: File, token: string) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Erro na importação');
  return data;
  // data.criados, data.ignorados, data.nao_encontradas, data.detalhes
}

// Uso:
importarArquivoPdi('/api/empresas/livros-pdi/importar', arquivo, token);
importarArquivoPdi('/api/empresas/videos-pdi/importar', arquivo, token);
```

**UX sugerida:**
- Botão "Exportar livros" e "Exportar vídeos" na página de recursos do PDI.
- Após importar, exibir um resumo com o retorno da API:
  - `criados`: quantos foram adicionados.
  - `ignorados`: quantos já existiam.
  - `nao_encontradas`: listar as competências do arquivo que não foram encontradas no tenant, para que o usuário saiba que precisa importar (ou criar) essas competências primeiro.
- Quando `nao_encontradas` for não-vazio, exibir alerta: *"As seguintes competências não foram encontradas: [lista]. Importe as competências antes de importar os recursos."*
