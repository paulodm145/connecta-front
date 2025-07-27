"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Permission {
  nome: string
  chave: string
}

interface PermissionGroup {
  menu: string
  nome: string
  permissoes: Permission[]
}

interface AccessLevel {
  id: number
  descricao: string
  status: boolean
  permissoes: string[]
  created_at: string
}

interface AccessLevelFormProps {
  permissionGroups: PermissionGroup[]
  initialData?: AccessLevel | null
  onSave: (data: { descricao: string; status: boolean; permissoes: string[] }) => Promise<void>
  onCancel: () => void
}

export function AccessLevelForm({ permissionGroups, initialData, onSave, onCancel }: AccessLevelFormProps) {
  const [descricao, setDescricao] = useState("")
  const [status, setStatus] = useState(true)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setDescricao(initialData.descricao)
      setStatus(initialData.status)
      setSelectedPermissions(initialData.permissoes)
    } else {
      setDescricao("")
      setStatus(true)
      setSelectedPermissions([])
    }
  }, [initialData])

  const handlePermissionChange = (permissionKey: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionKey])
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => p !== permissionKey))
    }
  }

  const handleGroupPermissionChange = (group: PermissionGroup, checked: boolean) => {
    const groupPermissions = group.permissoes.map((p) => p.chave)

    if (checked) {
      setSelectedPermissions((prev) => {
        const newPermissions = [...prev]
        groupPermissions.forEach((permission) => {
          if (!newPermissions.includes(permission)) {
            newPermissions.push(permission)
          }
        })
        return newPermissions
      })
    } else {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPermissions.includes(p)))
    }
  }

  const isGroupFullySelected = (group: PermissionGroup) => {
    return group.permissoes.every((p) => selectedPermissions.includes(p.chave))
  }

  const isGroupPartiallySelected = (group: PermissionGroup) => {
    return group.permissoes.some((p) => selectedPermissions.includes(p.chave)) && !isGroupFullySelected(group)
  }

  const getSelectedPermissionsInGroup = (group: PermissionGroup) => {
    return group.permissoes.filter((p) => selectedPermissions.includes(p.chave)).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!descricao.trim()) {
      return
    }

    setLoading(true)
    try {
      await onSave({
        descricao: descricao.trim(),
        status,
        permissoes: selectedPermissions,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao">Nome do Nível</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Administrador Geral"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="status" checked={status} onCheckedChange={setStatus} />
            <Label htmlFor="status">Nível ativo</Label>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Resumo das Permissões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold text-primary">{selectedPermissions.length}</div>
            <p className="text-sm text-muted-foreground">permissões selecionadas</p>
            {selectedPermissions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {permissionGroups.map((group) => {
                  const count = getSelectedPermissionsInGroup(group)
                  if (count === 0) return null
                  return (
                    <Badge key={group.nome} variant="secondary" className="text-xs">
                      {group.menu}: {count}
                    </Badge>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Permissões</h3>
          <p className="text-sm text-muted-foreground">Selecione as permissões que este nível de acesso deve ter</p>
        </div>

        <Accordion type="multiple" className="w-full">
          {permissionGroups.map((group) => (
            <AccordionItem key={group.nome} value={group.nome}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isGroupFullySelected(group)}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isGroupPartiallySelected(group)
                        }
                      }}
                      onCheckedChange={(checked) => handleGroupPermissionChange(group, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-medium">{group.menu}</span>
                  </div>
                  <Badge variant="outline" className="ml-auto mr-2">
                    {getSelectedPermissionsInGroup(group)}/{group.permissoes.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 space-y-3">
                  {group.permissoes.map((permission) => (
                    <div key={permission.chave} className="flex items-center space-x-3">
                      <Checkbox
                        id={permission.chave}
                        checked={selectedPermissions.includes(permission.chave)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.chave, checked as boolean)}
                      />
                      <Label htmlFor={permission.chave} className="text-sm font-normal cursor-pointer flex-1">
                        {permission.nome}
                      </Label>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {permission.chave}
                      </code>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Separator />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !descricao.trim()}>
          {loading ? "Salvando..." : initialData ? "Atualizar" : "Criar Nível"}
        </Button>
      </div>
    </form>
  )
}
