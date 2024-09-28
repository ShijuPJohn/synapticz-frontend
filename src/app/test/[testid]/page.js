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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    let fetched = false


    const [isAnsweredCurrentQuestion, setIsAnsweredCurrentQuestion] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [correctAnswers, setCorrectAnswers] = useState([])

    const [totalScore, setTotalScore] = useState(0)
    // const [selectedButWrong, setSelectedButWrong] = useState([])
    // const [selectedAndRight, setSelectedAndRight] = useState([])
    // const [qNo, setQNo] = useState(1)
    // const [visitedQuestions, setVisitedQuestions] = useState([[]])
    // const [answeredQuestions, setAnsweredQuestions] = useState([])


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
            const data = response.data;
            setTestData(data)
            setQuestionIds(data.test_session.question_ids_ordered)
            setCurrentQuestion(data.current_question)
            setCurrentQuestionIndex(data.test_session.current_question_num)
            console.log(response.data)
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    async function markQuestionAsAnswered() {

    }

    function checkAndMarkAnswer() {
        if (currentQuestion.question_type==="m-choice1"){

        } else if (currentQuestion.question_type==="m-select"){

        } else{

        }
        // setCorrectAnswers(question.correctOptions)
        // setSelectedAndRight(selectedOption.filter(opt => question.correctOptions.includes(opt)))
        // setSelectedButWrong(selectedOption.filter(opt => !question.correctOptions.includes(opt)))
        // setSelectedOption([])
        // setAnswered(true)
        markQuestionAsAnswered()
    }

    function nextQuestion() {
        // setQNo((currQNo) => currQNo + 1)
        // setAnswered(false)
    }

    function prevQuestion() {
        // setQNo((currQNo) => currQNo - 1)
        // setAnswered(false)
    }


    return (
        <main className={"flex flex-col p-4 items-center w-full h-full"}>
            <div className="quiz_box shadow-lg p-8 w-[35%] h-[95vh] bg-white">
                <h1 className="quiz_box_quest_title text-xl font-medium text-gray-700 mb-4">{currentQuestion.question}</h1>
                {currentQuestion.options && (
                    currentQuestion.options.map((option, index) => (
                        <div key={index} onClick={() => {
                            if (currentQuestion.question_type === "m-choice") {
                                setSelectedOptions([index]);
                            } else if (currentQuestion.question_type === "m-select") {
                                setSelectedOptions(sel => {
                                    if (sel.includes(index)) {
                                        return sel.filter(option => option !== index)
                                    } else {
                                        return [...sel, index]
                                    }
                                })
                            }

                        }}
                             className={`quiz_box_option_box p-2 border-2 flex justify-between items-center h-10 mb-4 
                                 ${selectedOptions.includes(index) ? "border-blue-500" : "border-gray-300"} 
                                 ${correctAnswers.includes(index) ? "border-green-500" : ""}`}
                             style={isAnsweredCurrentQuestion ? {cursor: "default"} : {}}
                        >
                            <h4 className="quiz_box_option">{option}</h4>
                            {/*{isAnsweredCurrentQuestion && selectedAndRight.includes(index) &&*/}
                            {/*    <div className="checkMark_main w-5 h-5 bg-green-600 clip-checkmark"/>}*/}
                            {/*{isAnsweredCurrentQuestion && selectedButWrong.includes(index) &&*/}
                            {/*    <div className="crossMark_main w-4 h-4 bg-red-700 clip-crossmark"/>}*/}
                        </div>
                    ))
                )}
                <div className="quiz_box_btn_box flex flex-col items-center mt-4">
                    <button
                        className="quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center cursor-pointer"
                        onClick={checkAndMarkAnswer}
                        style={!isAnsweredCurrentQuestion ? {cursor: "pointer"} : {cursor: "default"}}>
                        Answer
                    </button>
                    <div className="quiz_box_btn_box_2nd_row flex justify-between w-full h-12 mt-2">
                        <button
                            className="quiz_box_btn_box_2nd_row_prev_btn flex-1 bg-orange-500 text-white mr-1"
                            onClick={prevQuestion}
                            style={!isAnsweredCurrentQuestion ? {cursor: "pointer"} : {cursor: "default"}}>
                            Previous
                        </button>
                        <button
                            className="quiz_box_btn_box_2nd_row_next_btn flex-1 bg-teal-500 text-white ml-1"
                            onClick={nextQuestion}
                            style={!isAnsweredCurrentQuestion ? {cursor: "pointer"} : {cursor: "default"}}>
                            Next
                        </button>
                    </div>
                </div>
                {isAnsweredCurrentQuestion && (
                    <div
                        className="quiz_box_explanation_box border-3 border-green-200 p-2 mt-4 max-h-40 overflow-y-auto text-sm text-gray-700">
                        <p>{question.explanation}</p>
                    </div>
                )}
            </div>

        </main>
    )
}

export default Page