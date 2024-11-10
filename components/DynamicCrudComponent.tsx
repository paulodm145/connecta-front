import React, { useState, useEffect } from 'react';
import { useForm, FieldValues, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableRow, TableCell, TableHeader, TableBody } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FieldOption {
  value: string;
  label: string;
}

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'toggle';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  options?: FieldOption[];
  lookup?: boolean;
  fetchOptions?: () => Promise<FieldOption[]>;
}

interface DataItem {
  id: number;
  [key: string]: any;
  active: boolean;
}

interface DynamicCrudComponentProps {
  fields: Field[];
  fetchData: () => Promise<DataItem[]>;
  saveData: (id: number | null, data: FieldValues) => Promise<{ success: boolean, id?: number }>;
  deleteData: (id: number) => Promise<{ success: boolean }>;
  toggleStatus: (id: number, isActive: boolean) => Promise<{ success: boolean }>;
}

const DynamicCrudComponent: React.FC<DynamicCrudComponentProps> = ({ fields, fetchData, saveData, deleteData, toggleStatus }) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [lookupData, setLookupData] = useState<Record<string, FieldOption[]>>({});

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    // Carrega os dados na primeira vez que o componente é montado
    fetchData().then(setData);
  }, []);

  const handleOpenModal = (item?: DataItem) => {
    if (item) {
      reset(item);  // Carrega os dados do item para edição
      setIsEditing(true);
      setCurrentId(item.id);
    } else {
      reset();  // Limpa o formulário para um novo registro
      setIsEditing(false);
      setCurrentId(null);
    }
    setIsModalOpen(true);  // Abre o modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);  // Fecha o modal
    reset();  // Limpa o formulário
    setIsEditing(false);
    setCurrentId(null);
  };

  const onSubmit = async (formData: FieldValues) => {
    const response = await saveData(currentId, formData);
    if (response.success) {
      // Atualiza diretamente a lista de dados sem depender de outro `useEffect`
      fetchData().then(setData); 
      handleCloseModal();
    } else {
      alert('Erro ao salvar os dados');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      const response = await deleteData(id);
      if (response.success) {
        // Atualiza os dados imediatamente após a exclusão
        fetchData().then(setData);
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const response = await toggleStatus(id, !currentStatus);
    if (response.success) {
      setData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, active: !currentStatus } : item
        )
      );
    } else {
      alert('Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => handleOpenModal()} variant="outline">Novo Cadastro</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="block text-sm font-medium">{field.label}</label>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    {...register(field.name, {
                      required: field.required ? 'Este campo é obrigatório' : false,
                    })}
                    className="mt-1 block w-full"
                  />
                ) : field.type === 'select' ? (
                  <Controller
                    name={field.name}
                    control={control}
                    rules={{ required: field.required ? 'Este campo é obrigatório' : false }}
                    render={({ field: selectField }) => (
                      <Select onValueChange={selectField.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupData[field.name]?.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.type === 'radio' ? (
                  <RadioGroup {...register(field.name, { required: field.required })} className="space-y-2">
                    {field.options?.map(option => (
                      <div key={option.value}>
                        <input
                          type="radio"
                          value={option.value}
                          {...register(field.name)}
                        />
                        <label>{option.label}</label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : field.type === 'checkbox' ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        label={field.label}
                      />
                    )}
                  />
                ) : field.type === 'toggle' ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    )}
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    {...register(field.name, {
                      required: field.required ? 'Este campo é obrigatório' : false,
                    })}
                    className="mt-1 block w-full"
                  />
                )}

                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[field.name].message}
                  </p>
                )}
              </div>
            ))}
            <DialogFooter className="mt-4 space-x-2">
              <Button type="submit">{isEditing ? 'Atualizar' : 'Salvar'}</Button>
              <Button onClick={handleCloseModal} variant="secondary">Cancelar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Table className="mt-4 w-full">
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableCell key={field.name} className="text-left font-semibold">{field.label}</TableCell>
            ))}
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {fields.map((field) => (
                <TableCell key={field.name}>{item[field.name]}</TableCell>
              ))}
              <TableCell>
                <Switch
                  checked={item.active}
                  onCheckedChange={() => handleToggleStatus(item.id, item.active)}
                />
              </TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(item)} variant="secondary">Editar</Button>
                <Button onClick={() => handleDelete(item.id)} className="ml-2" variant="danger">Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DynamicCrudComponent;
