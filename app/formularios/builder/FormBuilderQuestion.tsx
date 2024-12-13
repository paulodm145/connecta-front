'use client'
import { FC, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Tipos de pergunta suportados
type QuestionType = 
  | 'TEXT'
  | 'TEXT_MASKED'
  | 'TEXTAREA'
  | 'TOGGLE'
  | 'SIGNLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'SELECT'

interface QuestionOption {
  option_text: string
  option_score: number
}

interface QuestionData {
  question_text: string
  question_type: QuestionType
  is_required: boolean
  base_score: number
  mask?: string
  options: QuestionOption[]
}

interface FormBuilderQuestionProps {
  question?: Partial<QuestionData> // Caso a pergunta venha parcial
  onChange?: (updatedQuestion: QuestionData) => void
  onRemove?: () => void
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'TEXT_MASKED', label: 'Texto com Máscara' },
  { value: 'TESTAREA', label: 'Texto Longo (Textarea)' },
  { value: 'TOGGLE', label: 'Toggle (Switch)' },
  { value: 'SINGLE_CHOICE', label: 'Escolha Única (Radio)' },
  { value: 'MULTIPLE_CHOICE', label: 'Múltipla Escolha (Checkbox)' },
  { value: 'SELECT', label: 'Seleção (Select)' }
]

