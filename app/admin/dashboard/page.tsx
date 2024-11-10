'use client';
import Head from 'next/head';
import HeatmapChart from '@/components/HeatmapChart';
import BarChart from '@/components/BarChart';
import RadarChart from '@/components/RadarChart';

const data = {
    "opportunities": [
        "Oportunidade 1",
        "Oportunidade 2",
        "Oportunidade 3",
        "Oportunidade 4"
    ],
    "forces": [
        "Força 1",
        "Força 2",
        "Força 3",
        "Força 4"
    ],
    "ratings": [
        ["50", "40", "30", "20"],
        ["50", "20", "10", "30"],
        ["10", "30", "00", "40"],
        ["40", "00", "50", "50"]
    ]
};

const Dashboard: React.FC = () => {
    // Calcular KPIs
    let soma = 0;
    let count = 0;
    let max = 0;
    data.ratings.forEach(row => {
        row.forEach(val => {
            const num = parseInt(val);
            soma += num;
            count += 1;
            if (num > max) max = num;
        });
    });
    const mediaGeral = (soma / count).toFixed(2);

    return (
        <>
            <Head>
                <title>Dashboard Matrix Força/Oportunidades</title>
            </Head>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">Dashboard Matrix Força/Oportunidades</h1>
                
                {/* KPIs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white shadow rounded p-4 flex-1">
                        <h2 className="text-xl font-semibold">Média Geral das Ratings</h2>
                        <p className="text-2xl">{mediaGeral}</p>
                    </div>
                    <div className="bg-white shadow rounded p-4 flex-1">
                        <h2 className="text-xl font-semibold">Máximo Rating</h2>
                        <p className="text-2xl">{max}</p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white shadow rounded p-4 col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Heatmap de Ratings</h2>
                        <HeatmapChart data={data} />
                    </div>
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="text-xl font-semibold mb-4">Média das Ratings por Força</h2>
                        <RadarChart data={data} />
                    </div>
                    <div className="bg-white shadow rounded p-4">
                        <h2 className="text-xl font-semibold mb-4">Média das Ratings por Oportunidade</h2>
                        <BarChart data={data} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
