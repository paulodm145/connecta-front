'use client';

import React, { useState, useEffect } from 'react';
// Importações dos componentes UI
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

// Interface para as opções de avaliação
interface RatingOption {
  value: string;
  label: string;
  colorClass: string;
}

// Definição das opções de avaliação
const ratingOptions: RatingOption[] = [
  { value: '50', label: 'Altíssimo', colorClass: 'bg-blue-600 text-white' },
  { value: '40', label: 'Alto', colorClass: 'bg-blue-500 text-white' },
  { value: '30', label: 'Médio', colorClass: 'bg-blue-400 text-white' },
  { value: '20', label: 'Baixo', colorClass: 'bg-blue-300 text-white' },
  { value: '10', label: 'Muito Baixo', colorClass: 'bg-blue-200 text-blue-800' },
  { value: '00', label: 'Nulo', colorClass: 'bg-gray-300 text-gray-800' },
];

// Interface para os dados da matriz
interface Data {
  opportunities: string[];
  forces: string[];
  ratings: string[][];
}

// Propriedades do componente
interface CardOpportunitiesForcesMatrixProps {
  initialData?: Partial<Data>;
  onSave?: (data: Data) => void;
}

const CardOpportunitiesForcesMatrix: React.FC<CardOpportunitiesForcesMatrixProps> = ({ initialData = {}, onSave }) => {
  // Valores iniciais para oportunidades e forças
  const initialOpportunities = initialData.opportunities || ['Oportunidade 1', 'Oportunidade 2', 'Oportunidade 3', 'Oportunidade 4'];
  const initialForces = initialData.forces || ['Força 1', 'Força 2', 'Força 3', 'Força 4'];
  const initialRatings = initialData.ratings || [
    ['50', '40', '30', '20'],
    ['50', '20', '10', '30'],
    ['10', '30', '30', '40'],
    ['40', '00', '50', '50'],
  ];

  // Função para gerar a matriz de avaliações padrão
  const defaultRatings = (opportunities: string[], forces: string[]): string[][] => {
    return opportunities.map(() => forces.map(() => '00'));
  };

  // Estado do componente
  const [data, setData] = useState<Data>({
    opportunities: initialOpportunities,
    forces: initialForces,
    ratings: initialRatings || defaultRatings(initialOpportunities, initialForces),
  });

  useEffect(() => {
    console.log('Component initialized with data:', data);
  }, [data]);

  // Manipulador para mudança de avaliação
  const handleRatingChange = (opportunityIndex: number, forceIndex: number, value: string) => {
    const newRatings = data.ratings.map((row, rowIndex) =>
      rowIndex === opportunityIndex
        ? row.map((col, colIndex) => (colIndex === forceIndex ? value : col))
        : row
    );
    setData((prevData) => {
      const newData = { ...prevData, ratings: newRatings };
      console.log('Data updated:', newData);
      return newData;
    });
  };

  // Manipulador para salvar os dados
  const handleSave = () => {
    console.log('Saving data:', data);
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        {/* Título do cartão */}
        <CardTitle className="text-xl font-bold text-center">Matriz de Oportunidades e Forças</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex">
          {/* Rótulo lateral para oportunidades */}
          <div className="bg-gray-100 p-2 flex items-center justify-center rounded-l-md">
            <span className="transform -rotate-90 text-sm font-semibold text-gray-700 whitespace-nowrap">
              Oportunidades
            </span>
          </div>
          <div className="flex-grow">
            {/* Rótulo superior para forças */}
            <div className="bg-gray-100 p-2 text-center font-semibold text-gray-700 text-sm">Forças</div>
            {/* Contêiner da grade */}
            <div
              className="grid gap-0"
              style={{ gridTemplateColumns: `auto repeat(${data.forces.length}, 1fr)` }} // Define dinamicamente o número de colunas
            >
              {/* Célula vazia no canto superior esquerdo */}
              <div className="bg-gray-100"></div>
              {/* Cabeçalhos das forças */}
              {data.forces.map((force, index) => (
                <div key={index} className="p-1 text-center font-semibold text-gray-700 bg-gray-100 text-xs">
                  {force}
                </div>
              ))}
              {/* Linhas de oportunidades */}
              {data.opportunities.map((opportunity, oppIndex) => (
                <React.Fragment key={oppIndex}>
                  {/* Rótulo da oportunidade */}
                  <div className="flex items-center font-semibold text-gray-700 p-1 bg-gray-100 text-xs">
                    {opportunity}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                  {/* Células de avaliação */}
                  {data.forces.map((_, forceIndex) => (
                    <div key={`${oppIndex}-${forceIndex}`} className="p-1">
                      <Select
                        value={data.ratings[oppIndex][forceIndex]}
                        onValueChange={(value) => handleRatingChange(oppIndex, forceIndex, value)}
                      >
                        <SelectTrigger
                          className={`w-full h-8 text-xs ${
                            ratingOptions.find(opt => opt.value === data.ratings[oppIndex][forceIndex])?.colorClass
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ratingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className={`${option.colorClass} text-xs`}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {/* Botão para salvar a matriz */}
        <Button onClick={handleSave} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          Salvar Matriz
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardOpportunitiesForcesMatrix;
