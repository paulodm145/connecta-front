"use client"

import { FC } from 'react'
import { DadosFormulario, DadosPergunta } from './types'
import InputMask from 'react-input-mask'
import { Button } from '@/components/ui/button'
import { Switch } from '@radix-ui/react-switch'

interface FormPreviewProps {
  formulario: DadosFormulario,
  perguntas: DadosPergunta[],
  respostas: { [perguntaId: string]: any },
  onChangeResposta: (perguntaId: string, value: any) => void,
  onOpenVideo: (embed: string) => void
}

const FormPreview: FC<FormPreviewProps> = ({ formulario, perguntas, respostas, onChangeResposta, onOpenVideo }) => {

  function renderizarPergunta(
    pergunta: DadosPergunta,
    valorResposta: any,
    onChange: (val: any) => void
  ) {
    const setAnswer = (val: any) => onChange(val)
    
    switch (pergunta.tipo_pergunta) {
      case 'TEXT':
        return (
          <input 
            type="text" 
            className="border rounded p-2 w-full" 
            placeholder="Digite sua resposta..." 
            value={valorResposta || ''} 
            onChange={e => setAnswer(e.target.value)}
          />
        )
      case 'TEXT_MASKED':
        return (
          <InputMask
            mask={pergunta.mascara || '(99) 99999-9999'}
            value={valorResposta || ''}
            onChange={e => setAnswer(e.target.value)}
          >
            {(inputProps: any) => <input {...inputProps} className="border rounded p-2 w-full" placeholder={pergunta.mascara || '(99) 99999-9999'} />}
          </InputMask>
        )
      case 'TEXTAREA':
        return (
          <textarea 
            className="border rounded p-2 w-full" 
            placeholder="Digite seu texto..."
            value={valorResposta || ''} 
            onChange={e => setAnswer(e.target.value)}
          />
        )
        case 'TOGGLE':
          const boolValue = !!valorResposta
          return (
            <div className="flex items-center space-x-2">
              <Switch
                checked={boolValue}
                onCheckedChange={(val) => setAnswer(val)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  boolValue ? 'bg-teal-500' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Toggle</span>
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    boolValue ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </Switch>
              <span>Alternador (ligado/desligado)</span>
            </div>
          )
      case 'SINGLE_CHOICE':
        return (
          <div className="space-y-1">
            {pergunta.opcoes.map((opt, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`pergunta_${pergunta.id}`}
                  checked={valorResposta === opt.option_text}
                  onChange={() => setAnswer(opt.option_text)}
                />
                <label>{opt.option_text}</label>
              </div>
            ))}
          </div>
        )
      case 'MULTIPLE_CHOICE':
        const selectedValues = Array.isArray(valorResposta) ? valorResposta : []
        return (
          <div className="space-y-1">
            {pergunta.opcoes.map((opt, idx) => {
              const checked = selectedValues.includes(opt.option_text)
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => {
                      if (e.target.checked) {
                        setAnswer([...selectedValues, opt.option_text])
                      } else {
                        setAnswer(selectedValues.filter((v: string) => v !== opt.option_text))
                      }
                    }}
                  />
                  <label>{opt.option_text}</label>
                </div>
              )
            })}
          </div>
        )
      case 'SELECT':
        return (
          <select
            className="border rounded p-2 w-full"
            value={valorResposta || ''}
            onChange={e => setAnswer(e.target.value)}
          >
            <option value="">Selecione uma opção</option>
            {pergunta.opcoes.map((opt, idx) => (
              <option key={idx} value={opt.option_text}>{opt.option_text}</option>
            ))}
          </select>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{formulario.titulo}</h2>
        <p className="text-gray-700">{formulario.descricao}</p>
        {formulario.mostrar_ajuda && formulario.ajuda && <p className="text-sm text-gray-500 mt-2">Ajuda: {formulario.ajuda}</p>}
        {formulario.mostrar_embed_youtube && formulario.embed_youtube && (
          <div className="mt-2">
            <Button size="sm" onClick={() => onOpenVideo(formulario.embed_youtube)}>
              ▶ Ver Vídeo de Ajuda
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {perguntas.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <label className="block font-semibold mb-2">
              {p.pergunta_texto} {p.obrigatoria && <span className="text-red-500">*</span>}
            </label>
            
            {p.mostrar_ajuda && p.ajuda && (
              <p className="text-sm text-gray-500 mb-2">Ajuda: {p.ajuda}</p>
            )}
            
            {p.mostrar_embed_youtube && p.embed_youtube && (
              <div className="mb-2">
                <Button size="sm" onClick={() => onOpenVideo(p.embed_youtube)}>
                  ▶ Ver Vídeo da Pergunta
                </Button>
              </div>
            )}

            {renderizarPergunta(p, respostas[p.id], (val) => onChangeResposta(p.id, val))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FormPreview
