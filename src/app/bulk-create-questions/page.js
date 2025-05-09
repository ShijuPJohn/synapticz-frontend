'use client';

import React, {useState} from 'react';
import dynamic from 'next/dynamic';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    IconButton,
    Tooltip
} from '@mui/material';
import axios from "axios";
import {fetchURL} from "@/constants";
import {enqueueSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {Editor} from "@monaco-editor/react";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfo} from "@fortawesome/free-solid-svg-icons";

const AceEditor = dynamic(() => import('react-ace'), {ssr: false});

export default function ImportQuestionsPage() {
    const [json, setJson] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('questions'); // 'questions' or 'quiz'
    const [lastQuestionIds, setLastQuestionIds] = useState([]);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    const handleDialogToggle = () => setOpen(prev => !prev);
    const handleModeChange = (event) => setMode(event.target.value);

    async function handleCreateQuestion() {
        setLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/questions/`, JSON.parse(json), {headers: getHeaders()});
            const createdIds = response.data.questions
            setLastQuestionIds(createdIds);
            enqueueSnackbar(`Successfully created ${createdIds.length} questions`, {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Questions creation failed", {variant: 'error'});
            console.error('Error creating questions:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateQuiz() {
        setLoading(true);
        try {
            await axios.post(`${fetchURL}/questionsets`, JSON.parse(json), {headers: getHeaders()});
            enqueueSnackbar("Quiz created successfully", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Quiz creation failed", {variant: 'error'});
            console.error('Error creating quiz:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleCopyIds = () => {
        navigator.clipboard.writeText(JSON.stringify(lastQuestionIds));
        enqueueSnackbar("Question IDs copied to clipboard", {variant: 'success'});
    };

    return (
        <main className={"bg-[rgba(255,255,255,.5)] min-h-[95vh]"}>
            <div className="p-2 w-full border-b shadow-sm flex justify-between items-start ">
                <div className="flex items-center gap-4">
                    {/*<h1 className="text-xl font-semibold">{mode === "questions" ? "Add Questions" : "Add Quiz"} (JSON)</h1>*/}
                    <Button  variant="contained" size={"small"} style={{borderRadius:"100rem", width:"20px", height:"2rem"}}  onClick={handleDialogToggle}>
                        <FontAwesomeIcon icon={faInfo}/></Button>
                    <RadioGroup row value={mode} onChange={handleModeChange} style={{display: 'flex', justifyContent: 'space-between', gap:"0"}}>
                        <FormControlLabel value="questions" control={<Radio/>} label="Questions"/>
                        <FormControlLabel value="quiz" control={<Radio/>} label="Quiz"/>
                    </RadioGroup>

                </div>

                <div className="">


                    <Button
                        variant="contained"
                        onClick={mode === 'questions' ? handleCreateQuestion : handleCreateQuiz}
                    >
                        {mode === 'questions' ? 'Create' : 'Create'}
                    </Button>
                </div>

            </div>

            <div className="w-full h-[67vh] p-4 border-[1px] text-lg ">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    defaultValue=""
                    theme="vs-dark"
                    onChange={(value) => setJson(value)}
                    options={{
                        fontSize: 16,
                        minimap: {enabled: false},
                        wordWrap: 'on',
                    }}
                />
            </div>
            {(lastQuestionIds?.length > 0 )&& (
                <div className="w-full md:w-[60%] flex items-center gap-2 mt-4">
                    <labe> Created Question IDs</labe>
                    <TextField
                        size={"medium"}
                        value={JSON.stringify(lastQuestionIds)}
                        fullWidth
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <Tooltip title="Copy IDs">
                        <IconButton onClick={handleCopyIds}>
                            <ContentCopyIcon/>
                        </IconButton>
                    </Tooltip>
                </div>
            )}



            <Dialog open={open} onClose={handleDialogToggle} maxWidth="md" fullWidth>
                <DialogTitle>Required JSON Format</DialogTitle>
                <DialogContent dividers>
                    {mode === 'questions' ? (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
{`[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correctOptions": [0],
    "difficulty": "easy",
    "explanation": "Paris is the capital of France.",
    "questionType": "single"
  },
  {
    "question": "Select all prime numbers.",
    "options": ["2", "3", "4", "5"],
    "correctOptions": [0, 1, 3],
    "difficulty": "medium",
    "explanation": "2, 3, and 5 are prime.",
    "questionType": "multiple"
  }
]
`}
                        </pre>
                    ) : (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
{`{
  "title": "Sample Quiz",
  "description": "This is a sample quiz",
  "duration": 30,
  "questions": ["questionId1", "questionId2", "questionId3"],
  "isPublished": false,
  "passingPercentage": 60
}
`}
                        </pre>
                    )}
                    If you're using an AI tool like ChatGPT/DeepSeek/Gemini/Grok/Claude/Perplexity etc. to generate
                    questions, copy and paste this question format, and prompt like this:
                    "Generate a set of 10 questions in organic chemistry in this format"
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogToggle} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {loading &&
                <div
                    className="loading-container absolute w-full h-full top-0 left-0 bg-[rgba(0,0,0,.2)] z-[1000] flex justify-center items-start">
                    <CircularProgress style={{width: '10rem', height: '10rem'}}/>
                </div>}
        </main>
    );
}