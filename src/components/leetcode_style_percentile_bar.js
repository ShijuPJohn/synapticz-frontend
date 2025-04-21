import { Chart } from 'chart.js/auto';
import { useEffect, useRef } from 'react';

const LeetCodeStylePercentileChart = ({ allScores = [], userScore = 0, totalMarks = 10 }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!allScores || allScores.length === 0 || totalMarks === 0) return;

        // Convert string scores to numbers if needed
        const numericScores = allScores.map(score => typeof score === 'string' ? parseFloat(score) : score);

        // Calculate percentages
        const percentageScores = numericScores.map(s => (s / totalMarks) * 100);
        const sortedScores = [...percentageScores].sort((a, b) => a - b);
        const userPercentage = (userScore / totalMarks) * 100;

        // Calculate percentile
        const numPeopleBelow = sortedScores.filter(score => score < userPercentage).length;
        const percentile = (numPeopleBelow / sortedScores.length) * 100;

        // Prepare data for Chart.js (now as line chart)
        const labels = sortedScores.map((_, i) => `${i + 1}`);
        const userIndex = sortedScores.findIndex(s => s >= userPercentage);

        const data = {
            labels,
            datasets: [
                {
                    label: 'Test Scores',
                    data: sortedScores,
                    borderColor: 'rgba(136, 132, 216, 1)',
                    backgroundColor: 'rgba(136, 132, 216, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Your Score',
                    data: labels.map((_, i) => i === userIndex ? userPercentage : null),
                    borderColor: 'rgba(255, 115, 0, 1)',
                    backgroundColor: 'rgba(255, 115, 0, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false // Only show points for user score
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Students (sorted by score)',
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Score (%)',
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Score: ${context.parsed.y}%`;
                                } else {
                                    return `Your score: ${context.parsed.y}% (Better than ${percentile.toFixed(1)}%)`;
                                }
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        };

        // Destroy previous chart instance if exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create new chart
        if (chartRef.current) {
            chartInstance.current = new Chart(chartRef.current, config);
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [allScores, userScore, totalMarks]);

    if (!allScores || allScores.length === 0 || totalMarks === 0) return null;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-center">
                You scored better than <span className="text-orange-500">
          {((allScores.filter(s => {
              const num = typeof s === 'string' ? parseFloat(s) : s;
              return num < userScore;
          }).length / allScores.length) * 100).toFixed(1)}%
        </span> of test takers
            </h3>

            <div style={{ height: '300px', width: '100%' }}>
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default LeetCodeStylePercentileChart;