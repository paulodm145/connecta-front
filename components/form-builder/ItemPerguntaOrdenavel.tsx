"use client"

import { FC, CSSProperties } from 'react'
import { DadosPergunta } from './types'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import ConstrutorPergunta from './ConstrutorPergunta'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PropsItemPerguntaOrdenavel {
  pergunta: DadosPergunta,
  index: number,
  atualizarPerguntaNoIndice: (index: number, updated: DadosPergunta) => void,
  removerPergunta: (index: number) => void
  competenciasOptions?: { value: string; label: string }[]
}

const ItemPerguntaOrdenavel: FC<PropsItemPerguntaOrdenavel> = ({ pergunta, index, atualizarPerguntaNoIndice, removerPergunta, competenciasOptions = [] }) => {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: pergunta.id})
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Accordion type="single" collapsible className="border rounded mb-2 bg-white">
        <AccordionItem value={`item-${pergunta.id}`}>
          <AccordionTrigger className="p-2 flex justify-between w-full">
            <span>{pergunta.pergunta_texto || `Pergunta ${index+1}`}</span>
            <span className="text-sm text-gray-500">Ordem: {pergunta.ordem}</span>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t bg-gray-50">
            <ConstrutorPergunta
              pergunta={pergunta}
              competenciasOptions={competenciasOptions}
              onChange={(updated) => atualizarPerguntaNoIndice(index, updated)}
              onRemove={() => removerPergunta(index)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default ItemPerguntaOrdenavel
