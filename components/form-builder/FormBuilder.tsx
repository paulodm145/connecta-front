"use client"

import { FC } from 'react'
import { DadosFormulario, DadosPergunta } from './types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import ItemPerguntaOrdenavel from './ItemPerguntaOrdenavel'

interface FormBuilderProps {
  formulario: DadosFormulario,
  setFormulario: (f: DadosFormulario) => void,
  perguntas: DadosPergunta[],
  setPerguntas: (p: DadosPergunta[]) => void,
  onOpenPreview: () => void,
  onSaveForm: () => void,
  onAddPergunta: () => void
}

const FormBuilder: FC<FormBuilderProps> = ({
  formulario,
  setFormulario,
  perguntas,
  setPerguntas,
  onOpenPreview,
  onSaveForm,
  onAddPergunta
}) => {

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

  const atualizarPerguntaNoIndice = (index: number, atualizado: DadosPergunta) => {
    const novas = [...perguntas]
    novas[index] = atualizado
    setPerguntas(novas)
  }

  const removerPergunta = (index: number) => {
    const atualizado = perguntas.filter((_, i) => i !== index)
    const reOrdenado = atualizado.map((p, idx) => ({ ...p, ordem: idx + 1 }))
    setPerguntas(reOrdenado)
  }

  return (
    <div className="border rounded p-4 bg-white space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">Construtor do Formulário</h1>
        <div className="space-x-2">
          <Button onClick={onAddPergunta}>Adicionar Pergunta</Button>
          {perguntas.length > 0 && (
            <>
              <Button variant="outline" onClick={onOpenPreview}>Preview do Formulário</Button>
              <Button variant="secondary" onClick={onSaveForm}>Salvar Formulário</Button>
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
    </div>
  )
}

export default FormBuilder
