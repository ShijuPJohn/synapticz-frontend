"use client"
import React, {useState} from 'react';
import Link from "next/link";
import {MenuItem, Select} from "@mui/material";
import {useSelector} from "react-redux";
import {fetchURL} from "@/constants";
import axios from "axios";
import {useRouter} from "next/navigation";
import {enqueueSnackbar} from "notistack";

async function createTest(questionSetID, token, mode, router) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const data = {
        question_set_id: questionSetID,
        mode: mode,
        randomize_questions: false

    }
    try {
        const response = await axios.post(`${fetchURL}/test_session`, data, {headers})
        console.log(response);
        setTimeout(()=>{
            enqueueSnackbar("test session successfully created!")
            router.push(`/test/${response.data.test_session}`)
        },500)

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

function QuestionSetCard({questionSet}) {
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const [mode, setMode] = useState("practice");
    const router = useRouter();
    return (
        <div
            className={"questionset-card card-box bg-[rgba(0,0,0,.05)] w-[60%] p-4 my-2 flex flex-row items-center justify-between border-[1px] border-slate-500 text-slate-800 rounded-[3px]"}>
            <div className="title-block flex flex-col">
                <h2 className={"text-xl text-red-900"}>{questionSet.name}</h2>
                <p>{questionSet.explanation}</p>
            </div>
            <div className="info-block">
                <p><span>Number of Questions:</span>{questionSet.total_questions}</p>
            </div>
            <div className="action-block">
                <Select className={"w-[10rem] mx-4"} label="Mode" value={mode}>
                    <MenuItem value={"practice"}>Practice</MenuItem>
                    <MenuItem value={"exam"}>Timed Test</MenuItem>
                </Select>
                <button className={"start-test-btn  py-2 px-4 bg-cyan-500 hover:bg-[rgba(0,0,0,.1)] text-slate-800"}
                        onClick={() => {
                            createTest(questionSet.id, userInfo.token, mode, router)
                        }}>Start Test
                </button>
            </div>
        </div>
    );
}

export default QuestionSetCard;