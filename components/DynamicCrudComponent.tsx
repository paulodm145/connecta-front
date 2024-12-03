import React, { useState, useEffect } from 'react';
import { useForm, FieldValues, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  type: 'text' | 'textarea' | 'select' | 'toggle';
  required?: boolean;
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

interface DataField {
  name: string; // Nome do campo no objeto de dados
  label: string; // Rótulo exibido no cabeçalho da tabela
  render?: (value: any, item: DataItem) => React.ReactNode; // Função para renderização customizada
}

const DynamicCrudComponent: React.FC<DynamicCrudComponentProps> = ({ fields, fetchData, saveData, deleteData, toggleStatus }) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [lookupData, setLookupData] = useState<Record<string, FieldOption[]>>({});

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm();

  // Carrega os dados iniciais e as opções de lookup
  useEffect(() => {
    const carregarDados = async () => {
        const fetchedData = await fetchData();
        setData(fetchedData);

        fields.forEach(async (field) => {
            if (field.lookup && field.fetchOptions) {
                const options = await field.fetchOptions();
                setLookupData((prev) => ({ ...prev, [field.name]: options }));
            }
        });
    };

    carregarDados();
}, [fields, fetchData]);

  const handleOpenModal = (item?: DataItem) => {
    if (item) {
      reset(item);
      setIsEditing(true);
      setCurrentId(item.id);
    } else {
      reset();
      setIsEditing(false);
      setCurrentId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset();
    setIsEditing(false);
    setCurrentId(null);
  };

  const onSubmit = async (formData: FieldValues) => {
    const response = await saveData(currentId, formData);
    if (response.success) {
        const updatedData = await fetchData();
        setData(updatedData); // Atualizar os dados no grid
        handleCloseModal();
    } else {
        alert('Erro ao salvar os dados');
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
                  />
                ) : field.type === 'select' ? (
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: selectField }) => (
                      <Select
                        value={selectField.value || ""}
                        onValueChange={(value) => {
                          selectField.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {lookupData[field.name]?.map((option) => (
                            <SelectItem key={option.value} value={(option.value).toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    {...register(field.name, {
                      required: field.required ? 'Este campo é obrigatório' : false,
                    })}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-red-500 text-xs">{errors[field.name].message}</p>
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

      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableCell key={field.name}>{field.label}</TableCell>
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
                <Button onClick={() => handleOpenModal(item)}>Editar</Button>
                <Button onClick={() => deleteData(item.id)} variant="danger">Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DynamicCrudComponent;
