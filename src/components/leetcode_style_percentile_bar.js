import { Scatter } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Title,
} from "chart.js";
import { useMemo } from "react";

ChartJS.register(LinearScale, PointElement, Tooltip, Title);

const LeetCodeStylePercentileChart = ({ allScores = [], userScore = 0, totalMarks = 10 }) => {
    if (!allScores || allScores.length === 0 || totalMarks === 0) return null;

    const userPercentage = (userScore / totalMarks) * 100;

    const { scatterData, percentile } = useMemo(() => {
        const percentageScores = allScores.map(s => (parseFloat(s) / totalMarks) * 100);
        const sortedScores = [...percentageScores].sort((a, b) => a - b);
        const numPeopleBelow = sortedScores.filter(score => score < userPercentage).length;
        const percentile = (numPeopleBelow / sortedScores.length) * 100;

        const scatterData = [
            // All other scores with jitter
            ...sortedScores.map(score => ({
                x: score,
                y: Math.random() * 0.4 - 0.2,
            })),
            // User's score marker
            {
                x: userPercentage,
                y: 0,
                user: true,
            }
        ];

        return { scatterData, percentile };
    }, [allScores, userScore, totalMarks]);

    const data = {
        datasets: [
            {
                label: "Other Scores",
                data: scatterData.filter(d => !d.user),
                backgroundColor: "rgba(99, 102, 241, 0.5)", // indigo-500
                pointRadius: 5,
            },
            {
                label: "Your Score",
                data: scatterData.filter(d => d.user),
                backgroundColor: "#f97316", // orange-500
                pointRadius: 8,
                pointStyle: "triangle",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: context => {
                        const { x } = context.parsed;
                        return context.dataset.label === "Your Score"
                            ? `You: ${x.toFixed(1)}%`
                            : `Score: ${x.toFixed(1)}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: "Percentage Score",
                },
            },
            y: {
                display: false,
            },
        },
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-center">
                You scored better than <span className="text-orange-500">{percentile.toFixed(1)}%</span> of test takers
            </h3>
            <div style={{ height: "200px" }}>
                <Scatter data={data} options={options} />
            </div>
        </div>
    );
};

export default LeetCodeStylePercentileChart;
