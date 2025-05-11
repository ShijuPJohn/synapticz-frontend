"use client"

import React, {useState} from 'react';
import axios from 'axios';
import {useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import {fetchURL} from "@/constants";
import {usePathname, useRouter} from "next/navigation";
import {FiChevronDown, FiGlobe, FiLoader} from "react-icons/fi";

function Page(props) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const [statusText, setStatusText] = useState("Generating your quiz...");
    const [language, setLanguage] = useState("English");
    const [difficulty, setDifficulty] = useState("5");
    const [questionType, setQuestionType] = useState("mixed");
    const [questionCount, setQuestionCount] = useState("5");
    const router = useRouter();
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

    const difficulties = Array.from({length: 10}, (_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`
    }));

    const questionTypes = [
        {value: "mcq", label: "Multiple Choice"},
        {value: "multi-select", label: "Multi-Select"},
        {value: "mcq & multi-select", label: "Mixed"}
    ];

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    const handleInputChange = (e) => {
        const text = e.target.value;
        setInput(text);
    };

    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

    const handleQuestionCountChange = (e) => {
        const value = e.target.value;
        if (value === "" || (Number(value) >= 1 && Number(value) <= 20)) {
            setQuestionCount(value);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(userInfo).length === 0) {
            enqueueSnackbar("Please sign in if you have an account. Sign up otherwise", {variant: "warning"})
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            return;
        }

        if (!input.trim()) {
            enqueueSnackbar("Please enter the content based on which you want to generate your quiz.", {variant: "warning"});
            return;
        }

        if (wordCount < 1 || wordCount > 50) {
            enqueueSnackbar("Please enter between 1-50 words", {variant: "warning"});
            return;
        }

        if (!questionCount || Number(questionCount) < 1 || Number(questionCount) > 20) {
            enqueueSnackbar("Please enter a valid number of questions (1-20)", {variant: "warning"});
            return;
        }
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

            setStatusText("Questions generated. Saving the questions now.")
            await createQuestions(response.data.data.questions.questions, response.data.data.questions.quiz)
        } catch (error) {
            console.error('Error generating data:', error);
            setIsLoading(false);
        }
    }

    async function createQuestions(data, quiz) {
        setIsLoading(true);
        try {
            const response = await axios.post(`${fetchURL}/questions/`, data, {headers: getHeaders()});
            setStatusText("Questions saved. Now creating the Quiz")
            const qids = response.data.questions
            await createQuiz(quiz, qids);
        } catch (error) {
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
            console.error('Error creating quiz:', error);
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-[90vh] flex items-center justify-center p-2">
            <div
                className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 flex flex-col space-y-6 border border-gray-100">
                <h2 className="text-3xl font-bold text-center text-[var(--secondary-title)]">
                    What do you want to test yourself with?
                </h2>

                {/* Main textarea */}
                <div className="relative">
                    <textarea
                        rows={4}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Describe the topic in your language, in less than 50 words..."
                        className="w-full px-5 py-4 text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-gray-400 text-xs flex gap-1">
                        <span className={wordCount > 50 ? "text-red-500" : ""}>
                            {wordCount}
                        </span>
                        <span>/50 words</span>
                    </div>
                </div>

                {/* Controls row */}
                <div className="flex flex-wrap gap-4">
                    {/* Language Select */}
                    <div className="relative flex-1 min-w-[120px]">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                <FiGlobe className="h-5 w-5"/>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none peer"
                            >
                                <option value="" disabled hidden>Select Language</option>
                                {languages.map((lang) => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                <FiChevronDown className="h-5 w-5"/>
                            </div>

                        </div>
                    </div>

                    {/* Difficulty Select */}
                    <div className="relative flex-1 min-w-[120px]">
                        <div className="relative">
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none peer"
                            >
                                <option value="" disabled hidden>Select Level</option>
                                {difficulties.map((diff) => (
                                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                <FiChevronDown className="h-5 w-5"/>
                            </div>
                            <label className="absolute left-2 top-[1px] text-xs text-gray-500 transition-all peer-focus:text-xs peer-focus:top-1 peer-focus:text-blue-500">
                                Difficulty
                            </label>
                        </div>
                    </div>

                    {/* Question Type Select */}
                    <div className="relative flex-1 min-w-[120px]">
                        <div className="relative">
                            <select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none peer"
                            >
                                <option value="" disabled hidden>Select Type</option>
                                {questionTypes.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                                <FiChevronDown className="h-5 w-5"/>
                            </div>
                        </div>
                    </div>

                    {/* Question Count Input */}
                    <div className="relative flex-1 min-w-[120px]">
                        <div className="relative">
                            <input
                                type="number"
                                value={questionCount}
                                onChange={handleQuestionCountChange}
                                min="1"
                                max="20"
                                className="w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none peer"
                                placeholder=" "
                            />
                            <label className="absolute left-2 top-[1px] text-xs text-gray-500 transition-all peer-focus:text-[10px] peer-focus:top-1 peer-focus:text-blue-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-3">
                                Questions
                            </label>
                        </div>
                    </div>
                </div>
                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !input || wordCount > 50 || wordCount < 1}
                    className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold text-lg transition-all
          ${isLoading || !input || wordCount > 50 || wordCount < 1
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