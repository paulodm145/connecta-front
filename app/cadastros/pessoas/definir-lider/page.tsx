"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import ProtecaoPermissao from "@/components/ProtecaoPermissao";
import { usePessoasHook } from "@/app/hooks/usePessoasHook";

interface Pessoa {
  id: number;
  nome: string;
  status: boolean;
  responsavel: boolean;
  lider_id: number | null;
  lider?: { id: number; nome: string } | null;
  cargos?: { id: number; descricao: string; setor?: { id: number; descricao: string } | null } | null;
}

interface Lider {
  id: number;
  nome: string;
  setor_descricao: string | null;
}

type FiltroSituacao = "sem_lider" | "com_lider" | "todos";

const SEM_SETOR = "sem_setor";
const TODOS_SETORES = "todos";
const REMOVER_LIDER = "0";

export default function DefinirLiderEmLote() {
  const { pessoasIndex, getResponsaveis, definirLiderEmLote } = usePessoasHook();

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<FiltroSituacao>("sem_lider");
  const [filtroSetor, setFiltroSetor] = useState<string>(TODOS_SETORES);

  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [liderEscolhido, setLiderEscolhido] = useState<string>("");
  const [aplicando, setAplicando] = useState(false);

  const carregarPessoas = async () => {
    const response = await pessoasIndex();
    setPessoas(response || []);
  };

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      const [respostaPessoas, respostaLideres] = await Promise.all([pessoasIndex(), getResponsaveis()]);
      setPessoas(respostaPessoas || []);
      setLideres(respostaLideres || []);
      setCarregando(false);
    };

    carregarDados();
  }, []);

  const setores = useMemo(() => {
    const mapa = new Map<number, string>();
    pessoas.forEach((pessoa) => {
      const setor = pessoa.cargos?.setor;
      if (setor) mapa.set(setor.id, setor.descricao);
    });
    return Array.from(mapa, ([id, descricao]) => ({ id, descricao })).sort((a, b) =>
      a.descricao.localeCompare(b.descricao, "pt-BR")
    );
  }, [pessoas]);

  const pessoasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return pessoas.filter((pessoa) => {
      if (filtroSituacao === "sem_lider" && pessoa.lider_id) return false;
      if (filtroSituacao === "com_lider" && !pessoa.lider_id) return false;

      const setorId = pessoa.cargos?.setor?.id;
      if (filtroSetor === SEM_SETOR && setorId) return false;
      if (filtroSetor !== TODOS_SETORES && filtroSetor !== SEM_SETOR && setorId?.toString() !== filtroSetor) return false;

      if (termo) {
        const texto = [pessoa.nome, pessoa.cargos?.descricao, pessoa.cargos?.setor?.descricao, pessoa.lider?.nome]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!texto.includes(termo)) return false;
      }

      return true;
    });
  }, [pessoas, busca, filtroSituacao, filtroSetor]);

  const totalSemLider = useMemo(() => pessoas.filter((pessoa) => !pessoa.lider_id).length, [pessoas]);

  const todosFiltradosSelecionados =
    pessoasFiltradas.length > 0 && pessoasFiltradas.every((pessoa) => selecionados.has(pessoa.id));

  const alternarTodosFiltrados = (marcar: boolean) => {
    setSelecionados((anterior) => {
      const novo = new Set(anterior);
      pessoasFiltradas.forEach((pessoa) => (marcar ? novo.add(pessoa.id) : novo.delete(pessoa.id)));
      return novo;
    });
  };

  const alternarPessoa = (pessoaId: number, marcar: boolean) => {
    setSelecionados((anterior) => {
      const novo = new Set(anterior);
      if (marcar) {
        novo.add(pessoaId);
      } else {
        novo.delete(pessoaId);
      }
      return novo;
    });
  };

  const aplicarLider = async () => {
    if (selecionados.size === 0 || liderEscolhido === "") return;

    const liderId = liderEscolhido === REMOVER_LIDER ? null : Number(liderEscolhido);
    const nomeLider = lideres.find((lider) => lider.id === liderId)?.nome;
    const confirmacao = liderId
      ? `Definir ${nomeLider} como líder de ${selecionados.size} pessoa(s)?`
      : `Remover o líder de ${selecionados.size} pessoa(s)?`;

    if (!window.confirm(confirmacao)) return;

    try {
      setAplicando(true);
      const retorno = await definirLiderEmLote(Array.from(selecionados), liderId);
      toast.success(retorno?.message || "Líder atualizado com sucesso.");
      setSelecionados(new Set());
      await carregarPessoas();
    } catch (error) {
      toast.error((error as Error).message || "Erro ao definir o líder.");
    } finally {
      setAplicando(false);
    }
  };

  return (
    <ProtecaoPermissao chaves={["cadastros.pessoas.editar"]}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Definir líder em lote</CardTitle>
              <CardDescription>
                Selecione as pessoas e escolha o líder. Só aparecem como líder as pessoas marcadas como
                &quot;É líder&quot; no cadastro.
              </CardDescription>
            </div>
            <Link href="/cadastros/pessoas">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Pessoas
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Total: {pessoas.length}</Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Sem líder: {totalSemLider}
            </Badge>
            <Badge variant="outline">Exibindo: {pessoasFiltradas.length}</Badge>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Buscar por nome, cargo, setor ou líder"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="md:max-w-sm"
            />

            <Select value={filtroSituacao} onValueChange={(valor) => setFiltroSituacao(valor as FiltroSituacao)}>
              <SelectTrigger className="md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_lider">Somente sem líder</SelectItem>
                <SelectItem value="com_lider">Somente com líder</SelectItem>
                <SelectItem value="todos">Todas as pessoas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroSetor} onValueChange={setFiltroSetor}>
              <SelectTrigger className="md:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS_SETORES}>Todos os setores</SelectItem>
                <SelectItem value={SEM_SETOR}>Sem setor</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.id.toString()}>
                    {setor.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 rounded-md border p-3 bg-muted/40">
            <span className="text-sm font-medium">{selecionados.size} pessoa(s) selecionada(s)</span>

            <Select value={liderEscolhido} onValueChange={setLiderEscolhido}>
              <SelectTrigger className="md:w-[340px]">
                <SelectValue placeholder="Escolha o líder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REMOVER_LIDER}>Remover líder (deixar sem líder)</SelectItem>
                {lideres.map((lider) => (
                  <SelectItem key={lider.id} value={lider.id.toString()}>
                    {lider.nome} — {lider.setor_descricao || "Sem setor"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={aplicarLider} disabled={aplicando || selecionados.size === 0 || liderEscolhido === ""}>
              {aplicando ? "Aplicando..." : "Aplicar às selecionadas"}
            </Button>

            {selecionados.size > 0 && (
              <Button variant="ghost" onClick={() => setSelecionados(new Set())} disabled={aplicando}>
                Limpar seleção
              </Button>
            )}
          </div>

          <div className="rounded-md border max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={todosFiltradosSelecionados}
                      onCheckedChange={(marcado) => alternarTodosFiltrados(marcado === true)}
                      aria-label="Selecionar todas as pessoas exibidas"
                      disabled={pessoasFiltradas.length === 0}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Líder atual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : pessoasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma pessoa encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  pessoasFiltradas.map((pessoa) => (
                    <TableRow
                      key={pessoa.id}
                      className="cursor-pointer"
                      onClick={() => alternarPessoa(pessoa.id, !selecionados.has(pessoa.id))}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selecionados.has(pessoa.id)}
                          onCheckedChange={(marcado) => alternarPessoa(pessoa.id, marcado === true)}
                          aria-label={`Selecionar ${pessoa.nome}`}
                        />
                      </TableCell>
                      <TableCell>
                        {pessoa.nome}
                        {pessoa.responsavel && (
                          <Badge variant="outline" className="ml-2">É líder</Badge>
                        )}
                        {!pessoa.status && (
                          <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">Inativa</Badge>
                        )}
                      </TableCell>
                      <TableCell>{pessoa.cargos?.descricao || "—"}</TableCell>
                      <TableCell>{pessoa.cargos?.setor?.descricao || "Sem setor"}</TableCell>
                      <TableCell>{pessoa.lider?.nome || <span className="text-amber-700">Sem líder</span>}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </ProtecaoPermissao>
  );
}
