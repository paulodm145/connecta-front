"use client"

import { useState, useEffect } from 'react';
import { DadosFormulario, DadosPergunta } from '@/components/form-builder/types'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import ConstrutorPergunta from '@/components/form-builder/ConstrutorPergunta'
import FormBuilder from '@/components/form-builder/FormBuilder'
import FormPreview from '@/components/form-builder/FormPreview'
import { useFormulariosHook } from "@/app/hooks/useFormulariosHook"
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'; // Use o roteamento moderno do Next.js

 

export default function ClienteFormPage({ slug }: { slug: string }) {
  const router = useRouter()
  const [perguntas, setPerguntas] = useState<DadosPergunta[]>([])
  const [mostrarModalAdd, setMostrarModalAdd] = useState(false)
  const [mostrarFormPreview, setMostrarFormPreview] = useState(false)
  const [loading, setLoading] = useState(true);

  const { getBySlug, editarFormulario } = useFormulariosHook();

  useEffect(() => {
    const fetchFormulario = async () => {
      try {
        const data = await getBySlug(slug);
        setFormulario(data);
        setPerguntas(data.perguntas || []);
      } catch (error) {
        console.error('Erro ao carregar o formulário:', error);
        setFormulario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFormulario();
  }, [slug]);

  const [formulario, setFormulario] = useState<DadosFormulario>({
    titulo: 'Meu Formulário',
    descricao: 'Descrição do meu formulário',
    slug: 'meu-formulario',
    status: 'RASCUNHO',
    
    ajuda: '',
    embed_youtube: '',
    mostrar_ajuda: false,
    mostrar_embed_youtube: false,
    perguntas: []
  })

  const [perguntaAtual, setPerguntaAtual] = useState<Partial<DadosPergunta>>({})
  const [respostas, setRespostas] = useState<{ [perguntaId: string]: any }>({})
  const [mostrarModalVideo, setMostrarModalVideo] = useState(false)
  const [videoEmbedAtual, setVideoEmbedAtual] = useState<string>('')

  const abrirModalAdd = () => {
    setPerguntaAtual({
      pergunta_texto: '',
      tipo_pergunta: 'TEXT',
      obrigatoria: false,
      pontuacao_base: 0,
      opcoes: [],
      ordem: perguntas.length + 1,
      ajuda: '',
      embed_youtube: '',
      mostrar_ajuda: false,
      mostrar_embed_youtube: false
    })
    setMostrarModalAdd(true)
  }

  const handleAdicionarPergunta = () => {
    if (perguntaAtual && perguntaAtual.pergunta_texto) {
      const perguntaCompleta: DadosPergunta = {
        id: crypto.randomUUID(),
        pergunta_texto: perguntaAtual.pergunta_texto || '',
        tipo_pergunta: perguntaAtual.tipo_pergunta || 'TEXT',
        obrigatoria: perguntaAtual.obrigatoria || false,
        pontuacao_base: perguntaAtual.pontuacao_base || 0,
        mascara: perguntaAtual.mascara,
        opcoes: perguntaAtual.opcoes || [],
        ordem: perguntaAtual.ordem ?? (perguntas.length + 1),
        ajuda: perguntaAtual.ajuda || '',
        embed_youtube: perguntaAtual.embed_youtube || '',
        mostrar_ajuda: perguntaAtual.mostrar_ajuda || false,
        mostrar_embed_youtube: perguntaAtual.mostrar_embed_youtube || false
      }
      setPerguntas((prev) => [...prev, perguntaCompleta])
      setMostrarModalAdd(false)
    }
  }



  const enviarFormulario = async () => {
    const perguntasFinais = perguntas.map((p, i) => ({ ...p, ordem: i + 1 }));

    const formFinal = {
      ...formulario,
      perguntas: perguntasFinais,
    };

    try {
      const sendForm = await editarFormulario(formFinal.id, formFinal);
      toast.success('Formulário enviado com sucesso!');
      router.push(`/formularios/editar/${sendForm.data.formulario.slug}`); // Redireciona após sucesso
    } catch (error) {
      console.error('Erro ao enviar o formulário:', error);
      toast.error('Erro ao enviar o formulário. Tente novamente.');
    }
  };

  const handlePreviewAnswerChange = (perguntaId: string, value: any) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: value }))
  }

  const abrirModalVideoEmbed = (embedCode: string) => {
    setVideoEmbedAtual(embedCode)
    setMostrarModalVideo(true)
  }

  return (
    <div className="space-y-6 p-4 bg-gray-100 min-h-screen">

      <Button variant="secondary" onClick={() => router.back()}>Voltar</Button>
      
      <FormBuilder
        formulario={formulario}
        setFormulario={setFormulario}
        perguntas={perguntas}
        setPerguntas={setPerguntas}
        onOpenPreview={() => setMostrarFormPreview(true)}
        onSaveForm={enviarFormulario}
        onAddPergunta={abrirModalAdd}
      />

      {/* Modal para Adicionar Nova Pergunta */}
      <Dialog open={mostrarModalAdd} onOpenChange={setMostrarModalAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
            <DialogDescription>
              Configure a pergunta e depois clique em "Adicionar".
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ConstrutorPergunta
              pergunta={perguntaAtual}
              onChange={(atualizada) => setPerguntaAtual(atualizada)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleAdicionarPergunta}>Adicionar</Button>
            <Button variant="secondary" onClick={() => setMostrarModalAdd(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Preview do Formulário Completo */}
      <Dialog open={mostrarFormPreview} onOpenChange={setMostrarFormPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Formulário</DialogTitle>
            <DialogDescription>
              Veja abaixo como o formulário será exibido para o usuário. É possível interagir com os campos.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {perguntas.length === 0 ? (
              <p>Nenhuma pergunta adicionada ainda.</p>
            ) : (
              <div className="border rounded p-4 bg-white">
                <FormPreview
                  formulario={formulario}
                  perguntas={perguntas}
                  respostas={respostas}
                  onChangeResposta={handlePreviewAnswerChange}
                  onOpenVideo={abrirModalVideoEmbed}
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setMostrarFormPreview(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Exibir Vídeo do Formulário ou da Pergunta */}
      <Dialog open={mostrarModalVideo} onOpenChange={setMostrarModalVideo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajuda em Vídeo</DialogTitle>
            <DialogDescription>
              Veja o vídeo de ajuda abaixo:
            </DialogDescription>
            
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {videoEmbedAtual ? (
              <div dangerouslySetInnerHTML={{__html: videoEmbedAtual}}></div>
            ) : (
              <p>Nenhum vídeo disponível.</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setMostrarModalVideo(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
