"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import InputMask from "react-input-mask";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@radix-ui/react-switch";
import { useFormulariosHook } from "@/app/hooks/useFormulariosHook";

// Tipos para o formulário e perguntas
type Formulario = {
  id: number;
  titulo: string;
  descricao: string;
  embed_youtube?: string;
  mostrar_embed_youtube?: boolean;
  ajuda?: string;
  mostrar_ajuda?: boolean;
  perguntas: Pergunta[];
};

type Pergunta = {
  id: number;
  pergunta_texto: string;
  tipo_pergunta: "TEXT" | "TEXT_MASKED" | "TEXTAREA" | "TOGGLE" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SELECT";
  obrigatoria: boolean;
  mascara?: string;
  opcoes: Opcao[];
  embed_youtube?: string;
  mostrar_embed_youtube?: boolean;
  ajuda?: string;
  mostrar_ajuda?: boolean;
};

type Opcao = {
  id: number;
  texto_opcao: string;
};

export default function FormularioCompletoPage() {
  const [enviado, setEnviado] = useState(false);
  const [videoHtml, setVideoHtml] = useState<string | null>(null);
  const [textoAjuda, setTextoAjuda] = useState<string | null>(null);
  const [openDialogVideo, setOpenDialogVideo] = useState(false);
  const [openDialogAjuda, setOpenDialogAjuda] = useState(false);
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const respondente = searchParams.get("t");

  const { getBySlug } = useFormulariosHook();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!slug) return;

    const fetchFormulario = async () => {
      try {
        setLoading(true);
        const data = await getBySlug(slug);
        setFormulario(data);
      } catch (error) {
        console.error("Erro ao carregar o formulário:", error);
        setFormulario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFormulario();
  }, [slug]);

  const onSubmit = (data: any) => {
    console.log("Respostas brutas:", data);

    const payload = {
      formulario_id: formulario?.id,
      envio_id: Date.now(),
      respostas: formulario?.perguntas.map((pergunta) => {
        const valor = data[pergunta.id.toString()];
        let resposta_texto: string | null = null;
        let opcoesSelecionadas: number[] = [];

        switch (pergunta.tipo_pergunta) {
          case "TEXT":
          case "TEXT_MASKED":
          case "TEXTAREA":
            resposta_texto = valor ? String(valor) : null;
            break;
          case "TOGGLE":
            resposta_texto = valor ? "Sim" : "Não";
            break;
          case "SINGLE_CHOICE":
          case "SELECT":
            const opcao = pergunta.opcoes.find((op) => op.texto_opcao === valor);
            if (opcao) opcoesSelecionadas = [opcao.id];
            resposta_texto = opcao ? opcao.texto_opcao : null;
            break;
          case "MULTIPLE_CHOICE":
            if (Array.isArray(valor)) {
              opcoesSelecionadas = valor
                .map((texto: string) => {
                  const op = pergunta.opcoes.find((o) => o.texto_opcao === texto);
                  return op ? op.id : null;
                })
                .filter((x) => x !== null) as number[];
              resposta_texto = opcoesSelecionadas.map((opId) => {
                const op = pergunta.opcoes.find((o) => o.id === opId);
                return op ? op.texto_opcao : null;
              }).join(", ");
            }
            break;
        }

        return {
          pergunta_id: pergunta.id,
          tipo_pergunta: pergunta.tipo_pergunta,
          resposta_texto,
          opcoes: opcoesSelecionadas,
        };
      }),
    };

    console.log("Payload final:", payload);
    setEnviado(true);
  };

  const handleOpenVideo = (html: string) => {
    setVideoHtml(html);
    setOpenDialogVideo(true);
  };

  const handleOpenAjuda = (texto: string) => {
    setTextoAjuda(texto);
    setOpenDialogAjuda(true);
  };

  if (loading) return <p className="text-center text-gray-700 mt-10">Carregando formulário...</p>;
  if (!formulario) return <p className="text-center text-red-500 mt-10">Erro ao carregar formulário.</p>;

  return (
    <>
      {/* Modal para Vídeo do YouTube */}
      <Dialog open={openDialogVideo} onOpenChange={setOpenDialogVideo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vídeo de Ajuda</DialogTitle>
            <DialogDescription>Aperte play para assistir.</DialogDescription>
          </DialogHeader>
          {videoHtml && <div className="mt-4 w-full" dangerouslySetInnerHTML={{ __html: videoHtml }} />}
          <DialogFooter>
            <Button onClick={() => setOpenDialogVideo(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Texto de Ajuda */}
      <Dialog open={openDialogAjuda} onOpenChange={setOpenDialogAjuda}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Texto de Ajuda</DialogTitle>
          </DialogHeader>
          {textoAjuda && <p className="mt-4 text-gray-700">{textoAjuda}</p>}
          <DialogFooter>
            <Button onClick={() => setOpenDialogAjuda(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className=" w-full flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow w-[30%]">
          <h1 className="text-xl font-bold mb-2">{formulario.titulo}</h1>
          <p className="text-gray-700 mb-4">{formulario.descricao}</p>

          {/* Botões de ajuda e vídeo do formulário */}
          <div className="flex gap-2 mb-4">
            {formulario.mostrar_embed_youtube && formulario.embed_youtube && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenVideo(formulario.embed_youtube!)}
              >
                ▶ Assistir Vídeo do Formulário
              </Button>
            )}
            {formulario.mostrar_ajuda && formulario.ajuda && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAjuda(formulario.ajuda!)}
              >
                ℹ️ Ajuda do Formulário
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {formulario.perguntas.map((pergunta) => (
              <div key={pergunta.id} className="border p-4 rounded bg-white/70">
                <label className="block font-semibold mb-2">
                  {pergunta.pergunta_texto} {pergunta.obrigatoria && <span className="text-red-600">*</span>}
                </label>

                {/* Botões de ajuda e vídeo da pergunta */}
                <div className="flex gap-2 mb-2">
                  {pergunta.mostrar_embed_youtube && pergunta.embed_youtube && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenVideo(pergunta.embed_youtube!)}
                    >
                      ▶ Ver Vídeo da Pergunta
                    </Button>
                  )}
                  {pergunta.mostrar_ajuda && pergunta.ajuda && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenAjuda(pergunta.ajuda!)}
                    >
                      ℹ️ Ajuda da Pergunta
                    </Button>
                  )}
                </div>

                {renderizarPerguntaHookForm(pergunta, register, control, errors)}
                {errors[pergunta.id.toString()] && <p className="text-red-500 text-sm">Campo obrigatório.</p>}
              </div>
            ))}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

