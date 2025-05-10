"use client"

import React, {useState} from 'react';
import axios from 'axios';
import {useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import {fetchURL} from "@/constants";
import {Autocomplete, CircularProgress, IconButton, TextField} from "@mui/material";
import {usePathname, useRouter} from "next/navigation";
import {ExpandLess, ExpandMore, Language} from "@mui/icons-material";

function Page(props) {
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generationConfirm, setGenerationConfirm] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const [statusText, setStatusText] = useState("This is a sample status text");
    const [language, setLanguage] = useState("English");
    const router = useRouter();
    const [showLanguageInput, setShowLanguageInput] = useState(false);
    const pathname = usePathname();

    const languages = [
        "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean",
        "Arabic", "Hindi", "Bengali", "Portuguese", "Russian", "Italian", "Dutch",
        "Swedish", "Finnish", "Danish", "Norwegian", "Polish", "Turkish", "Greek",
        "Hebrew", "Thai", "Vietnamese", "Indonesian", "Malay", "Filipino", "Swahili",
        "Zulu", "Afrikaans", "Romanian", "Hungarian", "Czech", "Slovak", "Ukrainian",
        "Bulgarian", "Croatian", "Serbian", "Slovenian", "Estonian", "Latvian",
        "Lithuanian", "Icelandic", "Farsi", "Urdu", "Punjabi", "Tamil", "Telugu",
        "Kannada", "Marathi", "Gujarati", "Malayalam", "Sinhala", "Nepali", "Burmese",
        "Khmer", "Lao", "Mongolian", "Tibetan", "Uighur", "Kazakh", "Uzbek", "Turkmen",
        "Tajik", "Kyrgyz", "Georgian", "Armenian", "Azerbaijani", "Amharic", "Oromo",
        "Somali", "Hausa", "Yoruba", "Igbo", "Fulah", "Wolof", "Shona", "Xhosa",
        "Kinyarwanda", "Luganda", "Sesotho", "Setswana", "Sango", "Malagasy", "Maltese",
        "Basque", "Catalan", "Galician", "Welsh", "Irish", "Scottish Gaelic", "Breton",
        "Cornish", "Manx", "Maori", "Hawaiian", "Samoan", "Tongan", "Fijian", "Tahitian",
        "Cherokee", "Navajo", "Cree", "Inuktitut", "Greenlandic", "Yiddish", "Luxembourgish",
        "Albanian", "Macedonian", "Bosnian", "Montenegrin", "Belarusian", "Moldovan",
        "Kurdish", "Pashto", "Dari", "Balochi", "Sindhi", "Kashmiri", "Saraiki",
        "Haryanvi", "Bhojpuri", "Awadhi", "Chhattisgarhi", "Rajasthani", "Assamese",
        "Oriya", "Konkani", "Sanskrit", "Dhivehi", "Dzongkha", "Tigrinya", "Tswana",
        "Venda", "Tsonga", "Ndebele"
    ];

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    function isValidYouTubeUrl(url) {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w\-]{11}(&[\w=?\-]*)?$/;
        return pattern.test(url);
    }

    const handleSubmit = async () => {
        if (Object.keys(userInfo).length === 0) {
            enqueueSnackbar("Please sign in if you have an account. Sign up otherwise", {variant: "warning"})
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        } else if (!videoUrl || !isValidYouTubeUrl(videoUrl)) {
            enqueueSnackbar("Enter a valid youtube video URL", {variant: "warning"})
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/ai-gen/res`, {resource_url: videoUrl}, {headers: getHeaders()});
            setGenerationConfirm(true);
            setStatusText("Generating Questions with AI")
            createQuizFromYouTubeUrl(videoUrl)
        } catch (error) {
            console.error('Error checking the URL:', error);
            setIsLoading(false);
        }
    };

    async function createQuizFromYouTubeUrl(url) {
        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/ai-gen/quiz`, {
                url: url,
                language: language.toLowerCase()
            }, {headers: getHeaders()});
            setStatusText("Questions generated. Saving the questions now.")
            createQuestions(response.data.data.questions.questions, response.data.data.questions.quiz)
        } catch (error) {
            console.error('Error generating data:', error);
        } finally {

        }
    }

    async function createQuestions(data, quiz) {
        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/questions/`, data, {headers: getHeaders()});
            setStatusText("Questions saved. Now creating the Quiz")
            const qids = response.data.questions
            createQuiz(quiz, qids);
        } catch (error) {
            console.error('Error creating questions:', error);
            setIsLoading(false);
        } finally {
        }
    }

    async function createQuiz(quiz, qids) {
        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/questionsets/`, {
                ...quiz,
                question_ids: qids
            }, {headers: getHeaders()});
            setStatusText("Quiz created. Redirecting")
            enqueueSnackbar("Quiz created successfully. Redirecting", {variant: 'success'});
            router.push(`/quizzes/${response.data.id}`);
        } catch (error) {
            console.error('Error creating quiz:', error);
            setIsLoading(false);
        } finally {
        }
    }

    return (
        <main className="min-h-[90vh] flex items-center justify-center p-4">
            <div
                className="w-full max-w-xl min-h-[20rem] bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-start items-center">
                <h2 className="text-xl text-slate-600 font-semibold text-center mb-6 border-b-[2px] border-b-[var(--secondary-color)]">
                    Paste in a YouTube video URL
                </h2>

                <div className="w-full flex items-center mb-4 gap-1">
                    <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-grow w-full px-4 py-3 border-[2px] border-gray-300 rounded-l-full outline-none focus:outline-none focus:ring-2 focus:border-blue-500"
                    />
                    <div className="relative">
                        <IconButton
                            onClick={() => setShowLanguageInput(!showLanguageInput)}
                            sx={{
                                height: '3.33rem',
                                backgroundColor: 'rgb(243 244 246)',
                                '&:hover': { backgroundColor: 'rgb(229 231 235)' },
                                border: '2px solid rgb(209 213 219)',
                                borderTopRightRadius: '9999px',
                                borderBottomRightRadius: '9999px',
                                padding: '0 12px',
                            }}
                            aria-label="toggle language selection"
                        >
                            {showLanguageInput ? <ExpandLess /> : <ExpandMore />}
                            <Language className="ml-1" />
                        </IconButton>
                        {/*<Tooltip title="Select language" arrow>*/}
                        {/*    <div className="absolute inset-0" />*/}
                        {/*</Tooltip>*/}
                    </div>
                </div>

                {showLanguageInput && !isLoading && (
                    <Autocomplete
                        className="w-full mb-6"
                        options={languages}
                        value={language}
                        onChange={(event, newValue) => {
                            setLanguage(newValue || "English");
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                placeholder="Select language"
                                InputProps={{
                                    ...params.InputProps,
                                    style: { borderRadius: '9999px' }
                                }}
                            />
                        )}
                    />
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !videoUrl}
                    className={`w-full py-3 px-4 rounded-full text-white font-medium transition-colors
                    ${isLoading || !videoUrl ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
                </button>
                {isLoading ?
                    <p className={"mt-4 text-gray-600"}>This will take a while to finish. Please hang on</p> : null}
                {isLoading && <p className={"mt-4 mb-2 text-gray-500"}>{statusText}</p>}
                {isLoading && <CircularProgress/>}
            </div>
        </main>
    );
}

export default Page;