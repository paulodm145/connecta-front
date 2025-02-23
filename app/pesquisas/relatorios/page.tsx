"use client";

import BasicDataTable from "@/components/BasicDataTable";

const tableData = {
  columns: [
    { label: "Respondente", datafield: "respondente" },
    { label: "Data de envio", datafield: "data_envio" },
    { label: "Pontuação", datafield: "pontuacao" },
    { label: "Percentual", datafield: "percentual" },
    { label: "Pergunta 01", datafield: "pergunta_01" },
    { label: "Pergunta 02", datafield: "pergunta_02" },
    { label: "Pergunta 03", datafield: "pergunta_03" },
  ],
  data: [
    {
      respondente: "PAULO ROBERTO BOLSANELLO",
      data_envio: "23/02/2025",
      pontuacao: 40,
      percentual: "80%",
      pergunta_01: "Opção 0",
      pergunta_02: "5, 0, 0",
      pergunta_03: "5",
    },
    {
      respondente: "PAULO ROBERTO BOLSANELLO",
      data_envio: "23/02/2025",
      pontuacao: 50,
      percentual: "100%",
      pergunta_01: "Opção 5",
      pergunta_02: "5, 0, 0",
      pergunta_03: "5",
    },
  ],
};

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Consulta de Dados</h1>
      <BasicDataTable columns={tableData.columns} data={tableData.data} />
    </div>
  );
}
