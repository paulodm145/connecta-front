"use client"

import { useState, FormEvent } from "react"
import InputMask from "react-input-mask"
// (Opcional) Se quiser usar o Switch do Radix (ou do shadcn/ui):
// import { Switch } from "@radix-ui/react-switch"

/** 
 * Exemplo de JSON com todas as opções de perguntas.
 * Em um cenário real, você poderia buscar esses dados via fetch() de sua API.
 */
const FORMULARIO_EXEMPLO = {
  id: 999,
  titulo: "Exemplo de Formulário Completo",
  descricao: "Demonstração de todos os tipos de perguntas.",
  perguntas: [
    {
      id: 1,
      pergunta_texto: "Qual seu nome?",
      tipo_pergunta: "TEXT",
      obrigatoria: true,
      opcoes: []
    },
    {
      id: 2,
      pergunta_texto: "Qual seu telefone?",
      tipo_pergunta: "TEXT_MASKED",
      obrigatoria: false,
      mascara: "(99) 9999-9999", 
      opcoes: []
    },
    {
      id: 3,
      pergunta_texto: "Fale mais sobre você:",
      tipo_pergunta: "TEXTAREA",
      obrigatoria: false,
      opcoes: []
    },
    {
      id: 4,
      pergunta_texto: "Deseja receber notificações?",
      tipo_pergunta: "TOGGLE",
      obrigatoria: false,
      opcoes: []
    },
    {
      id: 5,
      pergunta_texto: "Qual seu gênero?",
      tipo_pergunta: "SINGLE_CHOICE",
      obrigatoria: false,
      opcoes: [
        { id: 51, texto_opcao: "Masculino" },
        { id: 52, texto_opcao: "Feminino" },
        { id: 53, texto_opcao: "Outro" },
      ]
    },
    {
      id: 6,
      pergunta_texto: "Selecione suas áreas de interesse:",
      tipo_pergunta: "MULTIPLE_CHOICE",
      obrigatoria: false,
      opcoes: [
        { id: 61, texto_opcao: "Tecnologia" },
        { id: 62, texto_opcao: "Saúde" },
        { id: 63, texto_opcao: "Finanças" },
      ]
    },
    {
      id: 7,
      pergunta_texto: "Escolha uma de nossas unidades:",
      tipo_pergunta: "SELECT",
      obrigatoria: false,
      opcoes: [
        { id: 71, texto_opcao: "Unidade Centro" },
        { id: 72, texto_opcao: "Unidade Zona Sul" },
        { id: 73, texto_opcao: "Unidade Zona Norte" },
      ]
    }
  ]
}

/** Tipagem simples de Pergunta (opcional, apenas para auxiliar no TS) */
type Opcao = {
  id: number
  texto_opcao: string
}
type Pergunta = {
  id: number
  pergunta_texto: string
  tipo_pergunta: string
  obrigatoria: boolean
  mascara?: string
  opcoes: Opcao[]
}

export default function FormularioPage() {
  // Armazena as respostas em um objeto cujo índice é o ID da pergunta
  const [respostas, setRespostas] = useState<Record<number, any>>({})
  // Controla se o formulário foi enviado (para exibir a tela de agradecimento)
  const [enviado, setEnviado] = useState(false)

  function handleChangeResposta(perguntaId: number, valor: any) {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Mostra as respostas no console
    console.log("Respostas do usuário:", respostas)
    // Marca como enviado para mostrar a tela de agradecimento
    setEnviado(true)
  }

  // Se já enviou, mostra a tela de agradecimento
  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-2">Obrigado!</h1>
        <p className="text-gray-700">
          Suas respostas foram registradas com sucesso.
        </p>
      </div>
    )
  }

  // Caso contrário, renderiza o formulário
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-2">{FORMULARIO_EXEMPLO.titulo}</h1>
      <p className="text-gray-700 mb-6">{FORMULARIO_EXEMPLO.descricao}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {FORMULARIO_EXEMPLO.perguntas.map((pergunta) => {
          const valor = respostas[pergunta.id] ?? ""
          return (
            <div key={pergunta.id} className="border p-4 rounded">
              <label className="block font-semibold mb-2">
                {pergunta.pergunta_texto}{" "}
                {pergunta.obrigatoria && <span className="text-red-600">*</span>}
              </label>

              {renderizarPergunta(pergunta, valor, (v) => handleChangeResposta(pergunta.id, v))}
            </div>
          )
        })}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-500"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}

/** 
 * Função auxiliar que, dada uma pergunta, renderiza o 
 * campo apropriado para aquele tipo de pergunta.
 */
function renderizarPergunta(
  pergunta: Pergunta,
  valorResposta: any,
  setResposta: (val: any) => void
) {
  switch (pergunta.tipo_pergunta) {
    case "TEXT":
      return (
        <input
          type="text"
          className="border rounded p-2 w-full"
          placeholder="Digite sua resposta..."
          value={valorResposta}
          onChange={(e) => setResposta(e.target.value)}
        />
      )

    case "TEXT_MASKED":
      return (
        <InputMask
          mask={pergunta.mascara || "(99) 99999-9999"}
          value={valorResposta}
          onChange={(e) => setResposta(e.target.value)}
        >
          {(inputProps: any) => (
            <input
              {...inputProps}
              className="border rounded p-2 w-full"
              placeholder={pergunta.mascara || "(99) 99999-9999"}
            />
          )}
        </InputMask>
      )

    case "TEXTAREA":
      return (
        <textarea
          className="border rounded p-2 w-full"
          placeholder="Digite seu texto..."
          value={valorResposta}
          onChange={(e) => setResposta(e.target.value)}
        />
      )

    case "TOGGLE":
      // Se quiser usar o Switch do Radix/shadcn, basta trocar o <input type="checkbox" ... />
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={Boolean(valorResposta)}
            onChange={(e) => setResposta(e.target.checked)}
          />
          <span>{valorResposta ? "Sim" : "Não"}</span>
        </div>
      )

    case "SINGLE_CHOICE":
      return (
        <div className="space-y-2">
          {pergunta.opcoes.map((opcao) => (
            <label key={opcao.id} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`pergunta_${pergunta.id}`}
                className="h-4 w-4"
                checked={valorResposta === opcao.texto_opcao}
                onChange={() => setResposta(opcao.texto_opcao)}
              />
              <span>{opcao.texto_opcao}</span>
            </label>
          ))}
        </div>
      )

    case "MULTIPLE_CHOICE":
      const valoresSelecionados = Array.isArray(valorResposta) ? valorResposta : []
      return (
        <div className="space-y-2">
          {pergunta.opcoes.map((opcao) => {
            const checked = valoresSelecionados.includes(opcao.texto_opcao)
            return (
              <label key={opcao.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setResposta([...valoresSelecionados, opcao.texto_opcao])
                    } else {
                      setResposta(
                        valoresSelecionados.filter((v: string) => v !== opcao.texto_opcao)
                      )
                    }
                  }}
                />
                <span>{opcao.texto_opcao}</span>
              </label>
            )
          })}
        </div>
      )

    case "SELECT":
      return (
        <select
          className="border rounded p-2 w-full"
          value={valorResposta}
          onChange={(e) => setResposta(e.target.value)}
        >
          <option value="">Selecione uma opção</option>
          {pergunta.opcoes.map((opcao) => (
            <option key={opcao.id} value={opcao.texto_opcao}>
              {opcao.texto_opcao}
            </option>
          ))}
        </select>
      )

    default:
      return <p className="text-gray-500">Tipo de pergunta não suportado.</p>
  }
}
