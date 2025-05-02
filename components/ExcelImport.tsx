"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipos de arquivo Excel aceitos
const EXCEL_FILE_TYPES = [
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "text/csv", // .csv
]

// Tipo para os modelos de planilha
export type SpreadsheetTemplate = {
  name: string
  description?: string
  url: string
}

export type ExcelImportModalProps = {
  // Texto do botão que abre o modal
  buttonText?: string
  // Título do modal
  title?: string
  // Descrição do modal
  description?: string
  // Tamanho máximo do arquivo em MB
  maxSizeInMB?: number
  // Modelos de planilha disponíveis para download
  templates?: SpreadsheetTemplate[]
  // Mensagens personalizáveis
  messages?: {
    dropzoneText?: string
    dropzoneActiveText?: string
    invalidTypeError?: string
    invalidSizeError?: string
    successMessage?: string
    uploadButtonText?: string
    uploadingText?: string
    successUploadText?: string
    templatesTabLabel?: string
    importTabLabel?: string
    noTemplatesMessage?: string
  }
  // Função chamada quando o upload é confirmado
  onImportConfirm?: (file: File) => Promise<void>
}

export default function ExcelImportModal({
  buttonText = "Importar Planilha",
  title = "Importar Planilha",
  description = "Selecione uma planilha Excel para importar",
  maxSizeInMB = 10,
  templates = [],
  messages = {
    dropzoneText: "Arraste e solte sua planilha aqui ou clique para selecionar",
    dropzoneActiveText: "Solte a planilha aqui",
    invalidTypeError: "Apenas arquivos Excel (.xlsx, .xls, .csv) são permitidos",
    invalidSizeError: "O arquivo excede o tamanho máximo permitido",
    successMessage: "Planilha pronta para importação",
    uploadButtonText: "Importar planilha",
    uploadingText: "Importando...",
    successUploadText: "Importado com sucesso!",
    templatesTabLabel: "Modelos",
    importTabLabel: "Importar",
    noTemplatesMessage: "Nenhum modelo de planilha disponível",
  },
  onImportConfirm,
}: ExcelImportModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("import")

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo
    if (!EXCEL_FILE_TYPES.includes(file.type)) {
      setError(messages.invalidTypeError)
      return false
    }

    // Validar tamanho do arquivo
    if (file.size > maxSizeInBytes) {
      setError(messages.invalidSizeError)
      return false
    }

    setError(null)
    return true
  }

  const handleFileSelected = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
      setError(null)
      return true
    }
    return false
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelected(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFileSelected(selectedFile)
    }
  }

  const handleImportConfirm = async () => {
    if (file && onImportConfirm) {
      try {
        setIsUploading(true)
        await onImportConfirm(file)
        setUploadSuccess(true)
        setIsUploading(false)
        // Não fechamos mais o modal automaticamente
      } catch (error) {
        console.error("Erro ao importar planilha:", error)
        setError("Ocorreu um erro ao importar a planilha")
        setIsUploading(false)
      }
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset do estado quando o modal é fechado
      setTimeout(() => {
        setFile(null)
        setIsUploading(false)
        setUploadSuccess(false)
        setError(null)
        setActiveTab("import")
      }, 300)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    setUploadSuccess(false)
  }

  const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase()
  }

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename)
    switch (extension) {
      case "xlsx":
      case "xls":
      case "csv":
      case "ods":
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />
      default:
        return <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">{messages.importTabLabel}</TabsTrigger>
            <TabsTrigger value="templates">{messages.templatesTabLabel}</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="py-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"}
                ${error ? "border-destructive/50 bg-destructive/5" : ""}
                ${file && !error ? "border-green-500/50 bg-green-500/5" : ""}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("excel-file-input")?.click()}
            >
              <input
                id="excel-file-input"
                type="file"
                className="sr-only"
                onChange={handleFileInputChange}
                accept=".xlsx,.xls,.csv,.ods"
              />

              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                {file ? (
                  <>
                    <div className="relative p-2 bg-muted rounded-full">{getFileIcon(file.name)}</div>
                    <div className="flex flex-col items-center">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile()
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-muted hover:bg-muted-foreground/10"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover arquivo</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-muted rounded-full">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">
                      {isDragging ? messages.dropzoneActiveText : messages.dropzoneText}
                    </p>
                    <p className="text-xs text-muted-foreground">Formatos aceitos: XLSX, XLS, CSV, ODS</p>
                    <p className="text-xs text-muted-foreground">Tamanho máximo: {maxSizeInMB} MB</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {file && !error && (
              <div className="flex items-center mt-2 text-green-500 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>{messages.successMessage}</span>
              </div>
            )}

            {templates.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Baixe o modelo de planilha para Importar:
                </p>
                <div className="flex flex-wrap gap-2">
                  {templates.slice(0, 2).map((template, index) => (
                    <Button key={index} variant="outline" size="sm" asChild className="text-xs">
                      <a href={template.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 mr-1" />
                        {template.name}
                      </a>
                    </Button>
                  ))}
                  {templates.length > 2 && (
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("templates")} className="text-xs">
                      Ver todos
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="py-4">
            {templates.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Selecione um modelo de planilha para download:</p>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.description || "-"}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <a
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Baixar ${template.name}`}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Baixar</span>
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("import")}>
                    Voltar para importação
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">{messages.noTemplatesMessage}</div>
            )}
          </TabsContent>
        </Tabs>

        {uploadSuccess && (
          <div className="mt-4 relative">
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {messages.successUploadText || "Planilha importada com sucesso!"}
              </AlertDescription>
              <button
                onClick={() => {
                  setOpen(false)
                  // Reset do estado após fechar o modal
                  setTimeout(() => {
                    setFile(null)
                    setIsUploading(false)
                    setUploadSuccess(false)
                    setError(null)
                    setActiveTab("import")
                  }, 300)
                }}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-green-100"
              >
                <X className="h-4 w-4 text-green-600" />
                <span className="sr-only">Fechar</span>
              </button>
            </Alert>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-end gap-2">
          {!uploadSuccess && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleImportConfirm} disabled={!file || isUploading || uploadSuccess || !!error}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? messages.uploadingText : messages.uploadButtonText}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