export const FormBuilderQuestion: FC<FormBuilderQuestionProps> = ({ question = {}, onChange, onRemove }) => {
  const [questionData, setQuestionData] = useState<QuestionData>({
    question_text: question.question_text || '',
    question_type: question.question_type || 'TEXT',
    is_required: question.is_required || false,
    base_score: question.base_score || 0,
    mask: question.mask || '',
    options: question.options || []
  })

  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [previewAnswer, setPreviewAnswer] = useState<{ value?: string | string[] }>({})

  const handleQuestionChange = (field: keyof QuestionData, value: any) => {
    const updated: QuestionData = { ...questionData, [field]: value }
    setQuestionData(updated)
    onChange?.(updated)
  }

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
    const updatedOptions = [...questionData.options]
    updatedOptions[index] = { ...updatedOptions[index], [field]: value }
    handleQuestionChange('options', updatedOptions)
  }

  const addOption = () => {
    handleQuestionChange('options', [...questionData.options, { option_text: '', option_score: 0 }])
  }

  const removeOption = (index: number) => {
    const updatedOptions = questionData.options.filter((_, i) => i !== index)
    handleQuestionChange('options', updatedOptions)
  }

  const shouldShowOptions = ['single_choice', 'multiple_choice', 'select'].includes(questionData.question_type)

  const renderOptionsSection = () => {
    if (!shouldShowOptions) return null
    return (
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <label className="font-semibold">Opções</label>
          <Button size="sm" onClick={addOption}>+ Adicionar Opção</Button>
        </div>
        {questionData.options.map((opt, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <Input 
              value={opt.option_text}
              onChange={e => handleOptionChange(index, 'option_text', e.target.value)}
              placeholder={`Opção ${index + 1}`}
            />
            <Input 
              type="number"
              value={opt.option_score}
              onChange={e => handleOptionChange(index, 'option_score', parseInt(e.target.value, 10) || 0)}
              placeholder="Pontuação"
              className="w-20"
            />
            <Button variant="destructive" size="sm" onClick={() => removeOption(index)}>Remover</Button>
          </div>
        ))}
      </div>
    )
  }

  const renderPreviewQuestion = () => {
    const q = questionData
    const answer = previewAnswer
    const setAnswer = (val: string | string[]) => setPreviewAnswer({ value: val })

    if (q.question_type === 'text') {
      return <Input value={answer.value || ''} onChange={e => setAnswer(e.target.value)} placeholder="Digite sua resposta" />
    }
    if (q.question_type === 'text_masked') {
      // Sem a lib de máscara real, apenas simulação
      return <Input value={answer.value || ''} onChange={e => setAnswer(e.target.value)} placeholder="(99) 99999-9999" />
    }
    if (q.question_type === 'textarea') {
      return <textarea className="w-full border border-gray-300 rounded p-2" value={answer.value || ''} onChange={e => setAnswer(e.target.value)} placeholder="Digite seu texto..." />
    }
    if (q.question_type === 'toggle') {
      const boolValue = !!answer.value
      return (
        <div className="flex items-center space-x-2">
          <Switch checked={boolValue} onCheckedChange={(val) => setAnswer(val ? 'on' : '')} />
          <span>{boolValue ? 'Ligado' : 'Desligado'}</span>
        </div>
      )
    }
    if (q.question_type === 'single_choice') {
      return (
        <div className="space-y-1">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center space-x-2">
              <input
                type="radio"
                name="preview_radio"
                checked={answer.value === opt.option_text}
                onChange={() => setAnswer(opt.option_text)}
              />
              <label>{opt.option_text}</label>
            </div>
          ))}
        </div>
      )
    }
    if (q.question_type === 'multiple_choice') {
      const selectedValues = Array.isArray(answer.value) ? answer.value : []
      return (
        <div className="space-y-1">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.option_text)}
                onChange={e => {
                  if (e.target.checked) {
                    setAnswer([...selectedValues, opt.option_text])
                  } else {
                    setAnswer(selectedValues.filter(v => v !== opt.option_text))
                  }
                }}
              />
              <label>{opt.option_text}</label>
            </div>
          ))}
        </div>
      )
    }
    if (q.question_type === 'select') {
      return (
        <select
          className="border border-gray-300 rounded p-2 w-full"
          value={(answer.value as string) || ''}
          onChange={e => setAnswer(e.target.value)}
        >
          <option value="">Selecione uma opção</option>
          {q.options.map((opt, i) => (
            <option key={i} value={opt.option_text}>{opt.option_text}</option>
          ))}
        </select>
      )
    }

    return null
  }

  return (
    <div className="border p-4 rounded-lg space-y-4">
      <div>
        <label className="block font-semibold mb-1">Texto da Pergunta</label>
        <Input 
          value={questionData.question_text}
          onChange={e => handleQuestionChange('question_text', e.target.value)}
          placeholder="Digite a pergunta"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Tipo de Pergunta</label>
        <Select
          value={questionData.question_type}
          onValueChange={(val) => handleQuestionChange('question_type', val as QuestionType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={questionData.is_required} 
          onCheckedChange={(val) => handleQuestionChange('is_required', val)}
        />
        <span>Pergunta obrigatória?</span>
      </div>

      <div>
        <label className="block font-semibold mb-1">Pontuação Base</label>
        <Input 
          type="number"
          value={questionData.base_score}
          onChange={e => handleQuestionChange('base_score', parseInt(e.target.value, 10) || 0)}
          placeholder="Pontuação base"
        />
      </div>

      {questionData.question_type === 'text_masked' && (
        <div>
          <label className="block font-semibold mb-1">Máscara</label>
          <Input
            value={questionData.mask || ''}
            onChange={e => handleQuestionChange('mask', e.target.value)}
            placeholder="Ex: (99) 99999-9999"
          />
        </div>
      )}

      {shouldShowOptions && (
        <>
          {renderOptionsSection()}
        </>
      )}

      <div className="flex space-x-2 pt-4 border-t mt-4">
        {onRemove && (
          <Button variant="destructive" onClick={onRemove}>Remover Pergunta</Button>
        )}
        <Button variant="secondary" onClick={() => setShowPreview(true)}>Preview do Formulário</Button>
      </div>

      {/* Modal de Preview da Pergunta */}
      <Dialog open={showPreview} onOpenChange={(val) => setShowPreview(val)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pré-visualização da Pergunta</DialogTitle>
            <DialogDescription>
              Veja abaixo como esta pergunta será exibida para o usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block font-semibold mb-2">
                {questionData.question_text} {questionData.is_required && <span className="text-red-500">*</span>}
              </label>
              {renderPreviewQuestion()}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setShowPreview(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
