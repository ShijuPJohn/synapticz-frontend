"use client"
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import axios from "axios";
import {fetchURL} from "@/constants";
import {
    faCheck,
    faFlagCheckered,
    faPhoneVolume,
    faSave,
    faStar,
    faVolumeMute,
    faVolumeUp
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import confetti from "canvas-confetti";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import ResultScreen from "@/components/resultScreen";
import {enqueueSnackbar} from "notistack";
import MarkdownWithMath from "@/components/markdown_with_math";

let countHandle = null
let totalTimeCountHandle = null

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
    const [mode, setMode] = React.useState("untimed");
    const [secondsPerQuestion, setSecondsPerQuestion] = useState(0);
    const [secondsTimeCap, setSecondsTimeCap] = useState(0);
    const [fetched, setFetched] = useState(false);
    const [windowSize, setWindowSize] = useState({width: 0, height: 0});
    const [secondsCount, setSecondsCount] = useState(0);
    const [totalRemainingSecondsCount, setTotalRemainingSecondsCount] = useState(0);
    const answerButtonRef = useRef(null);
    const [showRedSplash, setShowRedSplash] = useState(false);
    const [lockQuestion, setLockQuestion] = useState(false);
    const [isCurrentQuestionBookmarked, setIsCurrentQuestionBookmarked] = useState(false);
    const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState({});
    const [savedExplanationQuestionIds, setSavedExplanationQuestionIds] = useState({});
    const [isCurrentQuestionExplanationSaved, setIsCurrentQuestionExplanationSaved] = useState(false);
    const [muted, setMuted] = useState(false);
    const correctSound = new Audio("/audio_clips/correct.mp3")
    const wrongSound = new Audio("/audio_clips/wrong.mp3")
    const selectionSound = new Audio("/audio_clips/selection.mp3")
    const [animationKey, setAnimationKey] = useState(0);
    // const labelText = type === "single" ? "Single" : "Multi";
    // const bgClass = currentQuestion.type === "single" ? "bg-blue-600" : "bg-purple-600"
    const handleClickOpen = () => {
        setDialogOpen(true);
    };

    function getHeader() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        };
    }

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
    useEffect(() => {
        if (fetched && mode === "t_timed") {
            // setTotalRemainingSecondsCount(secondsTimeCap)
            totalTimeCountHandle = setInterval(() => {
                setTotalRemainingSecondsCount(prevState => prevState - 1)
            }, 1000)
        }
    }, [fetched])
    useEffect(() => {
        if (fetched && !isCurrentQuestionAnswered && !finished && totalRemainingSecondsCount <= 0) {
            checkAndMarkAnswer()
            finishTest()
        }
    }, [totalRemainingSecondsCount])
    useEffect(() => {
        clearInterval(countHandle); // Always clear first

        if (
            fetched &&
            mode === "q_timed" &&
            !isCurrentQuestionAnswered
        ) {
            setLockQuestion(true)
            setSecondsCount(secondsPerQuestion);
            countHandle = setInterval(() => {
                setSecondsCount(prev => prev - 1);
            }, 1000);
        } else {
            // setSecondsCount(0);
            clearInterval(countHandle);
        }

        return () => clearInterval(countHandle);
    }, [currentQuestionIndex, isCurrentQuestionAnswered, fetched]);
    useEffect(() => {
        if (fetched && secondsCount <= 0 && !isCurrentQuestionAnswered) {
            setLockQuestion(false)
            clearInterval(countHandle)
            checkAndMarkAnswer()
        }
    }, [secondsCount])
    useEffect(() => {
        setIsCurrentQuestionBookmarked(bookmarkedQuestionIds[currentQuestionId])
        setIsCurrentQuestionExplanationSaved(savedExplanationQuestionIds[currentQuestionId])
        if (
            fetched &&
            mode === "q_timed" &&
            isCurrentQuestionAnswered
        ){
            setSecondsCount(questionAnswerData[questionIdsOrdered[currentQuestionIndex]].time_taken?secondsPerQuestion - questionAnswerData[questionIdsOrdered[currentQuestionIndex]].time_taken:0)
        }
    }, [currentQuestionId])
    useEffect(() => {
        // Update key to re-trigger animation
        setAnimationKey((k) => k + 1);
    }, [currentQuestion]);

    const triggerConfetti = () => {
        if (answerButtonRef.current) {
            const buttonRect = answerButtonRef.current.getBoundingClientRect();
            const x = (buttonRect.left + buttonRect.width / 2) / window.innerWidth;
            const y = (buttonRect.top + buttonRect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 200,
                spread: 100,
                origin: {x, y},
                startVelocity: 30,
                gravity: 0.5,
                ticks: 60,
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });
        }
    };


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
                setBookmarkedQuestionIds(prevState => ({
                    ...prevState,
                    [qid]: data.bookmarked_question_ids.includes(qid)
                }));
                setSavedExplanationQuestionIds(prevState => ({
                    ...prevState,
                    [qid]: data.saved_explanation_question_ids.includes(qid)
                }));
            });

            setSelectedOptions(selectedOptions);
            setCorrectOptions(questionsData.map(question => question.correct_options));

            setIsCurrentQuestionAnswered(
                questionsData[testSession.current_question_num || 0]?.selected_answer_list?.length > 0
            );
            setMode(testSession.mode);
            setSecondsPerQuestion(testSession.seconds_per_question)
            setSecondsTimeCap(testSession.time_cap_seconds)
            setSecondsCount(testSession.seconds_per_question)
            setTotalRemainingSecondsCount(testSession.remaining_time)
            if (testSession.finished) {
                setFinished(true);
                setResultScreen(true);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        } finally {
            setFetched(true)
        }
    }

    async function update() {
        if (!finished) {
            const headers = getHeader();
            const body = {
                question_answer_data: questionAnswerData,
                current_question_index: currentQuestionIndex,
                total_marks_scored: scoredMark,
                remaining_time: totalRemainingSecondsCount,
            };
            try {
                const response = await axios.put(`${fetchURL}/test_session/${testSessionId}`, body, {headers});
                const data = response.data;
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
            }
        }
    }

    function playSound(status) {
        if (!muted) {
            if (status === 'right') {
                correctSound.play();
            } else if (status === 'wrong') {
                wrongSound.play();
            } else if (status === 'selection') {
                // selectionSound.play();
            }
        }
    }

    function checkAndMarkAnswer() {
        setLockQuestion(false)
        hasInteracted.current = true;
        setIsCurrentQuestionAnswered(true);
        setQuestionAnswerData(prevState => {
            let prevCopy = {...prevState};
            prevCopy[questionIdsOrdered[currentQuestionIndex]].answered = true;
            if (mode === "q_timed") {
                prevCopy[questionIdsOrdered[currentQuestionIndex]].time_taken = secondsPerQuestion - secondsCount;
            }
            prevCopy[questionIdsOrdered[currentQuestionIndex]].selected_answer_list = selectedOptions[currentQuestionIndex];
            return prevCopy;
        });

        if (questionAnswerData[currentQuestionId]?.question_type === "m-choice") {
            if (selectedOptions[currentQuestionIndex][0] === correctOptions[currentQuestionIndex][0]) {
                playSound("right");
                triggerConfetti();
                setScoredMark(ts => {
                    return ts + (questionAnswerData[questionIdsOrdered[currentQuestionIndex]]?.questions_total_mark || 0);
                });
            } else {
                playSound("wrong");
                setShowRedSplash(true);
                setTimeout(() => setShowRedSplash(false), 300);
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
                    playSound("right");
                    triggerConfetti();
                    setScoredMark(ts => {
                        const totalMark = questionAnswerData[questionIdsOrdered[currentQuestionIndex]]?.questions_total_mark || 0;
                        const correctCount = correctOptions[currentQuestionIndex].length;
                        const selectedCount = selectedOptions[currentQuestionIndex].length;
                        return ts + (totalMark * selectedCount / correctCount);
                    });
                } else {
                    playSound("wrong")
                    setShowRedSplash(true);
                    setTimeout(() => setShowRedSplash(false), 300);
                }
            }
        }
    }

    async function nextQuestion() {
        hasInteracted.current = true;
        if ((!isCurrentQuestionAnswered && mode === "q_timed") || lockQuestion) {
            return;
        }
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
        if (mode === "q_timed" && lockQuestion) {
            return;
        }
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
        playSound("selection");
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

    async function bookmarkQuestion() {
        hasInteracted.current = true;
        const headers = getHeader();
        if (isCurrentQuestionBookmarked) {

            try {
                const response = await axios.delete(`${fetchURL}/bookmarks/${currentQuestionId}`, {headers});
                enqueueSnackbar("Question removed from favorites", {variant: "info"})
                setIsCurrentQuestionBookmarked(false)
                setBookmarkedQuestionIds(prev => {
                    return {...prev, [currentQuestionId]: false}
                })
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
                enqueueSnackbar("Couldn't remove from favorites", {variant: "error"})
            }
        } else {
            try {
                const response = await axios.post(`${fetchURL}/bookmarks/`, {question_id: currentQuestionId}, {headers});
                enqueueSnackbar("Question added to favorites", {variant: "info"})
                setIsCurrentQuestionBookmarked(true)
                setBookmarkedQuestionIds(prev => {
                    return {...prev, [currentQuestionId]: true}
                })
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
                enqueueSnackbar("Couldn't add to favorites", {variant: "error"})
            }
        }

    }

    async function saveExplanationToggle() {
        const headers = getHeader();
        if (isCurrentQuestionExplanationSaved) {
            try {
                const response = await axios.delete(`${fetchURL}/explanations/${currentQuestionId}`, {headers});
                enqueueSnackbar("Explanation unsaved", {variant: "info"})
                setIsCurrentQuestionExplanationSaved(false)
                setSavedExplanationQuestionIds(prev => {
                    return {...prev, [currentQuestionId]: false}
                })
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
                enqueueSnackbar("Couldn't unsave explanation", {variant: "error"})
            }


        } else {

            try {
                const response = await axios.post(`${fetchURL}/explanations/`, {
                    question_id: currentQuestionId,
                    explanation: currentQuestion.explanation
                }, {headers});
                enqueueSnackbar("Explanation saved", {variant: "info"})
                setIsCurrentQuestionExplanationSaved(true)
                setSavedExplanationQuestionIds(prev => {
                    return {...prev, [currentQuestionId]: true}
                })
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
                enqueueSnackbar("Couldn't save", {variant: "error"})
            }


        }
    }

    async function finishTest() {
        hasInteracted.current = true;
        const headers = getHeader();
        try {
            const response = await axios.put(`${fetchURL}/test_session/finish/${testSessionId}`, {}, {headers});
            setCurrentQuestionIndex(0);
            setFinished(true);
            setResultScreen(true);
            if (response.data) {
                setRawFetchedData(response.data);
            }
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    return (
        <>
            <title>
                {qsetName}
            </title>
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

                {fetched ?
                    resultScreen ? (
                        <ResultScreen resObject={rawFetchedData} toggleResult={setResultScreen}/>
                    ) : (
                        <div
                            className="relative quiz_box shadow-lg w-full md:w-[calc(35rem+7vw)] h-[95vh] max-h-screen outline-none rounded-xl bg-white overflow-y-auto"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowLeft') {
                                    prevQuestion();
                                } else if (e.key === 'ArrowRight') {
                                    nextQuestion();
                                }
                            }}
                        > {showRedSplash && (
                            <div
                                className="absolute top-0 left-0 w-full h-full bg-red-500 bg-opacity-70 z-[100000] pointer-events-none "></div>

                        )}

                            <div
                                className="flex flex-wrap justify-between items-center text-[1rem] p-[.5rem] mb-2 bg-[#23364a] text-amber-300 align-baseline gap-1">

                                {mode === "q_timed" && <p
                                    className="text-xl md:text-2xl"
                                    style={{
                                        color: `rgb(${((secondsPerQuestion - secondsCount) / secondsPerQuestion) * 255}, ${(secondsCount / secondsPerQuestion) * 255}, 0)`
                                    }}
                                >
                                    {secondsCount}
                                </p>}
                                {mode === "t_timed" && (
                                    <p
                                        className="text-xl md:text-2xl"
                                        style={{
                                            color: `rgb(${((secondsTimeCap - totalRemainingSecondsCount) / (secondsTimeCap)) * 255}, ${(totalRemainingSecondsCount / (secondsTimeCap)) * 255}, 0)`
                                        }}
                                    >
                                        {Math.floor(totalRemainingSecondsCount / 60).toString().padStart(2, '0')}:
                                        {(totalRemainingSecondsCount % 60).toString().padStart(2, '0')}
                                    </p>
                                )}
                                <h4 className="text-red-200">{currentQuestionIndex + 1}/{questionIdsOrdered.length}</h4>

                                {currentQuestion && (
                                    <h4  key={animationKey}
                                         className={`animate-popIn inline-block px-3 py-1 rounded-full text-red-500 text-md font-semibold uppercase`}>
                                        {currentQuestion.question_type === "m-select" ? "Multi" : "Single"}
                                    </h4>
                                )}
                                {!finished && <h4>Score: {parseFloat(scoredMark.toFixed(2))}</h4>}
                                {finished ? (
                                    <p>Finished</p>
                                ) : (
                                    <div className={"flex justify-center items-center gap-4"}>
                                        <button
                                            onClick={() => {
                                                setMuted(prev => !prev);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={muted ? faVolumeMute : faVolumeUp} color={"brown"}/>
                                        </button>
                                        <button
                                            className="test-finish-btn text-red-400 hover:text-red-500 hover:cursor-pointer transition duration-300 whitespace-nowrap px-2 py-[.3rem] border-[1px] border-amber-600"
                                            onClick={handleClickOpen}
                                        >
                                            <FontAwesomeIcon icon={faFlagCheckered}/> Finish
                                        </button>

                                    </div>
                                )}
                            </div>

                            <div className="question-container px-4">
                                <div className="py-4 flex justify-between">
                                    <h1 className="quiz_box_quest_title text-lg md:text-xl font-medium text-gray-700">
                                        <MarkdownWithMath content={currentQuestion.question}/>
                                    </h1>
                                    <div className="bookmark-icon-container cursor-pointer" onClick={bookmarkQuestion}>
                                        <FontAwesomeIcon icon={faStar}
                                                         className={`text-2xl ${isCurrentQuestionBookmarked ? "text-orange-500" : "text-gray-400"} hover:text-orange-400 `}/>
                                    </div>
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
                                            <div className={"w-full flex justify-start items-center gap-2"}>

                                                {correctOptions[currentQuestionIndex].length > 1 ? <div
                                                        className={`w-[1rem] h-[1rem] border-[4px] border-gray-100 ${selectedOptions[currentQuestionIndex]?.includes(index) ? "bg-blue-600" : "bg-gray-100"}`}></div> :
                                                    <div
                                                        className={`w-[1rem] h-[1rem]  rounded-2xl border-[4px] border-slate-300 ${selectedOptions[currentQuestionIndex]?.includes(index) ? "bg-blue-600" : "bg-gray-100"}`}></div>}
                                                <h4 className="quiz_box_option text-sm md:text-base"><MarkdownWithMath
                                                    content={option}/></h4>
                                            </div>
                                            {isCurrentQuestionAnswered &&
                                                selectedOptions[currentQuestionIndex]?.includes(index) &&
                                                correctOptions[currentQuestionIndex]?.includes(index) && (
                                                    <div
                                                        className="checkMark_main w-5 h-5 bg-green-600 clip-checkmark"/>
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
                                        ref={answerButtonRef}
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
                                            className="quiz_box_btn_box_2nd_row_prev_btn flex-1 bg-orange-500 text-white py-2 text-sm md:text-base disabled:bg-orange-300 disabled:cursor-default"
                                            onClick={prevQuestion}
                                            disabled={currentQuestionIndex === 0 || lockQuestion}
                                        >
                                            Previous
                                        </button>
                                        <button
                                            className="quiz_box_btn_box_2nd_row_next_btn flex-1 bg-teal-500 text-white py-2 text-sm md:text-base disabled:bg-teal-300 disabled:cursor-default"
                                            onClick={() => {
                                                if ((currentQuestionIndex + 1) === questionIdsOrdered.length) {
                                                    handleClickOpen();
                                                } else {
                                                    nextQuestion();
                                                }
                                            }}
                                            disabled={lockQuestion}
                                        >
                                            {((currentQuestionIndex + 1) === questionIdsOrdered.length) ? "Finish" : "Next"}
                                        </button>
                                    </div>
                                </div>

                                {(isCurrentQuestionAnswered || finished) && currentQuestion?.explanation && (
                                    <div
                                        className={`flex justify-between  ${isCurrentQuestionExplanationSaved ? "bg-amber-100" : "bg-white"}  mt-4 overflow-y-auto text-[.85rem] md:text-[1rem] text-gray-700`}>
                                        <p className={"p-1"}><MarkdownWithMath content={currentQuestion.explanation}/>
                                        </p>
                                        <div
                                            className="explanation-save-btn p-[.5rem] bg-amber-800x max-w-[2rem] max-h-[2rem] flex justify-center items-center border-[1px] cursor-pointer hover:bg-amber-100 shadow-md hover:shadow-lg"
                                            onClick={saveExplanationToggle}
                                        >
                                            <FontAwesomeIcon icon={faSave} className={" text-indigo-500 h-6"}/>
                                        </div>
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
                        </div>
                    )
                    : <div>
                        <CircularProgress size="3rem"/>
                    </div>
                }

            </main>
        </>
    );
}

export default Page;