// src/components/types.ts
export type TipoPergunta = 
  | 'TEXT'
  | 'TEXT_MASKED'
  | 'TEXTAREA'
  | 'TOGGLE'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'SELECT'

export interface OpcaoPergunta {
  texto_opcao: string
  pontuacao_opcao: number
  order?: number
}

export interface DadosPergunta {
  id: string
  pergunta_texto: string
  tipo_pergunta: TipoPergunta
  obrigatoria: boolean
  pontuacao_base: number
  mascara?: string
  opcoes: OpcaoPergunta[]
  ordem?: number
  ajuda?: string
  embed_youtube?: string
  mostrar_ajuda?: boolean
  mostrar_embed_youtube?: boolean
}

export interface DadosFormulario {
  titulo: string
  descricao: string
  slug: string
  status: 'RASCUNHO' | 'PUBLICADO'
  ajuda?: string
  embed_youtube?: string
  mostrar_ajuda?: boolean
  mostrar_embed_youtube?: boolean
  perguntas: DadosPergunta[]
}
