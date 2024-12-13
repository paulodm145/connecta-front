"use client"

import { useState, CSSProperties, FC } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import InputMask from 'react-input-mask'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type TipoPergunta = 
  | 'TEXT'
  | 'TEXT_MASKED'
  | 'TEXTAREA'
  | 'TOGGLE'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'SELECT'

interface OpcaoPergunta {
  option_text: string
  option_score: number
  order?: number
}

interface DadosPergunta {
  id: string
  pergunta_texto: string
  tipo_pergunta: TipoPergunta
  obrigatoria: boolean
  pontuacao_base: number
  mascara?: string
  opcoes: OpcaoPergunta[]
  ordem?: number
  ajuda?: string
  embed_youtube?: string
  mostrar_ajuda?: boolean
  mostrar_embed_youtube?: boolean
}

interface DadosFormulario {
  titulo: string
  descricao: string
  slug: string
  status: 'rascunho' | 'publicado'
  ajuda?: string
  embed_youtube?: string
  mostrar_ajuda?: boolean
  mostrar_embed_youtube?: boolean
  perguntas: DadosPergunta[]
}

const TIPOS_PERGUNTA: { value: TipoPergunta; label: string }[] = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'TEXT_MASKED', label: 'Texto com Máscara' },
  { value: 'TEXTAREA', label: 'Texto Longo (Textarea)' },
  { value: 'TOGGLE', label: 'Alternador (Switch)' },
  { value: 'SINGLE_CHOICE', label: 'Escolha Única (Radio)' },
  { value: 'MULTIPLE_CHOICE', label: 'Múltipla Escolha (Checkbox)' },
  { value: 'SELECT', label: 'Seleção (Select)' }
]

