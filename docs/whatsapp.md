# Envio de Link de Pesquisa via WhatsApp

Rotas autenticadas em `/api/empresas`. Utiliza a API de mensagens da Twilio com o prefixo `whatsapp:` nos números de telefone.

> **Status: integração validada de ponta a ponta em produção (Twilio).** Envio individual e em massa testados com número WhatsApp Sender real e template aprovado pela Meta — mensagens confirmadas como `delivered`. Pronta para uso pelo frontend.

## Configuração

Variáveis de ambiente necessárias (`.env`):

| Variável | Descrição |
|---|---|
| `TWILIO_ACCOUNT_SID` | Account SID do painel Twilio |
| `TWILIO_AUTH_TOKEN` | Auth Token do painel Twilio |
| `TWILIO_WHATSAPP_FROM` | Número do WhatsApp Sender no formato `+5511999999999` |
| `TWILIO_WHATSAPP_TEMPLATE_SID` | Content SID (`HX...`) do template WhatsApp aprovado pela Meta |

Estas credenciais são obtidas no painel da Twilio: [console.twilio.com](https://console.twilio.com). O número remetente deve estar habilitado para WhatsApp em **Messaging > Senders > WhatsApp Senders**.

> **Por que um template é obrigatório:** o WhatsApp Business Platform só permite mensagens de texto livre dentro de uma janela de 24h após o destinatário ter mandado mensagem para o número da empresa. Como o convite de pesquisa é sempre iniciado pela empresa (o colaborador nunca mandou mensagem antes), a Meta exige o uso de um **Message Template** pré-aprovado — sem isso a API retorna o erro `63016` (`Failed to send freeform message because you are outside the allowed window`).

### Criando o template no console Twilio

1. **Messaging → Content Template Builder → Create new**.
2. Tipo de conteúdo: **Text**. Idioma: Português (Brasil).
3. Corpo do template com variáveis numeradas (precisa ser idêntico ao que o código envia):
   ```
   Olá {{1}}, você foi convidado(a) para responder a pesquisa "{{2}}".

   Acesse o link abaixo para responder:
   {{3}}

   Este é um envio automático. Em caso de dúvidas, procure o RH.
   ```
   - `{{1}}` = nome do colaborador
   - `{{2}}` = título da pesquisa
   - `{{3}}` = link de resposta
4. Categoria: **Utility** (notificação transacional vinculada a uma ação do usuário, não marketing).
5. **Save and submit for WhatsApp approval** — gera o `Content SID` (`HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) e envia para aprovação da Meta (normalmente até 1h, podendo levar até 24-48h).
6. Depois de aprovado, copiar o `Content SID` para `TWILIO_WHATSAPP_TEMPLATE_SID`.

> **Sandbox (desenvolvimento):** o sandbox do Twilio ignora a exigência de template para números pré-registrados, mas o código desta integração sempre envia via `contentSid`/`contentVariables` — então, mesmo em sandbox, é necessário ter um template criado (pode ser aprovado ou, em alguns casos, o próprio sandbox aceita templates em rascunho para teste).

---

## 1. Link de pesquisa via WhatsApp

### `POST /api/empresas/respondentes/{respondenteId}/pesquisa/enviar-whatsapp` — Para um respondente

Envia o link de resposta da pesquisa via WhatsApp para um único respondente.

**Pré-requisitos:** respondente vinculado a uma pesquisa, pessoa vinculada ao respondente com telefone cadastrado.

**Parâmetros de URL:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `respondenteId` | integer | ID do respondente |

**Payload:** vazio.

**Retorno (200):**
```json
{
  "message": "WhatsApp enviado com sucesso.",
  "destinatario": "+5511987654321",
  "link": "https://front.exemplo.com/respostas/formulario/form-slug?t=ABCD-EFGH&p=pesquisa-slug&e=1&tpo=1"
}
```

**Erros (400):**
```json
{ "message": "Não foi possível localizar o respondente vinculado ao colaborador." }
{ "message": "Não foi possível localizar a pesquisa vinculada ao respondente." }
{ "message": "O colaborador não possui telefone cadastrado." }
```

---

### `POST /api/empresas/pesquisas/{pesquisaId}/respondentes/enviar-whatsapp` — Para todos os respondentes

Enfileira o envio do link de resposta da pesquisa via WhatsApp para todos os respondentes vinculados à pesquisa. O envio é **assíncrono** — cada mensagem é despachada como um job na fila do Laravel e processada em background. A resposta retorna imediatamente com o resumo de quantos foram enfileirados.

**Parâmetros de URL:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `pesquisaId` | integer | ID da pesquisa |

**Payload:** vazio.

**Retorno (202 Accepted):**
```json
{
  "total_respondentes": 15,
  "enfileirados": 12,
  "sem_telefone": 2,
  "sem_pessoa": 1
}
```

| Campo | Significado |
|---|---|
| `total_respondentes` | Total de respondentes vinculados à pesquisa |
| `enfileirados` | Respondentes cujo envio foi adicionado à fila |
| `sem_telefone` | Respondentes cuja pessoa não possui telefone cadastrado |
| `sem_pessoa` | Respondentes sem pessoa vinculada |

> **Nota:** o campo `enfileirados` indica quantos jobs foram despachados, não quantos foram efetivamente entregues. Falhas individuais de envio são registradas nos logs do servidor.

---

## 2. Conteúdo da mensagem WhatsApp

A mensagem é enviada via **Content Template** aprovado pela Meta (`TWILIO_WHATSAPP_TEMPLATE_SID`), com as variáveis preenchidas dinamicamente:

```
Olá {{1}}, você foi convidado(a) para responder a pesquisa "{{2}}".

Acesse o link abaixo para responder:
{{3}}

Este é um envio automático. Em caso de dúvidas, procure o RH.
```

| Variável | Valor |
|---|---|
| `{{1}}` | Nome do colaborador |
| `{{2}}` | Título da pesquisa |
| `{{3}}` | Link de resposta |

O link segue o mesmo formato usado no envio por e-mail:
```
{PESQUISA_RESPONDER_URL}/respostas/formulario/{formulario-slug}?t={token}&p={pesquisa-slug}&e={empresa_id}&tpo=1
```

> **Atenção — `PESQUISA_RESPONDER_URL` precisa ter esquema (`https://`):** o WhatsApp só transforma um trecho de texto em link clicável se ele começar com `http://`/`https://` (ou tiver um domínio com TLD reconhecido). Um valor como `PESQUISA_RESPONDER_URL="localhost:3000/"` (sem esquema) gera um link que chega como **texto puro, não clicável**, no WhatsApp. Configure sempre com o esquema completo, ex.: `PESQUISA_RESPONDER_URL=https://app.suaempresa.com.br`. Essa mesma variável também é usada no link enviado por e-mail (`PesquisaEmailService`) — a correção vale para os dois canais.

---

## 3. Formato do telefone

O campo `telefone` da pessoa é armazenado somente com dígitos (ex.: `11987654321`). O sistema adiciona automaticamente o prefixo `+55` (Brasil) e o prefixo `whatsapp:` exigido pela API da Twilio.

Exemplo: telefone `11987654321` → enviado para `whatsapp:+5511987654321`.

---

## 4. Fluxo recomendado para o front-end React

### Disparar WhatsApp para um respondente

```tsx
async function enviarWhatsAppRespondente(respondenteId: number) {
  try {
    const { data } = await api.post(
      `/empresas/respondentes/${respondenteId}/pesquisa/enviar-whatsapp`
    );
    toast.success(`WhatsApp enviado para ${data.destinatario}`);
  } catch (error) {
    toast.error(error.response?.data?.message ?? 'Erro ao enviar WhatsApp.');
  }
}
```

### Disparar WhatsApp para todos os respondentes (assíncrono)

```tsx
async function enviarWhatsAppEmMassa(pesquisaId: number) {
  try {
    const { data } = await api.post(
      `/empresas/pesquisas/${pesquisaId}/respondentes/enviar-whatsapp`
    );
    // HTTP 202 — jobs enfileirados, envio acontece em background
    toast.success(
      `${data.enfileirados} de ${data.total_respondentes} mensagens enfileiradas para envio.`
    );
    if (data.sem_telefone > 0) {
      toast.warning(`${data.sem_telefone} respondente(s) sem telefone cadastrado.`);
    }
  } catch (error) {
    toast.error(error.response?.data?.message ?? 'Erro ao enviar WhatsApp em massa.');
  }
}
```

### Sugestão de UX

- Exibir botão **"Enviar via WhatsApp"** ao lado do botão de e-mail existente, tanto na ação individual (por respondente) quanto na ação em massa (por pesquisa).
- Ao clicar, disparar o endpoint e exibir o resultado em toast:
  - Individual: "WhatsApp enviado para +5511987654321"
  - Em massa: "12 de 15 mensagens enfileiradas para envio. 2 sem telefone."
- **Envio individual** é síncrono — a resposta confirma o envio.
- **Envio em massa** é assíncrono (202) — a resposta confirma que os jobs foram enfileirados. O envio real acontece em background via fila do Laravel. Não há polling necessário.
- Para o envio em massa, considerar exibir um modal de confirmação antes de disparar: "Enviar WhatsApp para X respondentes?"
- O botão de envio individual pode ser desabilitado (ou virar tooltip informativo) quando `pessoa_telefone` vier vazio na listagem de `GET /api/empresas/respondentes/pesquisa/{slug}` (ver [respondentes.md](respondentes.md)) — evita a chamada que já se sabe que vai falhar com 400.
- O texto da mensagem em si (conteúdo do template) **não pode ser alterado pelo frontend** — está fixo no template aprovado pela Meta no lado do Twilio. Qualquer mudança de copy exige criar/aprovar um novo template no backend.
