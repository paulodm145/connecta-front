// components/BarChart.tsx
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface BarChartProps {
    data: {
        opportunities: string[];
        ratings: string[][];
    };
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const mediaPorOportunidade = data.ratings.map(row => {
            const total = row.reduce((acc, val) => acc + parseInt(val), 0);
            return (total / row.length).toFixed(2);
        });

        return {
            labels: data.opportunities,
            datasets: [{
                label: 'Média das Ratings',
                data: mediaPorOportunidade,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    }, [data]);

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Média'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Oportunidades'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return (
        <div className="w-full h-96">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;
