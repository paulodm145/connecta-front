"use client";

import { useState, useEffect } from 'react';
import { DadosFormulario, DadosPergunta } from '@/components/form-builder/types';
import FormBuilder from '@/components/form-builder/FormBuilder';

import { useFormulariosHook } from "@/app/hooks/useFormulariosHook"


export default function ClienteFormPage({ slug }: { slug: string }) {
  const [formulario, setFormulario] = useState<DadosFormulario | null>(null);
  const [perguntas, setPerguntas] = useState<DadosPergunta[]>([]);
  const [loading, setLoading] = useState(true);

  const { getBySlug } = useFormulariosHook();

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

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!formulario) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen flex items-center justify-center">
        <p>Formulário não encontrado.</p>
      </div>
    );
  }

  const handleSaveForm = () => {
    console.log('Salvar formulário:', { ...formulario, perguntas });
    alert('Formulário salvo! Confira o console.');
  };

  return (
    <div className="space-y-6 p-4 bg-gray-100 min-h-screen">
      <FormBuilder
        formulario={formulario}
        setFormulario={setFormulario}
        perguntas={perguntas}
        setPerguntas={setPerguntas}
        onSaveForm={handleSaveForm}
      />
    </div>
  );
}
