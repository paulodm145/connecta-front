// components/HeatmapChart.tsx
import React from 'react';

interface HeatmapChartProps {
  data: {
    opportunities: string[];
    forces: string[];
    ratings: string[][];
  };
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
  const { opportunities, forces, ratings } = data;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-40" /> {/* Largura fixa para a primeira coluna */}
          {forces.map((_, index) => (
            <col key={index} className="w-24" /> 
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="px-4 py-2"></th>
            {forces.map((force, index) => (
              <th
                key={index}
                className="px-2 py-2 text-center font-semibold border truncate overflow-hidden"
                title={force} // Mostrar texto completo ao passar o mouse
              >
                {force}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity, rowIndex) => (
            <tr key={rowIndex}>
              <td
                className="px-2 py-2 font-semibold border truncate overflow-hidden"
                title={opportunity} // Mostrar texto completo ao passar o mouse
              >
                {opportunity}
              </td>
              {ratings[rowIndex].map((value, colIndex) => {
                const numValue = parseInt(value);
                const backgroundOpacity = Math.min(Math.max(numValue / 100, 0), 1);
                return (
                  <td
                    key={colIndex}
                    className="px-2 py-2 text-center border"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${backgroundOpacity})`,
                      color: numValue > 50 ? '#fff' : '#000',
                    }}
                  >
                    {numValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeatmapChart;
