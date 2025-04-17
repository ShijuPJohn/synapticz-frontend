"use client"
import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import axios from "axios";
import {fetchURL} from "@/constants";
import {faFlagCheckered} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";

function Page({params}) {

    //TODO some states are redundant. Its fine for now. Clean it up later
    const [questions, setQuestions] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [questionIdsOrdered, setQuestionIdsOrdered] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestionId, setCurrentQuestionId] = useState(0);
    const [testSessionId, setTestSessionId] = useState("");
    const [qsetName, setQsetName] = useState("");
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [correctOptions, setCorrectOptions] = useState([]);
    const [questionAnswerData, setQuestionAnswerData] = useState({});
    const [finished, setFinished] = useState(false);
    const [resultScreen, setResultScreen] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const didFetch = React.useRef(false);
    const hasInteracted = React.useRef(false);
    // const [fetchedTest, setFetchedTest] = useState(false);
    // const [testSession, setTestSession] = useState({});


    const [scoredMark, setScoredMark] = useState(0);
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };


    useEffect(() => {
        if (!didFetch.current && params.testid) {
            didFetch.current = true;
            fetchTestById(params.testid);
        }
    }, [params.testid]);

    useEffect(() => {
        console.log("New Question Answer Data", questionAnswerData);
    }, [questionAnswerData]);


    useEffect(() => {
        if (hasInteracted.current) {
            update()
        }
    }, [currentQuestionIndex, questionAnswerData]);


    async function fetchTestById(id) {
        const headers = {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.get(`${fetchURL}/test_session/${id}`, {headers});
            const data = response.data;
            setCurrentQuestion(data.questions[data.test_session.current_question_num])
            setCurrentQuestionIndex(data.current_question_index)
            setCurrentQuestionId(data.current_question_id)
            setScoredMark(data.test_session.scored_marks)
            setQsetName(data.test_session.name)
            if (data.test_session.finished) {
                setFinished(true)
                setResultScreen(true)
            }
            const questionIdsOrderedTemp = []
            data.questions.forEach((qs, index) => {
                questionIdsOrderedTemp.push(qs.id)
                setQuestions((ov) => ({...ov, [qs.id]: qs}));
                setQuestionAnswerData((pv) => ({...pv, [qs.id]: qs}))
            })
            setQuestionIdsOrdered(questionIdsOrderedTemp);
            setTestSessionId(data.test_session.id)
            let selectedOptions = []
            questionIdsOrderedTemp.forEach((qid, index) => {
                let selectedList = data.questions[index].selected_answer_list
                selectedOptions.push(selectedList ? selectedList : [])
            })
            setSelectedOptions(selectedOptions)
            setCorrectOptions(data.questions.map(question => question.correct_options))

            setIsCurrentQuestionAnswered(data.questions[data.test_session.current_question_num].selected_answer_list.length > 0)
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    async function update() {
        console.log("Update called");
        if (!finished) {
            const headers = {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
            };
            const body = JSON.stringify({
                question_answer_data: questionAnswerData,
                current_question_index: currentQuestionIndex,
                total_marks_scored: scoredMark,
            })
            try {
                const response = await axios.put(`${fetchURL}/test_session/${testSessionId}`, body, {headers});
                const data = response.data;
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
            }
        }
    }

    function checkAndMarkAnswer() {
        hasInteracted.current = true;
        setIsCurrentQuestionAnswered(true)
        setQuestionAnswerData(prevState => {
            let prevCopy = {...prevState}
            prevCopy[questionIdsOrdered[currentQuestionIndex]].answered = true;
            prevCopy[questionIdsOrdered[currentQuestionIndex]].selected_answer_list = selectedOptions[currentQuestionIndex];
            return prevCopy
        })
        if (questionAnswerData[currentQuestionId].question_type === "m-choice") {
            if (selectedOptions[currentQuestionIndex][0] === correctOptions[currentQuestionIndex][0]) {
                setScoredMark(ts => {
                    return ts + questionAnswerData[questionIdsOrdered[currentQuestionIndex]].questions_total_mark;
                })
            } else {
            }

        } else if (questionAnswerData[currentQuestionId].question_type === "m-select") {
            if (selectedOptions[currentQuestionIndex].length > 0) {
                let answeredWrong = false
                selectedOptions[currentQuestionIndex].forEach((selectedOption) => {
                    if (!correctOptions[currentQuestionIndex].includes(selectedOption)) {
                        answeredWrong = true;
                    }
                })
                if (answeredWrong) {
                } else {
                    setScoredMark(ts => {
                        return ts + questionAnswerData[questionIdsOrdered[currentQuestionIndex]].questions_total_mark * selectedOptions[currentQuestionIndex].length / correctOptions[currentQuestionIndex].length;
                    })
                }
            }
        }
    }

    async function nextQuestion() {
        hasInteracted.current = true;
        if (currentQuestionIndex + 1 < questionIdsOrdered.length) {
            setCurrentQuestion(questions[questionIdsOrdered[currentQuestionIndex + 1]]);
            setIsCurrentQuestionAnswered(questionAnswerData[questionIdsOrdered[currentQuestionIndex + 1]].answered);
            setCurrentQuestionId(questionIdsOrdered[currentQuestionIndex + 1])
            setCurrentQuestionIndex(presentState => presentState + 1);

        }
    }

    async function prevQuestion() {
        hasInteracted.current = true;
        if (currentQuestionIndex > 0) {
            setCurrentQuestion(questions[questionIdsOrdered[currentQuestionIndex - 1]]);
            setIsCurrentQuestionAnswered(questionAnswerData[questionIdsOrdered[currentQuestionIndex - 1]].answered);
            setCurrentQuestionId(questionIdsOrdered[currentQuestionIndex - 1])
            setCurrentQuestionIndex(presentState => presentState - 1);

        }
    }

    function optionsClickHandler(index) {
        hasInteracted.current = true;
        if (!isCurrentQuestionAnswered && !finished) {
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

    function toggleDialog() {
        hasInteracted.current = true;
        if (dialogOpen) {
            setDialogOpen(false);
        } else {
            setDialogOpen(true);
        }
    }

    async function finishTest() {
        hasInteracted.current = true;
        const headers = {
            'Content-Type': 'application/json', 'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.put(`${fetchURL}/test_session/finish/${testSessionId}`, {}, {headers});
            console.log(response.data)
            setCurrentQuestionIndex(0)
            setFinished(true);
            setResultScreen(true);
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    return (<main className={"flex flex-col p-4 items-center w-full h-full"}>
        <Dialog
            open={dialogOpen}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title" className={"flex gap-2 items-center"}>
                <FontAwesomeIcon icon={faFlagCheckered} color={"brown"}/>
                {"Finish the test?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You'll be taken to the result page
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose}>
                    No
                </Button>
                <Button onClick={() => {
                    handleClose();
                    finishTest();
                }} autoFocus>
                    Yes
                </Button>
            </DialogActions>
        </Dialog>

        {resultScreen ? <>
                <h1>Results</h1>
                <h2>{scoredMark}</h2>
                <button onClick={() => {
                    setResultScreen(false)
                }}>Analyze Questions
                </button>
            </>
            :
            <div className="quiz_box shadow-lg p-4 w-[35%] h-[95vh] outline-none bg-white relative" tabIndex={0}
                 onKeyDown={(e => {
                     if (e.key === 'ArrowLeft') {
                         prevQuestion();
                     } else if (e.key === 'ArrowRight') {
                         nextQuestion();
                     }
                 })}>
                <div
                    className="namebox text-slate-600 text-[1.2rem] flex justify-center items-center mb-2">{qsetName}</div>
                <div className="flex justify-between p-2 mb-2 bg-gray-500 text-amber-300 align-baseline">
                    <h4 className={"text-red-200"}>{currentQuestionIndex + 1}/{questionIdsOrdered.length}</h4>
                    {Object.keys(questionAnswerData).length > 0 &&
                        <h4 className={"text-blue-300"}>{questionAnswerData[currentQuestionId].question_type === "m-select" ? "Multi-Select" : "MCQ"}</h4>
                    }
                    {!finished && <h4>Score : {parseFloat(scoredMark.toFixed(2))}</h4>}
                    {finished ?
                        <p>Finished</p> : <p
                            className={"test-finish-btn text-red-400 hover:text-red-500 hover:cursor-pointer transition duration-300"}
                            onClick={() => {
                                toggleDialog()
                            }}>
                            <FontAwesomeIcon icon={faFlagCheckered}/> Finish
                        </p>}
                </div>
                <div className="h-16">
                    {Object.keys(questionAnswerData).length > 0 &&
                        <h1 className="quiz_box_quest_title text-xl font-medium text-gray-700 mb-4">{questionAnswerData[currentQuestionId].question}</h1>}
                </div>
                {currentQuestion && currentQuestion.options && (currentQuestion.options.map((option, index) => (
                    <div key={index} onClick={() => {
                        optionsClickHandler(index);
                    }}
                         className={`quiz_box_option_box p-2 border-2 flex justify-between items-center h-10 mb-4 
                                 ${selectedOptions[currentQuestionIndex].includes(index) ? "border-blue-500" : "border-gray-300"} 
                                 ${(isCurrentQuestionAnswered || finished) && correctOptions[currentQuestionIndex].includes(index) ? "border-green-500" : ""}
                                 ${isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && !correctOptions[currentQuestionIndex].includes(index) ? "bg-red-300 border-red-500" : ""}
                                 ${isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && correctOptions[currentQuestionIndex].includes(index) ? "bg-green-300" : ""}
                                 
                                  `}
                         style={isCurrentQuestionAnswered || finished ? {cursor: "default"} : {cursor: "pointer"}}
                    >
                        <h4 className="quiz_box_option">{option}</h4>
                        {isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && correctOptions[currentQuestionIndex].includes(index) &&
                            <div className="checkMark_main w-5 h-5 bg-green-600 clip-checkmark"/>}
                        {isCurrentQuestionAnswered && selectedOptions[currentQuestionIndex].includes(index) && !correctOptions[currentQuestionIndex].includes(index) &&
                            <div className="crossMark_main w-4 h-4 bg-red-700 clip-crossmark"/>}
                    </div>)))}
                <div className="quiz_box_btn_box flex flex-col items-center mt-4">
                    <button
                        className={`quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center `}
                        onClick={() => {
                            checkAndMarkAnswer()
                        }}
                        style={(!isCurrentQuestionAnswered && !finished) ? {cursor: "pointer"} : {cursor: "default"}}>
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
                            onClick={() => {
                                if ((currentQuestionIndex + 1) === questionIdsOrdered.length) {
                                    toggleDialog()
                                } else {
                                    nextQuestion()
                                }
                            }}
                            // disabled={currentQuestionIndex + 1 === questionIdsOrdered.length}
                        >
                            {((currentQuestionIndex + 1) === questionIdsOrdered.length) ? "Finish" : "Next"}
                        </button>

                    </div>

                </div>
                {(isCurrentQuestionAnswered || finished) && (<div
                    className="quiz_box_explanation_box border-3 border-green-200 p-2 mt-4 max-h-40 overflow-y-auto text-sm text-gray-700">
                    <p>{currentQuestion.explanation}</p>
                </div>)}
                {finished && <button
                    className={`quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center `}
                    onClick={() => {
                        setResultScreen(true)
                    }}>
                    See Result
                </button>}
            </div>}

    </main>)
}

export default Page