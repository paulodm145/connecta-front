# Fluxos de Envio de E-mail

## 1. PDI por e-mail

Rotas autenticadas em `/api/empresas`.

### `POST /api/empresas/envios/{envioId}/pdi/enviar-email` — PDI de um envio

**Pré-requisitos:** existir um PDI cadastrado para o `envioId` informado e o respondente possuir e-mail.

**Payload:** vazio.

**Retorno (200):**
```json
{
  "message": "PDI enviado com sucesso.",
  "destinatario": "email@dominio.com"
}
```

**Conteúdo do e-mail:** inclui os dados do plano e as recomendações de desenvolvimento salvas no PDI, tanto em `resposta.recomendacoes` quanto dentro de cada `resposta.pdi.competencias[].recomendacoes` (livros, vídeos, ações, etc.).

**Erros (400):** mensagem explicando ausência de respondente ou de e-mail cadastrado.

---

### `POST /api/empresas/pesquisas/{pesquisaId}/pdi/enviar-email` — PDI em massa por pesquisa

Envia o PDI para todos os respondentes com PDI associado à pesquisa informada. Registros sem respondente ou sem e-mail são ignorados e contabilizados no resumo.

**Payload:** vazio.

**Retorno (200):**
```json
{
  "total_com_pdi": 10,
  "enviados": 8,
  "sem_email": 1,
  "sem_respondente": 1
}
```

---

## 2. Link de pesquisa por e-mail

Rotas autenticadas em `/api/empresas`.

### `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-email` — Para um respondente

Envia o link de resposta da pesquisa para um único respondente.

**Payload:** vazio.

**Retorno (200):**
```json
{
  "message": "E-mail de pesquisa enviado com sucesso.",
  "destinatario": "email@dominio.com",
  "link": "https://front.exemplo.com/pesquisas/pesquisa-slug?token=XXXX-XXXX-XXXX-XXXX"
}
```

**Erros (400):** mensagem explicando ausência de respondente, pesquisa vinculada ou e-mail cadastrado.

---

### `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-email` — Para todos os respondentes

Envia o link de resposta da pesquisa para todos os respondentes vinculados à pesquisa.

**Payload:** vazio.

**Retorno (200):**
```json
{
  "total_respondentes": 15,
  "enviados": 13,
  "sem_email": 1,
  "sem_pessoa": 1
}
```

O link é montado a partir de `PESQUISA_RESPONDER_URL` (com fallback para `APP_URL`), no formato `/pesquisas/{slug}?token=...`.

---

## 3. Links de avaliação para responsáveis de setor

### Visão geral

O responsável por um setor recebe um único e-mail consolidando a lista de todos os colaboradores do seu setor que são respondentes da pesquisa, cada um com seu link individual de avaliação. Ele não precisa acessar o sistema para saber quem deve avaliar.

**Pré-requisitos:**
- A pesquisa deve ter respondentes cadastrados.
- O setor deve ter o campo `pessoa_id` preenchido (responsável definido).
- O responsável deve ter `email` cadastrado em `pessoas`.
- Os respondentes do setor são identificados via `pessoas → cargos → setores` (`cargo_id` e `cargos.setor_id`).

---

### `POST /api/empresas/pesquisas/{pesquisaId}/setores/{setorId}/responsavel/enviar-email` — Setor específico

Autenticação: bearer token padrão (`auth:api`).

**Parâmetros de URL:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `pesquisaId` | integer | ID da pesquisa |
| `setorId` | integer | ID do setor cujo responsável receberá o e-mail |

**Payload:** vazio.

**Retorno (200):**
```json
{
  "message": "E-mail enviado com sucesso ao responsável do setor.",
  "setor": "Tecnologia",
  "responsavel": "Ana Silva",
  "destinatario": "ana.silva@empresa.com",
  "total_avaliados": 5
}
```

**Erros (400):**
```json
{ "message": "O setor \"Tecnologia\" não possui responsável cadastrado." }
{ "message": "O responsável do setor \"Tecnologia\" não possui e-mail cadastrado." }
{ "message": "Nenhum respondente encontrado para o setor \"Tecnologia\" nesta pesquisa." }
```

**Erro (404):** pesquisa ou setor não encontrado.

---

### `POST /api/empresas/pesquisas/{pesquisaId}/setores/responsaveis/enviar-email` — Todos os setores

Autenticação: bearer token padrão (`auth:api`).

Envia o e-mail para os responsáveis de **todos os setores** com respondentes na pesquisa. Setores sem responsável, sem e-mail ou sem respondentes são ignorados e contabilizados.

**Payload:** vazio.

**Retorno (200):**
```json
{
  "total_setores": 4,
  "enviados": 3,
  "sem_responsavel": 0,
  "sem_email_responsavel": 1,
  "sem_respondentes": 0,
  "detalhes": [
    {
      "setor": "Tecnologia",
      "responsavel": "Ana Silva",
      "destinatario": "ana.silva@empresa.com",
      "total_avaliados": 5
    },
    {
      "setor": "Comercial",
      "responsavel": "João Souza",
      "destinatario": "joao.souza@empresa.com",
      "total_avaliados": 3
    }
  ]
}
```

| Campo | Significado |
|---|---|
| `total_setores` | Total de setores com responsável preenchido |
| `enviados` | Setores cujo responsável recebeu o e-mail com sucesso |
| `sem_responsavel` | Setores sem `pessoa_id` cadastrado |
| `sem_email_responsavel` | Setores cujo responsável não tem e-mail |
| `sem_respondentes` | Setores sem respondentes nesta pesquisa |
| `detalhes` | Array com o resumo de cada e-mail enviado |

**Erro (404):** pesquisa não encontrada.

---

### Fluxo recomendado para o front-end React

#### Disparar e-mail para um setor específico

```tsx
async function enviarEmailSetor(pesquisaId: number, setorId: number) {
  try {
    const { data } = await api.post(
      `/empresas/pesquisas/${pesquisaId}/setores/${setorId}/responsavel/enviar-email`
    );
    toast.success(`E-mail enviado para ${data.responsavel} com ${data.total_avaliados} avaliados.`);
  } catch (error) {
    toast.error(error.response?.data?.message ?? 'Erro ao enviar e-mail.');
  }
}
```

#### Disparar e-mail para todos os responsáveis

```tsx
async function enviarEmailTodosResponsaveis(pesquisaId: number) {
  const { data } = await api.post(
    `/empresas/pesquisas/${pesquisaId}/setores/responsaveis/enviar-email`
  );
  // data.enviados, data.sem_responsavel, data.sem_email_responsavel, data.sem_respondentes, data.detalhes
  return data;
}
```

#### Sugestão de UX

- Exibir botão **"Enviar links para responsáveis"** na tela de gestão de pesquisa.
- Ao clicar, disparar o endpoint em massa e mostrar o resumo em modal ou toast:
  - "X setores notificados com sucesso."
  - "Y setores ignorados: responsável sem e-mail."
- Oferecer também a ação individual por setor na listagem de setores da pesquisa.
- Não há polling necessário — o envio é síncrono e a resposta já traz o resultado final.

#### Estrutura do e-mail recebido pelo responsável

O responsável recebe uma tabela com:
- Nome de cada colaborador do setor que é respondente da pesquisa.
- Link individual de acesso ao formulário de avaliação.
- Prazo final da pesquisa (se configurado).

O link usa `tpo=2` para abrir o formulário no modo **líder** (avaliação de equipe):
```
{PESQUISA_RESPONDER_URL}/respostas/formulario/{formulario-slug}?t={token}&p={pesquisa-slug}&e={empresa_id}&tpo=2
```
