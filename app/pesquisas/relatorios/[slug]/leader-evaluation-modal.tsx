"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface LeaderEvaluationModalProps {
  pesquisaTitulo: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (avaliacao: string) => void
  initialValue?: string
}

export function LeaderEvaluationModal({
  pesquisaTitulo,
  open,
  onOpenChange,
  onSave,
  initialValue = "",
}: LeaderEvaluationModalProps) {
  const [avaliacao, setAvaliacao] = useState("")

  // Resetar o textarea quando o modal é aberto
  useEffect(() => {
    if (open) {
      setAvaliacao(initialValue)
    }
  }, [open, initialValue])

  const handleSave = () => {
    onSave(avaliacao)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setAvaliacao(initialValue)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{pesquisaTitulo}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avaliacao" className="text-sm font-medium">
              Avaliação do Líder da equipe
            </Label>
            <Textarea
              id="avaliacao"
              value={avaliacao}
              onChange={(e) => setAvaliacao(e.target.value)}
              placeholder="Digite sua avaliação aqui..."
              className="min-h-[150px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="min-w-[80px]">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
