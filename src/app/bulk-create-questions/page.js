'use client';

import React, {useState} from 'react';
import dynamic from 'next/dynamic';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button, CircularProgress,
} from '@mui/material';
import axios from "axios";
import {fetchURL} from "@/constants";
import {enqueueSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {Editor} from "@monaco-editor/react";

const AceEditor = dynamic(() => import('react-ace'), { ssr: false });

export default function ImportQuestionsPage() {
    const [json, setJson] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;

    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    const handleDialogToggle = () => setOpen(prev => !prev);

    async function handleCreateQuestion() {
        setLoading(true)
        try {
            await axios.post(`${fetchURL}/questions/`, JSON.parse(json), {headers: getHeaders()});
            enqueueSnackbar("Questions created", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Questions creation failed", {variant: 'error'});
            console.error('Error updating question:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full p-2 md:p-4 h-[90vh] flex flex-col bg-gray-50 relative">
            <div className="p-4 border-b shadow-sm flex justify-between items-center bg-white">
                <h1 className="text-xl font-semibold">Add Questions (JSON)</h1>
                <Button variant="contained" onClick={handleDialogToggle}>
                    Show How To
                </Button>
            </div>

            <div className="flex-grow p-4 border-[1px] text-lg">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    defaultValue=""
                    theme="vs-dark"
                    onChange={(value) => setJson(value)}
                    options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        wordWrap: 'on',
                    }}
                />
            </div>
            <div>
                <Button variant={"contained"} onClick={handleCreateQuestion}>
                    Submit
                </Button>
            </div>

            <Dialog open={open} onClose={handleDialogToggle} maxWidth="md" fullWidth>
                <DialogTitle>Required JSON Format</DialogTitle>
                <DialogContent dividers>
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
                    If you're using an AI tool like ChatGPT/DeepSeek/Gemini/Grok/Claude/Perplexity etc. to generate questions, copy and paste this question format, and prompt like this:
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
        </div>
    );
}
