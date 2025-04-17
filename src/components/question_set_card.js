"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { fetchURL } from "@/constants";
import { enqueueSnackbar } from "notistack";
import Image from "next/image";

async function createTest(questionSetID, token, router) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const data = {
        question_set_id: questionSetID,
        mode: "practice", // default
        randomize_questions: false,
    };

    try {
        const response = await axios.post(`${fetchURL}/test_session`, data, {
            headers,
        });

        enqueueSnackbar("Test session successfully created!");
        router.push(`/test/${response.data.test_session}`);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

function QuestionSetCard({ questionSet }) {
    const { userInfo } = useSelector((state) => state.user);
    const router = useRouter();

    return (
        <div className="w-full max-w-5xl mx-auto bg-[rgba(0,0,0,.1)]  rounded-xl shadow-md my-4 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-lg transition-all">
            {/* Image */}
            <div className="w-[5.5rem] h-[5.5rem] relative rounded-md overflow-hidden border border-slate-300 flex-shrink-0">
                <Image
                    src={questionSet.coverImage || "/images/placeholder.png"}
                    alt="Cover"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-1 text-[0.95rem] text-slate-800 w-full">
                <div className="flex items-start justify-between w-full">
                    <Link href={`/quizzes/${questionSet.id}`}>
                        <h2 className="text-xl font-bold text-cyan-800 hover:text-cyan-600 transition uppercase">
                            {questionSet.name}
                        </h2>
                    </Link>
                </div>

                <div className="text-slate-700 flex gap-4 mt-1 flex-wrap text-[0.95rem] font-medium">
                    <p>
                        <span className="text-slate-500">Subject:</span> {questionSet.subject}
                    </p>
                    <p>
                        <span className="text-slate-500">Language:</span> {questionSet.language}
                    </p>
                    <p>
                        <span className="text-slate-500">Questions:</span>{" "}
                        {questionSet.total_questions}
                    </p>
                </div>

                {/*{questionSet.description && (*/}
                {/*    <p className="text-[0.9rem] mt-2 text-slate-600 font-normal">*/}
                {/*        {questionSet.description}*/}
                {/*    </p>*/}
                {/*)}*/}
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 w-full sm:w-auto">
                <button
                    className="text-base font-semibold px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition w-full sm:w-auto"
                    onClick={() => {
                        createTest(questionSet.id, userInfo.token, router);
                    }}
                >
                    Start Test
                </button>
            </div>
        </div>
    );
}

export default QuestionSetCard;
