'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { FormBuilderQuestion } from "./FormBuilderQuestion"
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { CSSProperties } from 'react'
import InputMask from 'react-input-mask'

type QuestionType = 
  | 'text'
  | 'text_masked'
  | 'textarea'
  | 'toggle'
  | 'single_choice'
  | 'multiple_choice'
  | 'select'

interface QuestionOption {
  option_text: string
  option_score: number
  order?: number
}

interface QuestionData {
  id: string
  question_text: string
  question_type: QuestionType
  is_required: boolean
  base_score: number
  mask?: string
  options: QuestionOption[]
  order?: number
}

function SortableQuestionItem({ question, index, updateQuestionAtIndex, removeQuestion }: {
  question: QuestionData,
  index: number,
  updateQuestionAtIndex: (index: number, updated: QuestionData) => void,
  removeQuestion: (index: number) => void
}) {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: question.id})
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Accordion type="single" collapsible className="border rounded mb-2">
        <AccordionItem value={`item-${question.id}`}>
          <AccordionTrigger className="p-2 flex justify-between w-full">
            <span>{question.question_text || `Pergunta ${index+1}`}</span>
            <span className="text-sm text-gray-500">Ordem: {question.order}</span>
          </AccordionTrigger>
          <AccordionContent className="p-4 border-t">
            <FormBuilderQuestion
              question={question}
              onChange={(updated) => updateQuestionAtIndex(index, updated)}
              onRemove={() => removeQuestion(index)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default function BuilderPage() {
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFormPreview, setShowFormPreview] = useState(false)

  const [currentQuestion, setCurrentQuestion] = useState<Partial<QuestionData>>({})

  const openAddModal = () => {
    setCurrentQuestion({
      question_text: '',
      question_type: 'text',
      is_required: false,
      base_score: 0,
      options: [],
      order: questions.length + 1
    })
    setShowAddModal(true)
  }

  const handleAddQuestion = () => {
    if (currentQuestion && currentQuestion.question_text) {
      const completedQuestion: QuestionData = {
        id: crypto.randomUUID(),
        question_text: currentQuestion.question_text || '',
        question_type: currentQuestion.question_type || 'text',
        is_required: currentQuestion.is_required || false,
        base_score: currentQuestion.base_score || 0,
        mask: currentQuestion.mask,
        options: currentQuestion.options || [],
        order: currentQuestion.order ?? (questions.length + 1)
      }
      setQuestions((prev) => [...prev, completedQuestion])
      setShowAddModal(false)
    }
  }

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index)
    const reOrdered = updated.map((q, idx) => ({ ...q, order: idx + 1 }))
    setQuestions(reOrdered)
  }

  const updateQuestionAtIndex = (index: number, updated: QuestionData) => {
    const newQuestions = [...questions]
    newQuestions[index] = updated
    setQuestions(newQuestions)
  }

  const submitForm = () => {
    const finalQuestions = questions.map((q, i) => ({ ...q, order: i+1 }))
    const form = {
      title: 'Meu Formulário',
      description: 'Descrição do meu formulário',
      questions: finalQuestions
    }
    console.log('Enviando o formulário:', form)
    alert('Formulário enviado! Confira o console.')
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: {distance: 5} })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event
    if (!over) return
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      const newQuestions = arrayMove(questions, oldIndex, newIndex)
      const reOrdered = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }))
      setQuestions(reOrdered)
    }
  }

  // Estado para as respostas no preview completo do formulario
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({})

  const handlePreviewAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const renderFullFormPreview = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Visualização do Formulário</h2>
          <p className="text-gray-700">
            Abaixo você vê como o usuário final enxergará e poderá interagir com o formulário.
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border p-4 rounded">
              <label className="block font-semibold mb-2">
                {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
              </label>
              {renderQuestionPreview(q)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderQuestionPreview = (question: QuestionData) => {
    const answer = answers[question.id]
    const setAnswer = (val: any) => handlePreviewAnswerChange(question.id, val)

    if (question.question_type === 'text') {
      return (
        <input 
          type="text" 
          className="border rounded p-2 w-full" 
          placeholder="Digite sua resposta..." 
          value={answer || ''} 
          onChange={e => setAnswer(e.target.value)}
        />
      )
    }

    if (question.question_type === 'text_masked') {
      return (
        <InputMask
          mask={question.mask || '(99) 99999-9999'}
          value={answer || ''}
          onChange={e => setAnswer(e.target.value)}
        >
          {(inputProps: any) => <input {...inputProps} className="border rounded p-2 w-full" placeholder={question.mask || '(99) 99999-9999'} />}
        </InputMask>
      )
    }

    if (question.question_type === 'textarea') {
      return (
        <textarea 
          className="border rounded p-2 w-full" 
          placeholder="Digite seu texto..."
          value={answer || ''} 
          onChange={e => setAnswer(e.target.value)}
        />
      )
    }

    if (question.question_type === 'toggle') {
      const boolValue = !!answer
      return (
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={boolValue} 
            onChange={e => setAnswer(e.target.checked ? true : false)} 
          />
          <span>Toggle (ligado/desligado)</span>
        </div>
      )
    }

    if (question.question_type === 'single_choice') {
      return (
        <div className="space-y-1">
          {question.options.map((opt, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question_${question.id}`}
                checked={answer === opt.option_text}
                onChange={() => setAnswer(opt.option_text)}
              />
              <label>{opt.option_text}</label>
            </div>
          ))}
        </div>
      )
    }

    if (question.question_type === 'multiple_choice') {
      const selectedValues = Array.isArray(answer) ? answer : []
      return (
        <div className="space-y-1">
          {question.options.map((opt, idx) => {
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
    }

    if (question.question_type === 'select') {
      return (
        <select
          className="border rounded p-2 w-full"
          value={answer || ''}
          onChange={e => setAnswer(e.target.value)}
        >
          <option value="">Selecione uma opção</option>
          {question.options.map((opt, idx) => (
            <option key={idx} value={opt.option_text}>{opt.option_text}</option>
          ))}
        </select>
      )
    }

    return null
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold">Builder do Formulário</h1>
        <div className="space-x-2">
          <Button onClick={openAddModal}>Adicionar Pergunta</Button>
          {questions.length > 0 && (
            <>
              <Button variant="outline" onClick={() => setShowFormPreview(true)}>Preview do Formulário</Button>
              <Button variant="secondary" onClick={submitForm}>Salvar Formulário</Button>
            </>
          )}
        </div>
      </div>
      
      <p className="text-gray-700">
        Adicione quantas perguntas desejar. Você pode reordenar as perguntas arrastando-as. Cada pergunta pode ser expandida para edição.
      </p>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
          {questions.map((question, index) => (
            <SortableQuestionItem
              key={question.id}
              question={question}
              index={index}
              updateQuestionAtIndex={updateQuestionAtIndex}
              removeQuestion={removeQuestion}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Modal para Adicionar Nova Pergunta */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
            <DialogDescription>
              Configure a pergunta e depois clique em "Adicionar".
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <FormBuilderQuestion
              question={currentQuestion}
              onChange={(updated) => setCurrentQuestion(updated)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleAddQuestion}>Adicionar</Button>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Preview do Formulário Completo */}
      <Dialog open={showFormPreview} onOpenChange={setShowFormPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Formulário</DialogTitle>
            <DialogDescription>
              Veja abaixo como o formulário será exibido para o usuário. É possível interagir com os campos.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {questions.length === 0 ? (
              <p>Nenhuma pergunta adicionada ainda.</p>
            ) : (
              renderFullFormPreview()
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowFormPreview(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
