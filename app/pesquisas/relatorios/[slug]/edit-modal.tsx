"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface EditModalProps {
  title: string
  rowData: Record<string, any> | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { notes: string; rowData: Record<string, any> }) => void
}

export function EditModal({ title, rowData, open, onOpenChange, onSave }: EditModalProps) {
  const [notes, setNotes] = useState("")
  const maxLength = 500

  // Resetar o textarea quando o modal é aberto com novos dados
  useEffect(() => {
    if (open && rowData) {
      setNotes(rowData.notes || "")
    }
  }, [open, rowData])

  const handleSave = () => {
    if (rowData) {
      onSave({ notes, rowData })
    }
  }

  const characterCount = notes.length
  const isNearLimit = characterCount > 450

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Digite suas observações aqui..."
            className="min-h-[120px]"
            maxLength={maxLength}
          />
          <div className="flex justify-end">
            <span className={`text-sm ${isNearLimit ? "text-orange-600" : "text-gray-500"}`}>
              {characterCount}/{maxLength} caracteres
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
