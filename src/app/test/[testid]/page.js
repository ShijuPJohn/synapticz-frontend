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
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false)
    const [isCurrentQuestionAnsweredRight, setIsCurrentQuestionAnsweredRight] = useState(null);
    const [isCurrentQuestionAnsweredWrong, setIsCurrentQuestionAnsweredWrong] = useState(null);
    const [scoredMarkForCurrentQuestion, setScoredMarkForCurrentQuestion] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([])
    const [correctOptions, setCorrectOptions] = useState([])

    const [totalScore, setTotalScore] = useState(0)

    useEffect(() => {
        if (!fetched && params.testid) {
            fetched = true;
            fetchTestById(params.testid);
        }
    }, []);
    useEffect(() => {
        console.log("total score: ", totalScore);
    }, [totalScore])

    async function fetchTestById(id) {
        const headers = {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.get(`${fetchURL}/test_session/${id}`, {headers});
            const data = response.data;
            console.log(data)
            setTestData(data)
            setQuestionIds(data.test_session.question_ids_ordered)
            setCurrentQuestion(data.current_question)
            setCurrentQuestionIndex(data.test_session.current_question_num)
            setCorrectOptions(data.current_question.correct_options)
            setTotalScore(data.test_session.scored_marks)
            if (currentQuestion.answered){
                setSelectedOptions(currentQuestion.selected_answer)
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    async function markQuestionAsAnswered() {
        const headers = {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
        };
        const body = JSON.stringify({
            action: "answer",
            question_id: currentQuestion.id,
            selected_answer: selectedOptions
        })
        try {
            const response = await axios.put(`${fetchURL}/test_session/${testData.test_session.id}`, body, {headers});
            const data = response.data;
            console.log(data)
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    function checkAndMarkAnswer() {
        setIsCurrentQuestionAnswered(true)
        if (currentQuestion.question_type === "m-choice") {
            if (selectedOptions[0] === correctOptions[0]) {
                setIsCurrentQuestionAnsweredRight(true);
                setIsCurrentQuestionAnsweredWrong(false);
            } else {
                setIsCurrentQuestionAnsweredWrong(true);
                setIsCurrentQuestionAnsweredRight(false);
            }
            setTotalScore(totalScore => {
                return totalScore + testData.test_session.question_answer_data[currentQuestion.id].questions_total_mark;
            })
        } else if (currentQuestion.question_type === "m-select") {
            if (selectedOptions.length > 0) {
                let answeredWrong = false
                selectedOptions.forEach((selectedOption) => {
                    if (!correctOptions.includes(selectedOption)) {
                        answeredWrong = true
                    }
                })
                if (answeredWrong) {
                    setIsCurrentQuestionAnsweredWrong(true)
                    setIsCurrentQuestionAnsweredRight(false)
                } else {
                    setIsCurrentQuestionAnsweredWrong(false)
                    setIsCurrentQuestionAnsweredRight(true)
                    setTotalScore(totalScore => {
                        return totalScore +
                            testData.test_session.question_answer_data[currentQuestion.id].questions_total_mark * selectedOptions.length / correctOptions.length;
                    })
                }
            }
        } else {

        }
        markQuestionAsAnswered();
    }

    function nextQuestion() {
        // setQNo((currQNo) => currQNo + 1)
        // setAnswered(false)
    }

    function prevQuestion() {
        // setQNo((currQNo) => currQNo - 1)
        // setAnswered(false)
    }

    function optionsClickHandler(index) {
        if (!isCurrentQuestionAnswered) {
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
        }
    }

    function suffixGenerator(num) {
        if (num <= 0) {
            return "th"
        } else if (num === 1) {
            return "t"
        } else if (num === 2) {
            return "nd"
        } else if (num === 3) {
            return "rd"
        } else {
            return "th"
        }
    }

    return (<main className={"flex flex-col p-4 items-center w-full h-full"}>
        <div className="quiz_box shadow-lg p-8 w-[35%] h-[95vh] bg-white">
            <div className="text-slate-600 flex justify-between border-amber-200 border-[2px] p-2 mb-2">
                <h4>{currentQuestionIndex + 1}/{questionIds.length}</h4>
                <h4>Score : {totalScore}</h4>
            </div>
            <h1 className="quiz_box_quest_title text-xl font-medium text-gray-700 mb-4">{currentQuestion.question}</h1>
            {currentQuestion.options && (currentQuestion.options.map((option, index) => (
                <div key={index} onClick={() => {
                    optionsClickHandler(index);
                }}
                     className={`quiz_box_option_box p-2 border-2 flex justify-between items-center h-10 mb-4 
                                 ${selectedOptions.includes(index) ? "border-blue-500" : "border-gray-300"} 
                                 ${isCurrentQuestionAnswered && correctOptions.includes(index) ? "border-green-500" : ""}
                                 ${isCurrentQuestionAnswered && selectedOptions.includes(index) && !correctOptions.includes(index) ? "bg-red-300 border-red-500" : ""}
                                 ${isCurrentQuestionAnswered && selectedOptions.includes(index) && correctOptions.includes(index) ? "bg-green-300" : ""}
                                 
                                  `}
                     style={isCurrentQuestionAnswered ? {cursor: "default"} : {cursor: "pointer"}}
                >
                    <h4 className="quiz_box_option">{option}</h4>
                    {isCurrentQuestionAnswered && selectedOptions.includes(index) && correctOptions.includes(index) &&
                        <div className="checkMark_main w-5 h-5 bg-green-600 clip-checkmark"/>}
                    {isCurrentQuestionAnswered && selectedOptions.includes(index) && !correctOptions.includes(index) &&
                        <div className="crossMark_main w-4 h-4 bg-red-700 clip-crossmark"/>}
                </div>)))}
            <div className="quiz_box_btn_box flex flex-col items-center mt-4">
                <button
                    className="quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center cursor-pointer"
                    onClick={checkAndMarkAnswer}
                    style={!isCurrentQuestionAnswered ? {cursor: "pointer"} : {cursor: "default"}}>
                    Answer
                </button>
                <div className="quiz_box_btn_box_2nd_row flex justify-between w-full h-12 mt-2">
                    <button
                        className="quiz_box_btn_box_2nd_row_prev_btn flex-1 bg-orange-500 text-white mr-1"
                        onClick={prevQuestion}
                        style={!isCurrentQuestionAnswered ? {cursor: "pointer"} : {cursor: "default"}}>
                        Previous
                    </button>
                    <button
                        className="quiz_box_btn_box_2nd_row_next_btn flex-1 bg-teal-500 text-white ml-1"
                        onClick={nextQuestion}
                        style={!isCurrentQuestionAnswered ? {cursor: "pointer"} : {cursor: "default"}}>
                        Next
                    </button>
                </div>
            </div>
            {isCurrentQuestionAnswered && (<div
                className="quiz_box_explanation_box border-3 border-green-200 p-2 mt-4 max-h-40 overflow-y-auto text-sm text-gray-700">
                <p>{currentQuestion.explanation}</p>
            </div>)}
        </div>

    </main>)
}

export default Page