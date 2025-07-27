"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { AccessLevelForm } from "./access-level-form"
import { toast } from "react-toastify";

import { useNiveisPermissoesHook } from "@/app/hooks/useNiveisPermissoesHook"


interface AccessLevel {
  id: number
  descricao: string
  status: boolean
  permissoes: string[]
  created_at: string
}

interface Permission {
  nome: string
  chave: string
}

interface PermissionGroup {
  menu: string
  nome: string
  permissoes: Permission[]
}

export default function AccessLevelsPage() {
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([])
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLevel, setEditingLevel] = useState<AccessLevel | null>(null)
  const [loading, setLoading] = useState(true)

  const { indexNiveis, treeViewPermissoes, updateNiveis, storeNiveis, changeStatus, destroyNivel } = useNiveisPermissoesHook()

  useEffect(() => {

    const fetchData = async () => {
        try {
            const niveis = await indexNiveis()
            const permissoes = await treeViewPermissoes()
    
            if (niveis && permissoes) {
            setAccessLevels(niveis)
            setPermissionGroups(permissoes)
            } else {
            throw new Error("Erro ao carregar dados")
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  }, [])

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      // Simular chamada para API
      await changeStatus(id)

      setAccessLevels((prev) => prev.map((level) => (level.id === id ? { ...level, status: !currentStatus } : level)))

      toast.success('Status atualizado com sucesso.')

    } catch (error) {
      toast.error('Erro ao atualizar status.')
    }
  }

    const handleSave = async (data: { descricao: string; status: boolean; permissoes: string[] }) => {
        try {
            if (editingLevel) {
                // Atualizar nível existente
                const updated = await updateNiveis(editingLevel.id, data)

                setAccessLevels((prev) =>
                    prev.map((level) => (level.id === editingLevel.id ? { ...level, ...updated } : level))
                )

                toast.success("Nível atualizado com sucesso.")
            } else {
                // Criar novo nível
                const novo = await storeNiveis(data)

                setAccessLevels((prev) => [...prev, novo])
                toast.success("Nível criado com sucesso.")
            }

            setIsFormOpen(false)
            setEditingLevel(null)
        } catch (error) {
            console.error("Erro ao salvar nível de acesso:", error)
            toast.error("Erro ao salvar nível de acesso.")
        }
    }

  const handleDelete = async (id: number) => {
    try {
      // Simular chamada para API
      await destroyNivel(id)

      setAccessLevels((prev) => prev.filter((level) => level.id !== id))
      toast.success('Nível de acesso excluído com sucesso.')
    } catch (error) {
        toast.error('Erro ao excluir nível de acesso.')
    }
  }

  const handleEdit = (level: AccessLevel) => {
    setEditingLevel(level)
    setIsFormOpen(true)
  }

  const handleNew = () => {
    setEditingLevel(null)
    setIsFormOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
      <Card>
        <CardHeader>
          <CardTitle>Níveis Cadastrados</CardTitle>
          <CardDescription>Lista de todos os níveis de acesso do sistema</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-end mb-4">
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Nível
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLevel ? "Editar Nível de Acesso" : "Novo Nível de Acesso"}</DialogTitle>
              <DialogDescription>
                {editingLevel
                  ? "Edite as informações do nível de acesso"
                  : "Crie um novo nível de acesso definindo as permissões"}
              </DialogDescription>
            </DialogHeader>
            <AccessLevelForm
              permissionGroups={permissionGroups}
              initialData={editingLevel}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingLevel(null)
              }}
            />
          </DialogContent>
        </Dialog>

      </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessLevels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className="font-medium">{level.descricao}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={level.status}
                        onCheckedChange={() => handleToggleStatus(level.id, level.status)}
                      />
                      <Badge variant={level.status ? "default" : "secondary"}>
                        {level.status ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{level.permissoes.length} permissões</Badge>
                  </TableCell>
                  <TableCell>{level.created_at ? new Date(level.created_at).toLocaleDateString("pt-BR") : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(level)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o nível "{level.descricao}"? Esta ação não pode ser
                              desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(level.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    
  )
}
