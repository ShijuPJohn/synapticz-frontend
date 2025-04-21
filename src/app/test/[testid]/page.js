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
import ResultScreen from "@/components/resultScreen";

function Page({params}) {
    const [questions, setQuestions] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [questionIdsOrdered, setQuestionIdsOrdered] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestionId, setCurrentQuestionId] = useState(0);
    const [testSessionId, setTestSessionId] = useState("");
    const [qsetName, setQsetName] = useState("");
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;
    const [isCurrentQuestionAnswered, setIsCurrentQuestionAnswered] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [correctOptions, setCorrectOptions] = useState([]);
    const [questionAnswerData, setQuestionAnswerData] = useState({});
    const [finished, setFinished] = useState(false);
    const [resultScreen, setResultScreen] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const didFetch = React.useRef(false);
    const hasInteracted = React.useRef(false);
    const [rawFetchedData, setRawFetchedData] = useState(null);
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
    }, [questionAnswerData]);

    useEffect(() => {
        if (hasInteracted.current) {
            update();
        }
    }, [questionAnswerData]);

    async function fetchTestById(id) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.get(`${fetchURL}/test_session/${id}`, {headers});
            const data = response.data;

            // Handle both old and new response formats
            const questionsData = data.questions || data.test_session?.questions || [];
            const testSession = data.test_session || data;

            setRawFetchedData(data);
            setCurrentQuestion(questionsData[testSession.current_question_num || 0]);
            setCurrentQuestionIndex(testSession.current_question_num || 0);
            setCurrentQuestionId(questionsData[testSession.current_question_num || 0]?.id || 0);
            setScoredMark(testSession.scored_marks || 0);
            setQsetName(testSession.name || "");

            const questionIdsOrderedTemp = [];
            questionsData.forEach((qs, index) => {
                questionIdsOrderedTemp.push(qs.id);
                setQuestions((ov) => ({...ov, [qs.id]: qs}));
                setQuestionAnswerData((pv) => ({...pv, [qs.id]: qs}));
            });

            setQuestionIdsOrdered(questionIdsOrderedTemp);
            setTestSessionId(testSession.id);

            let selectedOptions = [];
            questionIdsOrderedTemp.forEach((qid, index) => {
                let selectedList = questionsData[index]?.selected_answer_list || [];
                selectedOptions.push(selectedList ? selectedList : []);
            });

            setSelectedOptions(selectedOptions);
            setCorrectOptions(questionsData.map(question => question.correct_options));

            setIsCurrentQuestionAnswered(
                questionsData[testSession.current_question_num || 0]?.selected_answer_list?.length > 0
            );

            if (testSession.finished) {
                setFinished(true);
                setResultScreen(true);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    async function update() {
        if (!finished) {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.token}`
            };
            const body = JSON.stringify({
                question_answer_data: questionAnswerData,
                current_question_index: currentQuestionIndex,
                total_marks_scored: scoredMark,
            });
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
        setIsCurrentQuestionAnswered(true);
        setQuestionAnswerData(prevState => {
            let prevCopy = {...prevState};
            prevCopy[questionIdsOrdered[currentQuestionIndex]].answered = true;
            prevCopy[questionIdsOrdered[currentQuestionIndex]].selected_answer_list = selectedOptions[currentQuestionIndex];
            return prevCopy;
        });

        if (questionAnswerData[currentQuestionId]?.question_type === "m-choice") {
            if (selectedOptions[currentQuestionIndex][0] === correctOptions[currentQuestionIndex][0]) {
                setScoredMark(ts => {
                    return ts + (questionAnswerData[questionIdsOrdered[currentQuestionIndex]]?.questions_total_mark || 0);
                });
            }
        } else if (questionAnswerData[currentQuestionId]?.question_type === "m-select") {
            if (selectedOptions[currentQuestionIndex].length > 0) {
                let answeredWrong = false;
                selectedOptions[currentQuestionIndex].forEach((selectedOption) => {
                    if (!correctOptions[currentQuestionIndex].includes(selectedOption)) {
                        answeredWrong = true;
                    }
                });
                if (!answeredWrong) {
                    setScoredMark(ts => {
                        const totalMark = questionAnswerData[questionIdsOrdered[currentQuestionIndex]]?.questions_total_mark || 0;
                        const correctCount = correctOptions[currentQuestionIndex].length;
                        const selectedCount = selectedOptions[currentQuestionIndex].length;
                        return ts + (totalMark * selectedCount / correctCount);
                    });
                }
            }
        }
    }

    async function nextQuestion() {
        hasInteracted.current = true;
        if (currentQuestionIndex + 1 < questionIdsOrdered.length) {
            setCurrentQuestion(questions[questionIdsOrdered[currentQuestionIndex + 1]]);
            setIsCurrentQuestionAnswered(
                questionAnswerData[questionIdsOrdered[currentQuestionIndex + 1]]?.answered || false
            );
            setCurrentQuestionId(questionIdsOrdered[currentQuestionIndex + 1]);
            setCurrentQuestionIndex(presentState => presentState + 1);
        }
    }

    async function prevQuestion() {
        hasInteracted.current = true;
        if (currentQuestionIndex > 0) {
            setCurrentQuestion(questions[questionIdsOrdered[currentQuestionIndex - 1]]);
            setIsCurrentQuestionAnswered(
                questionAnswerData[questionIdsOrdered[currentQuestionIndex - 1]]?.answered || false
            );
            setCurrentQuestionId(questionIdsOrdered[currentQuestionIndex - 1]);
            setCurrentQuestionIndex(presentState => presentState - 1);
        }
    }

    function optionsClickHandler(index) {
        setTimeout(() => {
        }, 2000)
        hasInteracted.current = true;
        if (!isCurrentQuestionAnswered && !finished) {
            if (currentQuestion.question_type === "m-choice") {
                setSelectedOptions(prev => {
                    const newOptions = [...prev];
                    newOptions[currentQuestionIndex] = [index];
                    return newOptions;
                });
                setQuestionAnswerData(prev => {
                    prev[questionIdsOrdered[currentQuestionIndex]].selected_answer_list = [index]
                    return prev;
                })
            } else if (currentQuestion.question_type === "m-select") {
                setSelectedOptions(prev => {
                    const newOptions = [...prev];
                    const selected = newOptions[currentQuestionIndex] || [];
                    if (selected.includes(index)) {
                        newOptions[currentQuestionIndex] = selected.filter(option => option !== index);
                    } else {
                        newOptions[currentQuestionIndex] = [...selected, index];
                    }
                    setQuestionAnswerData(prev => {
                        prev[questionIdsOrdered[currentQuestionIndex]].selected_answer_list = newOptions;
                        return prev;
                    })
                    return newOptions;
                });
            }
        }
    }

    async function finishTest() {
        hasInteracted.current = true;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.put(`${fetchURL}/test_session/finish/${testSessionId}`, {}, {headers});
            setCurrentQuestionIndex(0);
            setFinished(true);
            setResultScreen(true);
            // Update local data with final results if needed
            if (response.data) {
                setRawFetchedData(response.data);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    return (
        <main>
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

            {resultScreen ? (
                <ResultScreen resObject={rawFetchedData} toggleResult={setResultScreen}/>
            ) : (
                <div
                    className="quiz_box shadow-lg w-full md:w-[35%] h-[95vh] max-h-screen outline-none p-3 md:p-6 rounded-xl bg-white relative overflow-y-auto"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') {
                            prevQuestion();
                        } else if (e.key === 'ArrowRight') {
                            nextQuestion();
                        }
                    }}
                >
                    <div
                        className="namebox text-slate-600 text-base md:text-[1.2rem] flex justify-center items-center mb-2">
                        {qsetName}
                    </div>

                    <div
                        className="flex flex-wrap justify-between p-2 mb-2 bg-gray-500 text-amber-300 align-baseline gap-1 text-sm md:text-base">
                        <h4 className="text-red-200">{currentQuestionIndex + 1}/{questionIdsOrdered.length}</h4>
                        {currentQuestion && (
                            <h4 className="text-blue-300">
                                {currentQuestion.question_type === "m-select" ? "Multi-Select" : "MCQ"}
                            </h4>
                        )}
                        {!finished && <h4>Score: {parseFloat(scoredMark.toFixed(2))}</h4>}
                        {finished ? (
                            <p>Finished</p>
                        ) : (
                            <p
                                className="test-finish-btn text-red-400 hover:text-red-500 hover:cursor-pointer transition duration-300 whitespace-nowrap"
                                onClick={handleClickOpen}
                            >
                                <FontAwesomeIcon icon={faFlagCheckered}/> Finish
                            </p>
                        )}
                    </div>

                    <div className="min-h-16 mb-4">
                        {currentQuestion && (
                            <h1 className="quiz_box_quest_title text-lg md:text-xl font-medium text-gray-700">
                                {currentQuestion.question}
                            </h1>
                        )}
                    </div>

                    <div className="space-y-3 mb-4">
                        {currentQuestion?.options?.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => optionsClickHandler(index)}
                                className={`quiz_box_option_box p-2 border-2 flex justify-between items-center min-h-10 ${
                                    selectedOptions[currentQuestionIndex]?.includes(index) ? "border-blue-500" : "border-gray-300"
                                } ${
                                    (isCurrentQuestionAnswered || finished) && correctOptions[currentQuestionIndex]?.includes(index) ? "border-green-500" : ""
                                } ${
                                    isCurrentQuestionAnswered &&
                                    selectedOptions[currentQuestionIndex]?.includes(index) &&
                                    !correctOptions[currentQuestionIndex]?.includes(index) ? "bg-red-300 border-red-500" : ""
                                } ${
                                    isCurrentQuestionAnswered &&
                                    selectedOptions[currentQuestionIndex]?.includes(index) &&
                                    correctOptions[currentQuestionIndex]?.includes(index) ? "bg-green-300" : ""
                                }`}
                                style={isCurrentQuestionAnswered || finished ? {cursor: "default"} : {cursor: "pointer"}}
                            >
                                <h4 className="quiz_box_option text-sm md:text-base">{option}</h4>
                                {isCurrentQuestionAnswered &&
                                    selectedOptions[currentQuestionIndex]?.includes(index) &&
                                    correctOptions[currentQuestionIndex]?.includes(index) && (
                                        <div className="checkMark_main w-5 h-5 bg-green-600 clip-checkmark"/>
                                    )}
                                {isCurrentQuestionAnswered &&
                                    selectedOptions[currentQuestionIndex]?.includes(index) &&
                                    !correctOptions[currentQuestionIndex]?.includes(index) && (
                                        <div className="crossMark_main w-4 h-4 bg-red-700 clip-crossmark"/>
                                    )}
                            </div>
                        ))}
                    </div>

                    <div className="quiz_box_btn_box flex flex-col items-center mt-4 space-y-2">
                        <button
                            className={`quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center text-sm md:text-base ${
                                (!isCurrentQuestionAnswered && !finished) ? "cursor-pointer" : "cursor-default"
                            }`}
                            onClick={checkAndMarkAnswer}
                            disabled={isCurrentQuestionAnswered || finished}
                        >
                            Answer
                        </button>

                        <div className="quiz_box_btn_box_2nd_row flex justify-between w-full gap-2">
                            <button
                                className="quiz_box_btn_box_2nd_row_prev_btn flex-1 bg-orange-500 text-white py-2 text-sm md:text-base disabled:bg-orange-400 disabled:cursor-default"
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                            >
                                Previous
                            </button>
                            <button
                                className="quiz_box_btn_box_2nd_row_next_btn flex-1 bg-teal-500 text-white py-2 text-sm md:text-base disabled:bg-teal-400 disabled:cursor-default"
                                onClick={() => {
                                    if ((currentQuestionIndex + 1) === questionIdsOrdered.length) {
                                        handleClickOpen();
                                    } else {
                                        nextQuestion();
                                    }
                                }}
                            >
                                {((currentQuestionIndex + 1) === questionIdsOrdered.length) ? "Finish" : "Next"}
                            </button>
                        </div>
                    </div>

                    {(isCurrentQuestionAnswered || finished) && currentQuestion?.explanation && (
                        <div
                            className="quiz_box_explanation_box border-3 border-green-200 p-2 mt-4 max-h-40 overflow-y-auto text-xs md:text-sm text-gray-700">
                            <p>{currentQuestion.explanation}</p>
                        </div>
                    )}

                    {finished && (
                        <button
                            className="quiz_box_answer_btn w-full h-12 bg-blue-500 text-white flex justify-center items-center mt-4 text-sm md:text-base"
                            onClick={() => setResultScreen(true)}
                        >
                            See Result
                        </button>
                    )}
                </div>
            )}
        </main>
    );
}

export default Page;