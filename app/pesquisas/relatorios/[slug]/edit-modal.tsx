"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EditModalProps {
  title: string
  rowData: Record<string, any> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { anotacao: string; rowData: Record<string, any> }) => void
}

export function EditModal({ title, rowData, open, onOpenChange, onSave }: EditModalProps) {
  const [anotacao, setAnotacao] = useState("")
  const maxLength = 500

  // Resetar o textarea quando o modal é aberto com novos dados
  useEffect(() => {
    if (open && rowData) {
      setAnotacao(rowData.anotacao || "")
    }
  }, [open, rowData])

  const handleSave = () => {
    if (rowData) {
      onSave({ anotacao, rowData })
    }
  }

  const handleCancel = () => {
    setAnotacao(rowData?.anotacao || "")
    onOpenChange(false)
  }

  const characterCount = anotacao.length
  const isNearLimit = characterCount > 450
  const isAtLimit = characterCount >= maxLength

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anotacao" className="text-sm font-medium">
              Observações
            </Label>
            <Textarea
              id="anotacao"
              value={anotacao}
              onChange={(e) => setAnotacao(e.target.value)}
              placeholder="Digite suas observações aqui..."
              className="min-h-[120px] resize-none"
              maxLength={maxLength}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {rowData?.respondente && (
                <span>
                  Respondente: <strong>{rowData.respondente}</strong>
                </span>
              )}
            </div>
            <div className="flex justify-end">
              <span
                className={`text-sm transition-colors ${
                  isAtLimit ? "text-red-600 font-medium" : isNearLimit ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {characterCount}/{maxLength} caracteres
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isAtLimit} className="min-w-[80px]">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
