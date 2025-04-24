"use client";
import React from "react";
import Link from "next/link";
import {useSelector} from "react-redux";
import {usePathname, useRouter} from "next/navigation";
import axios from "axios";
import {fetchURL} from "@/constants";
import {enqueueSnackbar} from "notistack";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlay} from '@fortawesome/free-solid-svg-icons';

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
           headers
        });

        enqueueSnackbar("Test session successfully created!");
        router.push(`/test/${response.data.test_session}`);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

function QuestionSetCard({questionSet}) {
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const router = useRouter();
    const pathname = usePathname(); // Get current path


    return (
        <div
            className="w-full md:w-[70%] lg:w-[60%] mx-auto bg-[rgba(0,0,0,.1)] rounded-lg border-gray-200 shadow-sm py-2 px-4 md:p-4 flex items-center gap-2 flex-wrap hover:shadow-md transition ">
            {/* Image */}
            <Link href={`/quizzes/${questionSet.id}`}>
                <div
                    className="w-[3rem] h-[3rem] md:w-[5rem] md:h-[5rem] relative rounded overflow-hidden border border-gray-300 flex-shrink-0">
                    <Image
                        src={questionSet.coverImage || "/images/placeholder.png"}
                        alt="Cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        className="object-cover"
                    />
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-1 text-sm text-slate-800">
                <div className="flex items-start justify-between w-full">
                    <Link href={`/quizzes/${questionSet.id}`}>
                        <h2 className="text-sm md:text-[1rem] font-semibold  uppercase hover:text-cyan-600 transition text-pink-900">
                            {questionSet.name}
                        </h2>
                    </Link>
                </div>

                <div
                    className="text-slate-600 flex mt-1 text-[.7rem] md:text-[.9rem] flex-wrap justify-between w-full md:w-[50%]">
                    <p>
                        <span className="font-medium text-slate-500">Sub:</span>{" "}
                        {questionSet.subject}
                    </p>
                    <p>
                        <span className="font-medium text-slate-500">Lang:</span>{" "}
                        {questionSet.language}
                    </p>
                    <p>
                        <span className="font-medium text-slate-500">Questions:</span>{" "}
                        {questionSet.total_questions}
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">

                <FontAwesomeIcon icon={faPlay}
                                 className="text-pink-900 hover:text-pink-700  text-xl cursor-pointer transition"
                                 onClick={() => {
                                     if (Object.keys(userInfo).length === 0) {
                                         enqueueSnackbar("Sign in with an account or create a new account", {variant:"warning"})
                                         router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
                                     } else {
                                         createTest(questionSet.id, userInfo.token, router);
                                     }
                                 }}/>
            </div>
        </div>
    );
}

export default QuestionSetCard;
