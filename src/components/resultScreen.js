"use client"
import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Confetti from 'react-confetti'
import {
    faChartBar,
    faCheckCircle,
    faClock,
    faListOl,
    faPercentage,
    faQuestionCircle,
    faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import LeetCodeStylePercentileBar from "@/components/leetcode_style_percentile_bar";

function ResultScreen({resObject, toggleResult}) {
    const router = useRouter();
    // Calculate time taken
    const startedTime = new Date(resObject.test_session.started_time);
    const finishedTime = new Date(resObject.test_session.finished_time);
    const [showConfetti, setShowConfetti] = useState(true);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };




    // Get performance message based on percentage
    const getPerformanceMessage = (percentage) => {
        if (percentage >= 80) return "Excellent! You've mastered this material.";
        if (percentage >= 60) return "Good job! You're on the right track.";
        if (percentage >= 40) return "Not bad! Review the explanations to improve.";
        return "Keep practicing! Review the explanations and try again.";
    };
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gray-50 rounded-lg shadow-lg flex flex-col">
            {showConfetti && <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={600}
                gravity={1}
                onConfettiComplete={() => {
                    setShowConfetti(false)
                }}
                style={{position: 'fixed', zIndex: 1000}}
            />
            }
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-indigo-800 mb-2 uppercase">Results</h2>
                <h2 className="text-xl text-sky-700 uppercase">{resObject.question_set.name}</h2>
                <p className="text-gray-600 mt-1">{resObject.question_set.description}</p>
            </div>
            <div className="graph-container my-4 max-w-[90vw]">
                <LeetCodeStylePercentileBar
                    allScores={resObject.test_stats.all_test_takers_scores}
                    userScore={resObject.test_session.scored_marks}
                    totalMarks={resObject.test_session.total_marks}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                {/*<div className="mb-8">*/}
                {/*    <TimePerQuestionChart resObject={resObject} />*/}
                {/*</div>*/}
                {/* Score Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faPercentage} className="text-indigo-500 text-xl mr-3"/>
                        <h3 className="font-semibold text-gray-700">Your Score</h3>
                    </div>
                    <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold text-indigo-700">
              {resObject.test_stats.percentage.toFixed(1)}%
            </span>
                        <span className="ml-2 text-gray-500">
              ({resObject.test_session.scored_marks.toFixed(1)}/{resObject.test_session.total_marks})
            </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 italic">
                        {getPerformanceMessage(resObject.test_stats.percentage)}
                    </p>
                </div>

                {/* Correct Answers Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl mr-3"/>
                        <h3 className="font-semibold text-gray-700">Correct</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-700 mt-2">
                        {resObject.test_stats.correct_answers}
                        <span className="text-lg text-gray-500 ml-1">/ {resObject.questions.length}</span>
                    </p>
                </div>

                {/* Wrong Answers Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-xl mr-3"/>
                        <h3 className="font-semibold text-gray-700">Wrong</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-700 mt-2">
                        {resObject.test_stats.wrong_answers}
                    </p>
                </div>

                {/* Unanswered Card */}
                <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faQuestionCircle} className="text-yellow-500 text-xl mr-3"/>
                        <h3 className="font-semibold text-gray-700">Unanswered</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700 mt-2">
                        {resObject.test_stats.unanswered}
                    </p>
                </div>
            </div>

            {/* Detailed Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Time and Attempts */}
                <div className="bg-white p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-2"/>
                        Test Details
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Test Mode:</span>
                            <span className="font-medium capitalize">{resObject.test_session.mode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time Started:</span>
                            <span className="font-medium">{formatter.format(startedTime)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Time Completed:</span>
                            <span className="font-medium">{formatter.format(finishedTime)}</span>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Stats */}
                <div className="bg-white p-5 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <FontAwesomeIcon icon={faChartBar} className="text-purple-500 mr-2"/>
                        Performance Stats
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Your Rank:</span>
                            <span className="font-medium">
                {resObject.test_session.rank ? `#${resObject.test_session.rank}` : 'N/A'}
              </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Attempts:</span>
                            <span className="font-medium">{resObject.test_stats.total_attempts}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Average Score:</span>
                            <span className="font-medium">
                {resObject.test_stats.average_score.toFixed(1)}/{resObject.test_session.total_marks}
              </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Top Score:</span>
                            <span className="font-medium">
                {resObject.test_stats.top_score.toFixed(1)}/{resObject.test_session.total_marks}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Breakdown */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faListOl} className="text-indigo-500 mr-2"/>
                    Question Breakdown
                </h3>

                <div className="space-y-4">
                    {resObject.questions.map((question, index) => (
                        <div
                            key={question.id}
                            className={`p-4 rounded-lg border ${question.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-gray-800">
                                        Q{index + 1}: {question.question}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Your Answer:</span> {
                                        question.selected_answer_list.length > 0
                                            ? question.selected_answer_list.map(ans => question.options[ans]).join(', ')
                                            : 'Not answered'
                                    }
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Correct Answer:</span> {
                                        question.correct_options.map(ans => question.options[ans]).join(', ')
                                    }
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    question.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                  {question.is_correct ? 'Correct' : 'Incorrect'}
                </span>
                            </div>

                            {question.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-100">
                                    <p className="text-sm font-medium text-blue-800">Explanation:</p>
                                    <p className="text-sm text-blue-700">{question.explanation}</p>
                                </div>
                            )}

                            <div className="mt-2 flex justify-between text-xs text-gray-500">
                                <span>Type: {question.question_type}</span>
                                <span>Marks: {question.questions_scored_mark.toFixed(1)}/{question.questions_total_mark}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex sm:flex-row justify-center gap-4 mt-8">

                <button
                    onClick={() => toggleResult(false)}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                    Revisit Test
                </button>
                <Link
                    href={`/quizzes/${resObject.question_set.id}`}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-cyan-900 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                    Retake Test
                </Link>

            </div>
        </div>
    );
}

export default ResultScreen;