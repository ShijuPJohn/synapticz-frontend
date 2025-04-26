"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { fetchURL } from "@/constants";
import Image from "next/image";

function Page({ params }) {
    const [quiz, setQuiz] = useState(null);

    async function fetchQuizById(qzid) {
        try {
            const response = await axios.get(`${fetchURL}/questionsets/${qzid}`);
            const data = response.data;

            if (!data.cover_image || data.cover_image.trim() === "") {
                data.cover_image = "/images/placeholder_book.png";
            }

            setQuiz(data);
        } catch (err) {
            console.error("Error fetching quiz:", err);
        }
    }

    useEffect(() => {
        if (params.quizzid) {
            fetchQuizById(params.quizzid);
        }
    }, [params.quizzid]);

    if (!quiz) {
        return (
            <main>
                <p className="text-blue-600 text-lg font-medium animate-pulse">
                    Loading quiz details...
                </p>
            </main>
        );
    }

    return (
        <main >
            <div className="w-[98%] md:w-[80%] lg:w-[50%] mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-12 border border-purple-100">

                {/* Top Section: Image + Metadata */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cover Image */}
                    <div className="w-full lg:w-1/3 h-56 overflow-hidden border-[1px] border-purple-300 rounded-xl shadow-md relative">
                        <Image
                            src={quiz.cover_image}
                            alt="Quiz Cover"
                            className="w-full h-full object-contain"
                            fill
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-[1.2rem] md:text-2xl font-bold text-pink-900 mb-4 uppercase">
                            {quiz.name}
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            Created by{" "}
                            <span className="font-semibold text-blue-600">
                {quiz.created_by_name}
              </span>{" "}
                            ·{" "}
                            <span className="text-gray-500">
                {new Date(quiz.created_at).toLocaleDateString()}
              </span>
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                            <Info label="📚 Subject" value={quiz.subject} />
                            <Info label="🎓 Exam" value={quiz.exam} />
                            <Info label="🗣 Language" value={quiz.language} />
                            <Info label="🕒 Duration" value={`${quiz.time_duration} min`} />
                            <Info label="🎯 Mode" value={quiz.mode} />
                            <Info label="🚀 Taken" value={`${quiz.test_sessions_taken} times`} />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-8 border-t border-purple-200" />

                {/* Description */}
                {quiz.description && (
                    <section className="mb-8">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">📄 Description</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{quiz.description}</p>
                    </section>
                )}

                {/* Tags */}
                {quiz.tags?.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">🏷 Tags</h3>
                        <div className="flex flex-wrap gap-3">
                            {quiz.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full shadow-sm"
                                >
                  #{tag}
                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Resource Link */}
                {quiz.associated_resource && (
                    <section className="mb-10">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">🔗 Resource</h3>
                        <a
                            href={quiz.associated_resource}
                            className="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {quiz.associated_resource}
                        </a>
                    </section>
                )}

                {/* Start Test Button */}
                {quiz.can_start_test && (
                    <div className="flex justify-center">
                        <button className="bg-[#167e82] uppercase text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300">
                            Start Test
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-gray-500 text-xs mb-0.5">{label}</p>
            <p className="text-gray-800 font-semibold">{value || "N/A"}</p>
        </div>
    );
}

export default Page;
