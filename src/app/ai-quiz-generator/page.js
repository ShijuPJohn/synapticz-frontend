"use client"

import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import {fetchURL} from "@/constants";
import {usePathname, useRouter} from "next/navigation";
import {FiChevronDown, FiGlobe, FiLoader, FiSettings} from "react-icons/fi";

// Local storage keys
const STORAGE_KEY = 'quizGeneratorData';

function Page(props) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const [statusText, setStatusText] = useState("Generating your quiz...");
    const [language, setLanguage] = useState("English");
    const [difficulty, setDifficulty] = useState("0");
    const [questionType, setQuestionType] = useState("mcq");
    const [questionCount, setQuestionCount] = useState("10");
    const router = useRouter();
    const pathname = usePathname();
    const [hasMounted, setHasMounted] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Timer reference for debouncing input changes
    const inputTimerRef = React.useRef(null);

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

    const difficulties = [{value: 0, label: "All Difficulties"}];
    for (let i = 1; i <= 10; i++) {
        difficulties.push({value: i, label: i})
    }

    const questionTypes = [
        {value: "mcq", label: "Multiple Choice"},
        {value: "multi-select", label: "Multi-Select"},
        {value: "mcq-multi-select", label: "Mixed"}
    ];

    // Load saved data from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (parsedData.input) setInput(parsedData.input);
                if (parsedData.language) setLanguage(parsedData.language);
                if (parsedData.difficulty) setDifficulty(parsedData.difficulty);
                if (parsedData.questionType) setQuestionType(parsedData.questionType);
                if (parsedData.questionCount) setQuestionCount(parsedData.questionCount);
                if (parsedData.showAdvanced) setShowAdvanced(parsedData.showAdvanced);
            } catch (e) {
                console.error('Failed to parse saved data', e);
            }
        }
        setHasMounted(true);
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        const dataToSave = {
            input,
            language,
            difficulty,
            questionType,
            questionCount,
            showAdvanced
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [input, language, difficulty, questionType, questionCount, showAdvanced]);

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    const handleInputChange = (e) => {
        const text = e.target.value;
        setInput(text);

        // Debounce the localStorage save for input
        if (inputTimerRef.current) {
            clearTimeout(inputTimerRef.current);
        }

        inputTimerRef.current = setTimeout(() => {
            const savedData = localStorage.getItem(STORAGE_KEY);
            const currentData = savedData ? JSON.parse(savedData) : {};
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...currentData,
                input: text
            }));
        }, 500); // 500ms delay
    };

    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

    const handleQuestionCountChange = (e) => {
        const value = e.target.value;
        // Allow empty value (for deletion) and validate based on user role
        if (value === '' ||
            ((userInfo.role === "admin" || userInfo.role === "owner") && Number(value) >= 1 && Number(value) <= 30) ||
            (Number(value) >= 1 && Number(value) <= 20)) {
            setQuestionCount(value);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(userInfo).length === 0) {
            enqueueSnackbar("Please sign in if you have an account. Sign up otherwise", {variant: "warning"})
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            return;
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }

        if (!input.trim()) {
            enqueueSnackbar("Please enter the content based on which you want to generate your quiz.", {variant: "warning"});
            return;
        }

        // Restrict word count only for non-admin/owner users
        if (!(userInfo.role === 'admin' || userInfo.role === 'owner') && (wordCount < 1 || wordCount > 100)) {
            enqueueSnackbar("Please enter between 1-100 words", {variant: "warning"});
            return;
        }

        // Restrict question count only for non-admin/owner users
        const isAdminOrOwner = userInfo.role === 'admin' || userInfo.role === 'owner';
        const minQuestions = 1;
        const maxQuestions = isAdminOrOwner ? 30 : 20;

        if (!questionCount || Number(questionCount) < minQuestions || Number(questionCount) > maxQuestions) {
            enqueueSnackbar(`Please enter a valid number of questions (${minQuestions}-${maxQuestions})`, {variant: "warning"});
            return;
        }

        // Clear saved data on successful submission
        setIsLoading(true);
        await createQuizFromText(input, language, difficulty, questionType, questionCount);
    }

    async function createQuizFromText(input, language, difficulty, question_type, question_count) {
        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/ai-gen/quiz`, {
                prompt: input,
                language: language.toLowerCase(),
                difficulty: parseInt(difficulty),
                question_type: questionType,
                question_count: parseInt(questionCount)
            }, {headers: getHeaders()});

            setStatusText("Saving the questions")
            await createQuestions(response.data.data.questions.questions, response.data.data.questions.quiz)
        } catch (error) {
            enqueueSnackbar("Uh oh! That didn't go well. Try again with fewer number of questions", {variant: "error"});
            console.error('Error generating data:', error);
            setIsLoading(false);
        }
    }

    async function createQuestions(data, quiz) {
        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/questions/`, data, {headers: getHeaders()});
            setStatusText("Creating the Quiz")
            const qids = response.data.questions
            await createQuiz(quiz, qids);
        } catch (error) {
            enqueueSnackbar("Error creating questions. Try again", {variant: "error"});
            console.error('Error creating questions:', error);
            setIsLoading(false);
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
            enqueueSnackbar("Error creating quiz. Try again", {variant: "error"});
            console.error('Error creating quiz:', error);
            setIsLoading(false);
        }
    }

    const toggleAdvancedSettings = () => {
        setShowAdvanced(!showAdvanced);
    };


    return (
        <main className="min-h-[88vh] flex items-center justify-center p-2">
            <div
                className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-3 md:p-8 flex flex-col space-y-4 border border-gray-100">
                <h2 className="text-3xl font-bold text-center text-[var(--secondary-title)]">
                    What do you want to learn?
                </h2>

                {/* Main textarea */}
                <div className="relative">
                    <textarea
                        rows={4}
                        value={input}
                        disabled={isLoading}
                        onChange={handleInputChange}
                        placeholder={`Enter any subject, exam, or topic`}
                        className="w-full px-5 py-4 text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    />
                    {hasMounted && !(userInfo.role === 'admin' || userInfo.role === 'owner') &&
                        <div className="absolute bottom-3 right-3 text-gray-400 text-xs flex gap-1">
                        <span className={wordCount > 100 ? "text-red-500" : ""}>
                            {wordCount}
                        </span>
                            <span>/100 words</span>
                        </div>}
                </div>

                {/* Basic Controls row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-2 rounded-xl">
                    {/* Language Select */}
                    <div className="flex-1 min-w-[120px] w-full flex flex-col gap-2">
                        <label className="text-[#95497f] text-sm font-semibold">
                            In which language?
                        </label>
                        <div className="relative">
                            <div
                                className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <FiGlobe className="h-5 w-5"/>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
                            >
                                <option value="" disabled hidden>Select Language</option>
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                <FiChevronDown className="h-5 w-5"/>
                            </div>
                        </div>
                    </div>

                    {/* Question Count Input */}
                    <div className="flex flex-col gap-2 flex-1 min-w-[120px] w-full">
                        <label className="text-sm text-[#95497f] font-semibold">
                            How many questions? (1-20)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={questionCount}
                                onChange={handleQuestionCountChange}
                                min="1"
                                max={hasMounted && !(userInfo.role === 'admin' || userInfo.role === 'owner') ? "20" : "30"}
                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Advanced Settings Button */}
                <button
                    onClick={toggleAdvancedSettings}
                    className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                >
                    <FiSettings className="h-4 w-4"/>
                    {showAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings'}
                </button>

                {/* Advanced Settings Section */}
                {showAdvanced && (
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {/* Difficulty Select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-700 font-medium">
                                Difficulty Level
                            </label>
                            <div className="relative">
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
                                >
                                    <option value="" disabled hidden>Select Difficulty</option>
                                    {difficulties.map((diff) => (
                                        <option key={diff.value} value={diff.value}>{diff.label}</option>
                                    ))}
                                </select>
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                    <FiChevronDown className="h-5 w-5"/>
                                </div>
                            </div>
                        </div>

                        {/* Question Type Select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-700 font-medium">
                                Question Type
                            </label>
                            <div className="relative">
                                <select
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value)}
                                    className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
                                >
                                    <option value="" disabled hidden>Select Type</option>
                                    {questionTypes.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                    <FiChevronDown className="h-5 w-5"/>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={(isLoading || !input || wordCount < 1) || (!(userInfo.role === 'admin' || userInfo.role === 'owner') && wordCount > 100)}
                    className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm md:text-lg transition-all
          ${isLoading || !input || (!(userInfo.role === 'admin' || userInfo.role === 'owner') && wordCount > 100) || wordCount < 1
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <FiLoader className="animate-spin h-5 w-5"/>
                            {statusText}
                        </div>
                    ) : (
                        'Generate Quiz'
                    )}
                </button>

                {isLoading && (
                    <p className="text-center text-gray-500 text-sm mt-2">
                        This might take a minute. Please don't close this page.
                    </p>
                )}
            </div>
        </main>
    );
}

export default Page;