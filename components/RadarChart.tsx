// components/RadarChart.tsx
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
    data: {
        forces: string[];
        ratings: string[][];
    };
}

const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const mediaPorForca = data.forces.map((_, colIndex) => {
            const total = data.ratings.reduce((acc, row) => acc + parseInt(row[colIndex]), 0);
            return (total / data.ratings.length).toFixed(2);
        });

        return {
            labels: data.forces,
            datasets: [{
                label: 'Média das Ratings por Força',
                data: mediaPorForca,
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                pointBackgroundColor: 'rgba(255, 206, 86, 1)'
            }]
        };
    }, [data]);

    const options = {
        scales: {
            r: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Média'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    return (
        <div className="w-full h-96">
            <Radar data={chartData} options={options} />
        </div>
    );
};

export default RadarChart;
