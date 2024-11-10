"use client";

import { useState } from 'react';
import DynamicCrudComponent from '@/components/DynamicCrudComponent';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Pessoas() {
  const [data, setData] = useState([
    { id: 1, name: 'João Silva', description: 'Usuário regular', gender: 'M', newsletter: true, notification: false, role: 'user', active: true },
    { id: 2, name: 'Maria Oliveira', description: 'Administradora', gender: 'F', newsletter: false, notification: true, role: 'admin', active: true },
    { id: 3, name: 'Carlos Souza', description: 'Convidado', gender: 'M', newsletter: true, notification: false, role: 'guest', active: false },
  ]);

  const fields = [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', required: true, minLength: 10, maxLength: 200 },
    { name: 'gender', label: 'Gênero', type: 'radio', options: [{ label: 'Masculino', value: 'M' }, { label: 'Feminino', value: 'F' }], required: true },
    { name: 'newsletter', label: 'Assinar Newsletter', type: 'checkbox' },
    { name: 'notification', label: 'Notificações', type: 'toggle' },
    { name: 'role', label: 'Função', type: 'select', lookup: true, fetchOptions: async () => [
      { value: 'admin', label: 'Administrador' },
      { value: 'user', label: 'Usuário' },
      { value: 'guest', label: 'Convidado' }
    ]}
  ];

  const fetchData = async () => data;

  const saveData = async (id, formData) => {
    if (id) {
      // Atualizar registro existente
      setData(prevData => prevData.map(item => item.id === id ? { id, ...formData } : item));
      console.log('Atualizando registro:', id, formData);
    } else {
      // Adicionar novo registro com um novo ID
      const newId = data.length ? Math.max(...data.map(item => item.id)) + 1 : 1;
      setData(prevData => [...prevData, { id: newId, ...formData, active: true }]);
      console.log('Criando novo registro:', formData);
    }
    return { success: true };
  };

  const deleteData = async (id) => {
    setData(prevData => prevData.filter(item => item.id !== id));
    console.log('Excluindo registro com id:', id);
    return { success: true };
  };

  const toggleStatus = async (id, isActive) => {
    setData(prevData =>
      prevData.map(item => item.id === id ? { ...item, active: !isActive } : item)
    );
    console.log(`Alterando status do registro com id ${id} para ${isActive ? 'Inativo' : 'Ativo'}`);
    return { success: true };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Pessoas</CardTitle>
        <CardDescription>Gerenciamento de pessoas ... adicionar explicação depois</CardDescription>
      </CardHeader>

      <CardContent>
        <DynamicCrudComponent
          fields={fields}
          fetchData={fetchData}
          saveData={saveData}
          deleteData={deleteData}
          toggleStatus={toggleStatus}
        />
      </CardContent>
    </Card>
  );
}