function renderizarPergunta(
  pergunta: DadosPergunta,
  valorResposta: any,
  onChangeResposta: (val: any) => void
) {
  const setAnswer = (val: any) => onChangeResposta(val)
  
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
          <input 
            type="checkbox" 
            checked={boolValue} 
            onChange={e => setAnswer(e.target.checked ? true : false)} 
          />
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

function ItemPerguntaOrdenavel({ pergunta, index, atualizarPerguntaNoIndice, removerPergunta }: {
  pergunta: DadosPergunta,
  index: number,
  atualizarPerguntaNoIndice: (index: number, updated: DadosPergunta) => void,
  removerPergunta: (index: number) => void
}) {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: pergunta.id})
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Accordion type="single" collapsible className="border rounded mb-2">
        <AccordionItem value={`item-${pergunta.id}`}>
          <AccordionTrigger className="p-2 flex justify-between w-full">
            <span>{pergunta.pergunta_texto || `Pergunta ${index+1}`}</span>
            <span className="text-sm text-gray-500">Ordem: {pergunta.ordem}</span>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <ConstrutorPergunta
              pergunta={pergunta}
              onChange={(updated) => atualizarPerguntaNoIndice(index, updated)}
              onRemove={() => removerPergunta(index)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

interface PropsConstrutorPergunta {
  pergunta?: Partial<DadosPergunta>
  onChange?: (updatedPergunta: DadosPergunta) => void
  onRemove?: () => void
}

const ConstrutorPergunta: FC<PropsConstrutorPergunta> = ({ pergunta = {}, onChange, onRemove }) => {
  const [dadosPergunta, setDadosPergunta] = useState<DadosPergunta>({
    id: pergunta.id || '',
    pergunta_texto: pergunta.pergunta_texto || '',
    tipo_pergunta: pergunta.tipo_pergunta || 'TEXT',
    obrigatoria: pergunta.obrigatoria || false,
    pontuacao_base: pergunta.pontuacao_base || 0,
    mascara: pergunta.mascara || '',
    opcoes: pergunta.opcoes || [],
    ordem: pergunta.ordem,
    ajuda: pergunta.ajuda || '',
    embed_youtube: pergunta.embed_youtube || '',
    mostrar_ajuda: pergunta.mostrar_ajuda || false,
    mostrar_embed_youtube: pergunta.mostrar_embed_youtube || false
  })

  const handlePerguntaChange = (campo: keyof DadosPergunta, valor: any) => {
    const atualizado: DadosPergunta = { ...dadosPergunta, [campo]: valor }
    setDadosPergunta(atualizado)
    onChange?.(atualizado)
  }

  const handleOpcaoChange = (index: number, campo: keyof OpcaoPergunta, valor: any) => {
    const opcoesAtualizadas = [...dadosPergunta.opcoes]
    opcoesAtualizadas[index] = { ...opcoesAtualizadas[index], [campo]: valor }
    handlePerguntaChange('opcoes', opcoesAtualizadas)
  }

  const adicionarOpcao = () => {
    handlePerguntaChange('opcoes', [...dadosPergunta.opcoes, { option_text: '', option_score: 0 }])
  }

  const removerOpcao = (index: number) => {
    const opcoesAtualizadas = dadosPergunta.opcoes.filter((_, i) => i !== index)
    handlePerguntaChange('opcoes', opcoesAtualizadas)
  }

  const deveMostrarOpcoes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SELECT'].includes(dadosPergunta.tipo_pergunta)

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Texto da Pergunta</label>
        <Input 
          value={dadosPergunta.pergunta_texto}
          onChange={e => handlePerguntaChange('pergunta_texto', e.target.value)}
          placeholder="Digite a pergunta"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Tipo de Pergunta</label>
        <Select
          value={dadosPergunta.tipo_pergunta}
          onValueChange={(val) => handlePerguntaChange('tipo_pergunta', val as TipoPergunta)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_PERGUNTA.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={dadosPergunta.obrigatoria} 
          onCheckedChange={(val) => handlePerguntaChange('obrigatoria', val)}
        />
        <span>Pergunta obrigatória?</span>
      </div>

      <div>
        <label className="block font-semibold mb-1">Pontuação Base</label>
        <Input 
          type="number"
          value={dadosPergunta.pontuacao_base}
          onChange={e => handlePerguntaChange('pontuacao_base', parseInt(e.target.value, 10) || 0)}
          placeholder="Pontuação base"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={!!dadosPergunta.mostrar_ajuda} 
          onCheckedChange={(val) => handlePerguntaChange('mostrar_ajuda', val)}
        />
        <span>Mostrar campo de ajuda?</span>
      </div>
      {dadosPergunta.mostrar_ajuda && (
        <div>
          <label className="block font-semibold mb-1">Ajuda</label>
          <Input
            value={dadosPergunta.ajuda || ''}
            onChange={e => handlePerguntaChange('ajuda', e.target.value)}
            placeholder="Texto de ajuda para o usuário"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch 
          checked={!!dadosPergunta.mostrar_embed_youtube} 
          onCheckedChange={(val) => handlePerguntaChange('mostrar_embed_youtube', val)}
        />
        <span>Mostrar campo de Embed do Youtube?</span>
      </div>
      {dadosPergunta.mostrar_embed_youtube && (
        <div>
          <label className="block font-semibold mb-1">Embed Youtube</label>
          <Input
            value={dadosPergunta.embed_youtube || ''}
            onChange={e => handlePerguntaChange('embed_youtube', e.target.value)}
            placeholder="URL ou código embed do Youtube"
          />
        </div>
      )}

      {dadosPergunta.tipo_pergunta === 'TEXT_MASKED' && (
        <div>
          <label className="block font-semibold mb-1">Máscara</label>
          <Input
            value={dadosPergunta.mascara || ''}
            onChange={e => handlePerguntaChange('mascara', e.target.value)}
            placeholder="Ex: (99) 99999-9999"
          />
        </div>
      )}

      {deveMostrarOpcoes && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold">Opções</label>
            <Button size="sm" onClick={adicionarOpcao}>+ Adicionar Opção</Button>
          </div>
          {dadosPergunta.opcoes.map((opt, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <Input 
                value={opt.option_text}
                onChange={e => handleOpcaoChange(index, 'option_text', e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />
              <Input 
                type="number"
                value={opt.option_score}
                onChange={e => handleOpcaoChange(index, 'option_score', parseInt(e.target.value, 10) || 0)}
                placeholder="Pontuação"
                className="w-20"
              />
              <Button variant="destructive" size="sm" onClick={() => removerOpcao(index)}>Remover</Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-2 pt-4 border-t mt-4">
        {onRemove && (
          <Button variant="destructive" onClick={onRemove}>Remover Pergunta</Button>
        )}
      </div>
    </div>
  )
}


export default function PaginaConstrutor() {
  const [perguntas, setPerguntas] = useState<DadosPergunta[]>([])
  const [mostrarModalAdd, setMostrarModalAdd] = useState(false)
  const [mostrarFormPreview, setMostrarFormPreview] = useState(false)

  const [formulario, setFormulario] = useState<DadosFormulario>({
    titulo: 'Meu Formulário',
    descricao: 'Descrição do meu formulário',
    slug: 'meu-formulario-' + Math.random().toString(36).substring(7),
    status: 'rascunho',
    ajuda: '',
    embed_youtube: '',
    mostrar_ajuda: false,
    mostrar_embed_youtube: false,
    perguntas: []
  })

  const [perguntaAtual, setPerguntaAtual] = useState<Partial<DadosPergunta>>({})

  const [respostas, setRespostas] = useState<{ [perguntaId: string]: any }>({})
  
  // Novo estado para controlar exibição do modal de vídeo
  const [mostrarModalVideo, setMostrarModalVideo] = useState(false)
  const [videoEmbedAtual, setVideoEmbedAtual] = useState<string>('')

  const abrirModalAdd = () => {
    setPerguntaAtual({
      pergunta_texto: '',
      tipo_pergunta: 'TEXT',
      obrigatoria: false,
      pontuacao_base: 0,
      opcoes: [],
      ordem: perguntas.length + 1,
      ajuda: '',
      embed_youtube: '',
      mostrar_ajuda: false,
      mostrar_embed_youtube: false
    })
    setMostrarModalAdd(true)
  }

  const handleAdicionarPergunta = () => {
    if (perguntaAtual && perguntaAtual.pergunta_texto) {
      const perguntaCompleta: DadosPergunta = {
        id: crypto.randomUUID(),
        pergunta_texto: perguntaAtual.pergunta_texto || '',
        tipo_pergunta: perguntaAtual.tipo_pergunta || 'TEXT',
        obrigatoria: perguntaAtual.obrigatoria || false,
        pontuacao_base: perguntaAtual.pontuacao_base || 0,
        mascara: perguntaAtual.mascara,
        opcoes: perguntaAtual.opcoes || [],
        ordem: perguntaAtual.ordem ?? (perguntas.length + 1),
        ajuda: perguntaAtual.ajuda || '',
        embed_youtube: perguntaAtual.embed_youtube || '',
        mostrar_ajuda: perguntaAtual.mostrar_ajuda || false,
        mostrar_embed_youtube: perguntaAtual.mostrar_embed_youtube || false
      }
      setPerguntas((prev) => [...prev, perguntaCompleta])
      setMostrarModalAdd(false)
    }
  }

  const removerPergunta = (index: number) => {
    const atualizado = perguntas.filter((_, i) => i !== index)
    const reOrdenado = atualizado.map((p, idx) => ({ ...p, ordem: idx + 1 }))
    setPerguntas(reOrdenado)
  }

  const atualizarPerguntaNoIndice = (index: number, atualizado: DadosPergunta) => {
    const novasPerguntas = [...perguntas]
    novasPerguntas[index] = atualizado
    setPerguntas(novasPerguntas)
  }

  const enviarFormulario = () => {
    const perguntasFinais = perguntas.map((p, i) => ({ ...p, ordem: i+1 }))
    const formFinal = {
      ...formulario,
      perguntas: perguntasFinais
    }
    console.log('Enviando o formulário:', formFinal)
    alert('Formulário enviado! Confira o console.')
  }

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: {distance: 5} })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event
    if (!over) return
    if (active.id !== over.id) {
      const oldIndex = perguntas.findIndex((p) => p.id === active.id)
      const newIndex = perguntas.findIndex((p) => p.id === over.id)
      const novasPerguntas = arrayMove(perguntas, oldIndex, newIndex)
      const reOrdenado = novasPerguntas.map((p, idx) => ({ ...p, ordem: idx + 1 }))
      setPerguntas(reOrdenado)
    }
  }

  const handlePreviewAnswerChange = (perguntaId: string, value: any) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: value }))
  }

  // Função para exibir o modal de vídeo
  const abrirModalVideoEmbed = (embedCode: string) => {
    setVideoEmbedAtual(embedCode)
    setMostrarModalVideo(true)
  }

  const renderizarPreviewFormularioCompleto = () => {
    const { mostrar_ajuda, mostrar_embed_youtube, ajuda, embed_youtube } = formulario

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">{formulario.titulo}</h2>
          <p className="text-gray-700">{formulario.descricao}</p>
          {mostrar_ajuda && ajuda && <p className="text-sm text-gray-500 mt-2">Ajuda: {ajuda}</p>}
          {mostrar_embed_youtube && embed_youtube && (
            <div className="mt-2">
              <Button size="sm" onClick={() => abrirModalVideoEmbed(embed_youtube)}>
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
                  <Button size="sm" onClick={() => abrirModalVideoEmbed(p.embed_youtube)}>
                    ▶ Ver Vídeo da Pergunta
                  </Button>
                </div>
              )}

              {renderizarPergunta(p, respostas[p.id], (val) => handlePreviewAnswerChange(p.id, val))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">Construtor do Formulário</h1>
        <div className="space-x-2">
          <Button onClick={abrirModalAdd}>Adicionar Pergunta</Button>
          {perguntas.length > 0 && (
            <>
              <Button variant="outline" onClick={() => setMostrarFormPreview(true)}>Preview do Formulário</Button>
              <Button variant="secondary" onClick={enviarFormulario}>Salvar Formulário</Button>
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Título do Formulário</label>
          <Input 
            value={formulario.titulo}
            onChange={e => setFormulario({...formulario, titulo: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="Digite o título do formulário"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Descrição do Formulário</label>
          <textarea
            className="border rounded p-2 w-full"
            value={formulario.descricao}
            onChange={e => setFormulario({...formulario, descricao: e.target.value})}
            placeholder="Digite a descrição"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Status do Formulário</label>
          <Select
            value={formulario.status}
            onValueChange={(val) => setFormulario({...formulario, status: val as 'rascunho'|'publicado'})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            checked={!!formulario.mostrar_ajuda} 
            onCheckedChange={(val) => setFormulario({...formulario, mostrar_ajuda: val})}
          />
          <span>Mostrar campo de ajuda no formulário?</span>
        </div>
        {formulario.mostrar_ajuda && (
          <div>
            <label className="block font-semibold mb-1">Ajuda do Formulário</label>
            <Input
              value={formulario.ajuda || ''}
              onChange={e => setFormulario({...formulario, ajuda: e.target.value})}
              placeholder="Texto de ajuda"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch 
            checked={!!formulario.mostrar_embed_youtube} 
            onCheckedChange={(val) => setFormulario({...formulario, mostrar_embed_youtube: val})}
          />
          <span>Mostrar Embed Youtube no formulário?</span>
        </div>
        {formulario.mostrar_embed_youtube && (
          <div>
            <label className="block font-semibold mb-1">Embed Youtube do Formulário</label>
            <Input
              value={formulario.embed_youtube || ''}
              onChange={e => setFormulario({...formulario, embed_youtube: e.target.value})}
              placeholder="URL ou código embed do Youtube"
            />
          </div>
        )}
      </div>

      <p className="text-gray-700">
        Adicione quantas perguntas desejar. Você pode reordenar as perguntas arrastando-as. Cada pergunta pode ser expandida para edição.
      </p>

      <DndContext sensors={sensores} onDragEnd={onDragEnd}>
        <SortableContext items={perguntas.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {perguntas.map((pergunta, index) => (
            <ItemPerguntaOrdenavel
              key={pergunta.id}
              pergunta={pergunta}
              index={index}
              atualizarPerguntaNoIndice={atualizarPerguntaNoIndice}
              removerPergunta={removerPergunta}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Modal para Adicionar Nova Pergunta */}
      <Dialog open={mostrarModalAdd} onOpenChange={setMostrarModalAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
            <DialogDescription>
              Configure a pergunta e depois clique em "Adicionar".
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ConstrutorPergunta
              pergunta={perguntaAtual}
              onChange={(atualizada) => setPerguntaAtual(atualizada)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleAdicionarPergunta}>Adicionar</Button>
            <Button variant="secondary" onClick={() => setMostrarModalAdd(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Preview do Formulário Completo */}
      <Dialog open={mostrarFormPreview} onOpenChange={setMostrarFormPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Formulário</DialogTitle>
            <DialogDescription>
              Veja abaixo como o formulário será exibido para o usuário. É possível interagir com os campos.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {perguntas.length === 0 ? (
              <p>Nenhuma pergunta adicionada ainda.</p>
            ) : (
              renderizarPreviewFormularioCompleto()
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setMostrarFormPreview(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Exibir Vídeo do Formulário ou da Pergunta */}
      <Dialog open={mostrarModalVideo} onOpenChange={setMostrarModalVideo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajuda em Vídeo</DialogTitle>
            <DialogDescription>
              Veja o vídeo de ajuda abaixo:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {videoEmbedAtual ? (
              <div dangerouslySetInnerHTML={{__html: videoEmbedAtual}}></div>
            ) : (
              <p>Nenhum vídeo disponível.</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setMostrarModalVideo(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
