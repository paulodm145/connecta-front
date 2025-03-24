import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select"
import { Check, ChevronDown, Send } from "lucide-react"

interface Item {
  id: number
  label: string
}

interface MultiSelectDropdownProps {
  data: Item[]
  title?: string
  buttonText?: string

  // Dispara toda vez que o array de IDs selecionados muda
  onSelectionChange?: (selectedIds: number[]) => void

  // Agora, ao clicar no botão de enviar, chamamos essa função
  // passando os itens selecionados (e eventuais campos adicionais).
  onSend?: (selectedIds: number[]) => void 
}

export default function MultiSelectDropdown({
  data,
  title = "Selecione os itens",
  buttonText = "Enviar",
  onSelectionChange,
  onSend,
}: MultiSelectDropdownProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectItem = (id: number) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((itemId) => itemId !== id)
      : [...selectedIds, id]
    
    setSelectedIds(newSelectedIds)
    onSelectionChange?.(newSelectedIds)
  }

  const handleSelectAll = () => {
    const newSelectedIds = 
      selectedIds.length === data.length
        ? []
        : data.map((item) => item.id)
    setSelectedIds(newSelectedIds)
    onSelectionChange?.(newSelectedIds)
  }

  // Retorna o texto que deve aparecer no campo
  const getSelectedText = () => {
    if (selectedIds.length === 0) return title
    if (selectedIds.length === data.length) return "Todos selecionados"
    return data
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => item.label)
      .join(", ")
  }

  // Ao clicar no botão, apenas chamamos a prop onSend
  // Quem faz o fetch ou qualquer lógica de envio será o pai
  const handleSendClick = () => {
    if (selectedIds.length === 0) return
    setIsLoading(true)

    // Disparamos a função recebida via props
    onSend?.(selectedIds)

    // Simulando um pequeno "delay" de loading (opcional)
    setTimeout(() => {
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <Select open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger className="w-full min-w-[200px] relative">
          {/* Texto customizado (sem <SelectValue> para multi-select) */}
          <span className="truncate">{getSelectedText()}</span>
          {/* Ícone de seta na direita, manualmente */}
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
        </SelectTrigger>

        <SelectContent className="min-w-[300px]">
          <div className="p-1 space-y-1">
            {/* Opção para Selecionar Todos */}
            <div
              className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer rounded-sm"
              onClick={(e) => {
                e.preventDefault()
                handleSelectAll()
              }}
            >
              <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                {selectedIds.length === data.length && <Check className="h-3 w-3" />}
              </div>
              <span className="text-sm">Selecionar todos</span>
            </div>

            <div className="h-px bg-border" />

            {/* Lista de itens para marcar */}
            {data.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer rounded-sm"
                onClick={(e) => {
                  e.preventDefault()
                  handleSelectItem(item.id)
                }}
              >
                <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                  {selectedIds.includes(item.id) && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </SelectContent>
      </Select>

      {/* Botão que chama a função onSend do pai */}
      <Button
        onClick={handleSendClick}
        disabled={selectedIds.length === 0 || isLoading}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        {isLoading ? "Enviando..." : buttonText}
        <span className="ml-1 text-muted-foreground">
          ({selectedIds.length})
        </span>
      </Button>
    </div>
  )
}
