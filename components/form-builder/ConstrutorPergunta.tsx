"use client"

import { FC, useState } from 'react'
import { DadosPergunta, OpcaoPergunta, TipoPergunta } from '../types'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface PropsConstrutorPergunta {
  pergunta?: Partial<DadosPergunta>
  onChange?: (updatedPergunta: DadosPergunta) => void
  onRemove?: () => void
}

const ConstrutorPergunta: FC<PropsConstrutorPergunta> = ({ pergunta = {}, onChange, onRemove }) => {
  const [dadosPergunta, setDadosPergunta] = useState<DadosPergunta>({
    id: pergunta.id || '',
    pergunta_texto: pergunta.pergunta_texto || '',
    tipo_pergunta: pergunta.tipo_pergunta || 'TEXT',
    obrigatoria: pergunta.obrigatoria || false,
    pontuacao_base: pergunta.pontuacao_base || 0,
    mascara: pergunta.mascara || '',
    opcoes: pergunta.opcoes || [],
    ordem: pergunta.ordem,
    ajuda: pergunta.ajuda || '',
    embed_youtube: pergunta.embed_youtube || '',
    mostrar_ajuda: pergunta.mostrar_ajuda || false,
    mostrar_embed_youtube: pergunta.mostrar_embed_youtube || false
  })

  const handlePerguntaChange = (campo: keyof DadosPergunta, valor: any) => {
    const atualizado: DadosPergunta = { ...dadosPergunta, [campo]: valor }
    setDadosPergunta(atualizado)
    onChange?.(atualizado)
  }

  const handleOpcaoChange = (index: number, campo: keyof OpcaoPergunta, valor: any) => {
    const opcoesAtualizadas = [...dadosPergunta.opcoes]
    opcoesAtualizadas[index] = { ...opcoesAtualizadas[index], [campo]: valor }
    handlePerguntaChange('opcoes', opcoesAtualizadas)
  }

  const adicionarOpcao = () => {
    handlePerguntaChange('opcoes', [...dadosPergunta.opcoes, { option_text: '', option_score: 0 }])
  }

  const removerOpcao = (index: number) => {
    const opcoesAtualizadas = dadosPergunta.opcoes.filter((_, i) => i !== index)
    handlePerguntaChange('opcoes', opcoesAtualizadas)
  }

  const deveMostrarOpcoes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SELECT'].includes(dadosPergunta.tipo_pergunta)

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Texto da Pergunta</label>
        <Input 
          value={dadosPergunta.pergunta_texto}
          onChange={e => handlePerguntaChange('pergunta_texto', e.target.value)}
          placeholder="Digite a pergunta"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Tipo de Pergunta</label>
        <Select
          value={dadosPergunta.tipo_pergunta}
          onValueChange={(val) => handlePerguntaChange('tipo_pergunta', val as TipoPergunta)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TEXT">Texto</SelectItem>
            <SelectItem value="TEXT_MASKED">Texto com Máscara</SelectItem>
            <SelectItem value="TEXTAREA">Texto Longo (Textarea)</SelectItem>
            <SelectItem value="TOGGLE">Alternador (Switch)</SelectItem>
            <SelectItem value="SINGLE_CHOICE">Escolha Única (Radio)</SelectItem>
            <SelectItem value="MULTIPLE_CHOICE">Múltipla Escolha (Checkbox)</SelectItem>
            <SelectItem value="SELECT">Seleção (Select)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={dadosPergunta.obrigatoria} 
          onCheckedChange={(val) => handlePerguntaChange('obrigatoria', val)}
        />
        <span>Pergunta obrigatória?</span>
      </div>

      <div>
        <label className="block font-semibold mb-1">Pontuação Base</label>
        <Input 
          type="number"
          value={dadosPergunta.pontuacao_base}
          onChange={e => handlePerguntaChange('pontuacao_base', parseInt(e.target.value, 10) || 0)}
          placeholder="Pontuação base"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          checked={!!dadosPergunta.mostrar_ajuda} 
          onCheckedChange={(val) => handlePerguntaChange('mostrar_ajuda', val)}
        />
        <span>Mostrar campo de ajuda?</span>
      </div>
      {dadosPergunta.mostrar_ajuda && (
        <div>
          <label className="block font-semibold mb-1">Ajuda</label>
          <Input
            value={dadosPergunta.ajuda || ''}
            onChange={e => handlePerguntaChange('ajuda', e.target.value)}
            placeholder="Texto de ajuda para o usuário"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch 
          checked={!!dadosPergunta.mostrar_embed_youtube} 
          onCheckedChange={(val) => handlePerguntaChange('mostrar_embed_youtube', val)}
        />
        <span>Mostrar campo de Embed do Youtube?</span>
      </div>
      {dadosPergunta.mostrar_embed_youtube && (
        <div>
          <label className="block font-semibold mb-1">Embed Youtube</label>
          <Input
            value={dadosPergunta.embed_youtube || ''}
            onChange={e => handlePerguntaChange('embed_youtube', e.target.value)}
            placeholder="URL ou código embed do Youtube"
          />
        </div>
      )}

      {dadosPergunta.tipo_pergunta === 'TEXT_MASKED' && (
        <div>
          <label className="block font-semibold mb-1">Máscara</label>
          <Input
            value={dadosPergunta.mascara || ''}
            onChange={e => handlePerguntaChange('mascara', e.target.value)}
            placeholder="Ex: (99) 99999-9999"
          />
        </div>
      )}

      {deveMostrarOpcoes && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold">Opções</label>
            <Button size="sm" onClick={adicionarOpcao}>+ Adicionar Opção</Button>
          </div>
          {dadosPergunta.opcoes.map((opt, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <Input 
                value={opt.option_text}
                onChange={e => handleOpcaoChange(index, 'option_text', e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />
              <Input 
                type="number"
                value={opt.option_score}
                onChange={e => handleOpcaoChange(index, 'option_score', parseInt(e.target.value, 10) || 0)}
                placeholder="Pontuação"
                className="w-20"
              />
              <Button variant="destructive" size="sm" onClick={() => removerOpcao(index)}>Remover</Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex space-x-2 pt-4 border-t mt-4">
        {onRemove && (
          <Button variant="destructive" onClick={onRemove}>Remover Pergunta</Button>
        )}
      </div>
    </div>
  )
}

export default ConstrutorPergunta
