"use client"
import React from 'react';
import {enqueueSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {usePathname, useRouter} from "next/navigation";
import axios from "axios";
import {fetchURL} from "@/constants";


async function createTest(questionSetID, token, router) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const data = {
        question_set_id: parseInt(questionSetID),
        mode: "practice", // default
        randomize_questions: true,
    };

    try {
        console.log(data)
        const response = await axios.post(`${fetchURL}/test_session`, data, {
            headers
        });

        enqueueSnackbar("Test session successfully created!");
        router.push(`/test/${response.data.test_session}`);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

function StartQuizButton({qid}) {
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const router = useRouter();
    const pathname = usePathname(); // Get current path
    return (
        <button
            className="bg-[#167e82] uppercase text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300"
            onClick={() => {
                if (Object.keys(userInfo).length === 0) {
                    enqueueSnackbar("Please sign in if you have an account. Sign up otherwise", {variant: "warning"})
                    router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
                } else {
                    createTest(qid, userInfo.token, router);
                }
            }}
        >
            Start Test
        </button>
    );
}

export default StartQuizButton;