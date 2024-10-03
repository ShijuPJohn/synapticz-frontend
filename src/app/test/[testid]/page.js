"use client"
import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import axios from "axios";
import {fetchURL} from "@/constants";

function Page({params}) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [questionIds, setQuestionIds] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [testSessionId, setTestSessionId] = useState("");
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    let fetched = false
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [correctOptions, setCorrectOptions] = useState([]);
    const [questionAnswerData, setQuestionAnswerData] = useState({});

    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        if (!fetched && params.testid) {
            fetched = true;
            fetchTestById(params.testid);
        }
    }, []);
    useEffect(()=>{
        update();
    },[currentQuestionIndex, questionAnswerData])

    useEffect(() => {
        console.log("question ids new value", questionIds)
    }, [questionIds]);


    async function fetchTestById(id) {
        const headers = {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.get(`${fetchURL}/test_session/${id}`, {headers});
            const data = response.data;
            setQuestions(data.questions)
            setQuestionIds(data.test_session.question_ids_ordered)
            setCurrentQuestion(data.questions[data.current_question_index])
            setCurrentQuestionIndex(data.current_question_index)
            setTotalScore(data.test_session.scored_marks)
            data.test_session.question_ids_ordered.forEach((question_id, index) => {
                data.test_session.question_answer_data[question_id].correct_answer_list = data.questions[index].correct_options
            })
            setQuestionAnswerData(data.test_session.question_answer_data)
            setTestSessionId(data.test_session.id)
            let selectedOptions = []
            data.test_session.question_ids_ordered.forEach(qid => {
                let selectedList = data.test_session.question_answer_data[qid].selected_answer_list
                selectedOptions.push(selectedList ? selectedList : [])
            })
            setSelectedOptions(selectedOptions)
            setCorrectOptions(data.questions.map(question => question.correct_options))
            setIsCurrentQuestionAnswered(data.test_session.question_answer_data[data.current_question_id].answered)
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    async function update() {
        const headers = {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
        };
        const body = JSON.stringify({
            question_answer_data: questionAnswerData,
            current_question_index: currentQuestionIndex,
            total_marks_scored: totalScore,
        })
        console.log("BODY", body)
        try {
            const response = await axios.put(`${fetchURL}/test_session/${testSessionId}`, body, {headers});
            const data = response.data;
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    function checkAndMarkAnswer() {
        setIsCurrentQuestionAnswered(true)
        setQuestionAnswerData(prevState => {
            let prevCopy = {...prevState}
            prevCopy[questionIds[currentQuestionIndex]].answered = true;
            prevCopy[questionIds[currentQuestionIndex]].selected_answer_list = selectedOptions[currentQuestionIndex];
            return prevCopy
        })
        if (currentQuestion.question_type === "m-choice") {
            if (selectedOptions[currentQuestionIndex][0] === correctOptions[currentQuestionIndex][0]) {
                setTotalScore(totalScore => {
                    return totalScore + questionAnswerData[questionIds[currentQuestionIndex]].questions_total_mark;
                })
            } else {
            }

        } else if (currentQuestion.question_type === "m-select") {
            if (selectedOptions[currentQuestionIndex].length > 0) {
                let answeredWrong = false
                selectedOptions[currentQuestionIndex].forEach((selectedOption) => {
                    if (!correctOptions[currentQuestionIndex].includes(selectedOption)) {
                        answeredWrong = true
                    }
                })
                if (answeredWrong) {
                } else {
                    setTotalScore(totalScore => {
                        return totalScore + questionAnswerData[questionIds[currentQuestionIndex]].questions_total_mark * selectedOptions[currentQuestionIndex].length / correctOptions[currentQuestionIndex].length;
                    })
                }
            }
        }
    }

    async function nextQuestion() {
        if (currentQuestionIndex + 1 < questionIds.length) {
            console.log("questionAnswerData", questionAnswerData);
            setCurrentQuestion(questions[currentQuestionIndex + 1])
            setIsCurrentQuestionAnswered(questionAnswerData[questionIds[currentQuestionIndex + 1]].answered)
            setCurrentQuestionIndex(presentState => presentState + 1)
        }
    }

    async function prevQuestion() {
        if (currentQuestionIndex > 0) {
            console.log("questionAnswerData", questionAnswerData);
            setCurrentQuestion(questions[currentQuestionIndex - 1])
            setIsCurrentQuestionAnswered(questionAnswerData[questionIds[currentQuestionIndex - 1]].answered)
            setCurrentQuestionIndex(presentState => presentState - 1)

        }
    }

    function optionsClickHandler(index) {
        if (!isCurrentQuestionAnswered) {
            if (currentQuestion.question_type === "m-choice") {
                setSelectedOptions(prev => {
                    const newOptions = [...prev];
                    newOptions[currentQuestionIndex] = [index];
                    return newOptions;
                });
            } else if (currentQuestion.question_type === "m-select") {
                setSelectedOptions(prev => {
                    const newOptions = [...prev];
                    const selected = newOptions[currentQuestionIndex];
                    if (selected.includes(index)) {
                        newOptions[currentQuestionIndex] = selected.filter(option => option !== index);
                    } else {
                        newOptions[currentQuestionIndex] = [...selected, index];
                    }
                    return newOptions;
                });
            }
        }
    }


    return (<main className={"flex flex-col p-4 items-center w-full h-full"} >
        <div className="quiz_box shadow-lg p-8 w-[35%] h-[95vh] bg-white outline-none" tabIndex={0}
             onKeyDown={(e=>{
                 if (e.key === 'ArrowLeft') {
                     prevQuestion();
                 } else if (e.key === 'ArrowRight') {
                     nextQuestion();
                 }
             })}>
            <div className="flex justify-between p-2 mb-2 bg-gray-500 text-amber-300">
                <h4 className={"text-red-200"}>{currentQuestionIndex + 1}/{questionIds.length}</h4>
                <h4 className={"text-blue-300"}>{currentQuestion.question_type === "m-select" ? "Multi-Select" : "MCQ"}</h4>
                <h4>Score : {parseFloat(totalScore.toFixed(2))}</h4>
            </div>
            <div className="h-16">
                <h1 className="quiz_box_quest_title text-xl font-medium text-gray-700 mb-4">{currentQuestion.question}</h1>
            </div>
            {currentQuestion.options && (currentQuestion.options.map((option, index) => (
                <div key={index} onClick={() => {
                    optionsClickHandler(index);
                }}
                     className={`quiz_box_option_box p-2 border-2 flex justify-between items-center h-10 mb-4 
                                 ${selectedOptions[currentQuestionIndex].includes(index) ? "border-blue-500" : "border-gray-300"} 
                                 ${isCurrentQuestionAnswered && correctOptions[currentQuestionIndex].includes(index) ? "border-green-500" : ""}
                                 ${isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && !correctOptions[currentQuestionIndex].includes(index) ? "bg-red-300 border-red-500" : ""}
                                 ${isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && correctOptions[currentQuestionIndex].includes(index) ? "bg-green-300" : ""}
                                 
                                  `}
                     style={isCurrentQuestionAnswered ? {cursor: "default"} : {cursor: "pointer"}}
                >
                    <h4 className="quiz_box_option">{option}</h4>
                    {isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && correctOptions[currentQuestionIndex].includes(index) &&
                        <div className="checkMark_main w-5 h-5 bg-green-600 clip-checkmark"/>}
                    {isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && !correctOptions[currentQuestionIndex].includes(index) &&
                        <div className="crossMark_main w-4 h-4 bg-red-700 clip-crossmark"/>}
                </div>)))}
            <div className="quiz_box_btn_box flex flex-col items-center mt-4">
                <button
                    className="quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center cursor-pointer"
                    onClick={() => {
                        checkAndMarkAnswer()
                    }}
                    style={!isCurrentQuestionAnswered ? {cursor: "pointer"} : {cursor: "default"}}>
                    Answer
                </button>
                <div className="quiz_box_btn_box_2nd_row flex justify-between w-full h-12 mt-2">
                    <button
                        className="quiz_box_btn_box_2nd_row_prev_btn flex-1 bg-orange-500 text-white mr-1 disabled:bg-orange-400 disabled:cursor-default"
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}>
                        Previous
                    </button>
                    <button
                        className="quiz_box_btn_box_2nd_row_next_btn flex-1 bg-teal-500 text-white ml-1 disabled:bg-teal-400 disabled:cursor-default"
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex + 1 === questionIds.length}>
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