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
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import InputMask from 'react-input-mask';

import { useInformacoesUsuarioHook } from '@/app/hooks/useInformacosUsuarioHook';

interface FieldOption {
  value: string;
  label: string;
}

type FieldType = 'text' | 'email' | 'mask' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'toggle';

interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  lookup?: boolean;
  fetchOptions?: () => Promise<FieldOption[]>;
  minLength?: number;
  maxLength?: number;
  toggleStatus: (id: number, isActive: boolean) => Promise<{ success: boolean }>;
  maskPattern?: string;
}

interface DataItem {
  id: number;
  [key: string]: any;
  active: boolean;
}

interface DataField {
  label: string;
  dataField: string;
  render?: (value: any, item: DataItem) => React.ReactNode;
}

interface Permissoes {
  podeCadastrar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
  podeVisualizar: boolean;
}

interface DynamicCrudComponentProps {
  fields: Field[];
  columns: DataField[];
  fetchData: () => Promise<DataItem[]>;
  saveData: (id: number | null, data: FieldValues) => Promise<{ success: boolean; id?: number }>;
  deleteData: (id: number) => Promise<{ success: boolean }>;
  toggleStatus: (id: number, isActive: boolean) => Promise<{ success: boolean }>;
  permissoes: Permissoes;
}

const DynamicCrudComponent: React.FC<DynamicCrudComponentProps> = ({
  fields,
  columns,
  fetchData,
  saveData,
  deleteData,
  toggleStatus,
  permissoes,
}) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [lookupData, setLookupData] = useState<Record<string, FieldOption[]>>({});
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { isSuperAdmin } = useInformacoesUsuarioHook();

  const podeCadastrar = isSuperAdmin || permissoes.podeCadastrar;
  const podeEditar = isSuperAdmin || permissoes.podeEditar;
  const podeExcluir = isSuperAdmin || permissoes.podeExcluir;
  const podeVisualizar = isSuperAdmin || permissoes.podeVisualizar;


  const filteredData = data.filter((item) =>
    columns.some((column) =>
      String(item[column.dataField] || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    )
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm();

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
      reset({});
      setIsEditing(false);
      setCurrentId(null);
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: FieldValues) => {
    const response = await saveData(currentId, formData);
    if (response.success) {
      const updatedData = await fetchData();
      setData(updatedData);
      handleCloseModal();
    } else {
      alert("Erro ao salvar os dados");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const response = await toggleStatus(id, !currentStatus);
    if (response.success) {
      setData(prevData => 
        prevData.map(item => 
          item.id === id ? { ...item, status: !currentStatus } : item
        )
      );
    } else {
      alert('Erro ao alterar status');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset({});
    setIsEditing(false);
    setCurrentId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

          {podeCadastrar && (
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()} variant="outline">
                Novo Cadastro
              </Button>
            </DialogTrigger>
          )}


          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Registro" : "Novo Registro"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium">{field.label}</label>
                  {field.type === "text" ? (
                    <Input {...register(field.name, {
                      required: field.required ? 'Este campo é obrigatório' : false,
                    })} />
                  ) : field.type === "email" ? (
                    <Input type="email" {...register(field.name, {
                      required: field.required ? 'Este campo é obrigatório' : false,
                    })} />
                  ) : field.type === "mask" ? (
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: innerField }) => (
                        <InputMask
                          mask={field.maskPattern || ""}
                          value={innerField.value || ""}
                          onChange={(e) => innerField.onChange(e.target.value)}
                          onBlur={innerField.onBlur}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          )}
                        </InputMask>
                      )}
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea {...register(field.name, {
                      required: field.required ? 'Este campo é obrigatório' : false,
                    })} />
                  ) : field.type === "select" ? (
                    <Controller
                      name={field.name}
                      control={control}
                      render={({ field: selectField }) => (
                        <Select
                          value={(selectField.value)?.toString() || ""}
                          onValueChange={(value) => selectField.onChange(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            {lookupData[field.name]?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : field.type === "toggle" ? (
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
                  ) : null}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs">{errors[field.name]?.message}</p>
                  )}
                </div>
              ))}
              <DialogFooter>
                <Button type="submit">{isEditing ? "Atualizar" : "Salvar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="relative w-1/6">
          <Input
            placeholder="Buscar..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-500" />
          </span>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.dataField}>{column.label}</TableCell>
            ))}
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.dataField}>
                  {column.render
                    ? column.render(item[column.dataField], item)
                    : item[column.dataField]}
                </TableCell>
              ))}
              <TableCell>
                <Switch
                  checked={item.status}
                  onCheckedChange={() => handleToggleStatus(item.id, item.status)}
                />
              </TableCell>
              <TableCell>
                <Button onClick={() => handleOpenModal(item)}>Editar</Button>
                <Button variant="danger" onClick={() => deleteData(item.id)}>
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                onClick={() => setCurrentPage(index + 1)}
                isActive={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default DynamicCrudComponent;