"use client"
import React from "react";

export default function QuestionCard({ question, onRemove }) {
    const { id, question: qText, options, correct_options, explanation, question_type } = question;

    return (
        <div className="bg-white shadow rounded-xl p-4 border border-gray-200 space-y-2">
            <h3 className="font-semibold text-lg">Q{ id }: {qText}</h3>
            <ul className="list-disc ml-6 space-y-1">
                {options.map((opt, idx) => (
                    <li
                        key={idx}
                        className={
                            correct_options.includes(idx)
                                ? "text-green-600 font-medium"
                                : "text-gray-800"
                        }
                    >
                        {opt}
                    </li>
                ))}
            </ul>
            <p className="text-sm text-gray-600 italic">Type: {question_type}</p>
            <p className="text-sm text-gray-700">
                <strong>Explanation:</strong> {explanation}
            </p>
            <button
                onClick={onRemove}
                className="mt-2 inline-block px-4 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
            >
                Remove Bookmark
            </button>
        </div>
    );
}
