"use client"
import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import axios from "axios";
import {fetchURL} from "@/constants";

function Page({params}) {
    const [testData, setTestData] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [questionIds, setQuestionIds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    let fetched = false

    useEffect(() => {
        if (!fetched && params.testid) {
            fetched = true;
            fetchTestById(params.testid);
        }
    }, []);

    async function fetchTestById(id) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.get(`${fetchURL}/test_session/${id}`, {headers});
            setTestData(response.data)
            setCurrentQuestion(response.data.current_question)
            console.log(response.data)
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }


    return (

        Object.keys(testData).length===0? (<h1>Loading....</h1>) :
            <h1>{currentQuestion.question}</h1>

    )
        ;
}

export default Page;