function renderizarPerguntaHookForm(
  pergunta: Pergunta,
  register: any,
  control: any,
  errors: any
) {
  const fieldName = pergunta.id.toString();
  const isRequired = pergunta.obrigatoria;

  switch (pergunta.tipo_pergunta) {
    case "TEXT":
      return (
        <input
          type="text"
          {...register(fieldName, { required: isRequired })}
          className="border rounded p-2 w-full"
        />
      );
    case "TEXT_MASKED":
      return (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: isRequired }}
          render={({ field }) => (
            <InputMask
              mask={pergunta.mascara || "(99) 99999-9999"}
              {...field}
              className="border rounded p-2 w-full"
            />
          )}
        />
      );
    case "TEXTAREA":
      return (
        <textarea
          {...register(fieldName, { required: isRequired })}
          className="border rounded p-2 w-full"
        />
      );
    case "TOGGLE":
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                field.value ? "bg-teal-500" : "bg-gray-300"
              }`}
            >
              <span className="sr-only">Toggle</span>
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                  field.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </Switch>
          )}
        />
      );
    case "SINGLE_CHOICE":
      return pergunta.opcoes.map((op) => (
        <div key={op.id}>
          <input
            type="radio"
            {...register(fieldName, { required: isRequired })}
            value={op.texto_opcao}
          />{" "}
          {op.texto_opcao}
        </div>
      ));
    case "MULTIPLE_CHOICE":
      return pergunta.opcoes.map((op) => (
        <div key={op.id}>
          <input
            type="checkbox"
            {...register(fieldName, { required: isRequired })}
            value={op.texto_opcao}
          />{" "}
          {op.texto_opcao}
        </div>
      ));
    case "SELECT":
      return (
        <select
          {...register(fieldName, { required: isRequired })}
          className="border rounded p-2 w-full"
        >
          <option value="">Selecione uma opção</option>
          {pergunta.opcoes.map((op) => (
            <option key={op.id} value={op.texto_opcao}>
              {op.texto_opcao}
            </option>
          ))}
        </select>
      );
    default:
      return null;
  }
}