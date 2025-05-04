"use client"
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faEdit, faTrash, faFilter, faChevronDown, faChevronUp, faCheckSquare, faSquare, faPlus
} from '@fortawesome/free-solid-svg-icons';
import {useSelector} from "react-redux";
import {fetchURL} from "@/constants";
import {
    Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Chip, MenuItem
} from "@mui/material";
import {enqueueSnackbar} from "notistack";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [filters, setFilters] = useState({
        subject: '', exam: '', language: '', tags: '', hours: '', created_by: '', self: false,
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;
    const [showModal, setShowModal] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState(null);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [floatingMenu, setFloatingMenu] = useState(false);
    const [newQuestionDialogOpen, setNewQuestionDialogOpen] = useState(false);
    const [newQuizDialogOpen, setNewQuizDialogOpen] = useState(false);
    const [questionStatement, setQuestionStatement] = useState("");
    const [subject, setSubject] = useState("");
    const [exam, setExam] = useState("");
    const [language, setLanguage] = useState("");
    const [difficulty, setDifficulty] = useState(0);
    const [questionType, setQuestionType] = useState("m-choice");
    const [explanation, setExplanation] = useState("");
    const [answerOptions, setAnswerOptions] = useState(["", "", "", ""]);
    const [correctOptions, setCorrectOptions] = useState([]);
    const [tags, setTags] = useState([]);

    const hourOptions = [{label: '1 hour', value: '1'}, {label: '2 hours', value: '2'}, {
        label: '4 hours', value: '4'
    }, {label: '12 hours', value: '12'}, {label: '1 day', value: '24'}, {
        label: '2 days', value: '48'
    }, {label: '1 week', value: (24 * 7).toString()}, {
        label: '2 weeks', value: (24 * 14).toString()
    }, {label: '1 month', value: (24 * 30).toString()},];

    const handleSelectQuestion = (id) => {
        setSelectedQuestionIds((prev) => prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]);
    };

    const fetchQuestions = async () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        try {
            const response = await axios.get(`${fetchURL}/questions?${params.toString()}`, {headers: getHeaders()});
            setQuestions(response.data.questions);
            console.log(response.data.questions);
            setQuestionsCount(response.data.questions.length);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFilters({
            ...filters, [name]: type === 'checkbox' ? checked : value,
        });
    };

    const toggleAdvancedFilters = () => {
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    const handleEditQuestion = async () => {
        const newCorrectOptions = []
        questionToEdit.correct_options.forEach(correctOptionString => {
            newCorrectOptions.push(parseInt(correctOptionString));
        })
        try {
            await axios.put(`${fetchURL}/questions/${questionToEdit.id}`, {
                ...questionToEdit, correct_options: newCorrectOptions
            }, {headers: getHeaders()});
            setEditModalOpen(false);
            fetchQuestions();
            enqueueSnackbar("Question updated successfully.", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Question update failed", {variant: 'error'});
            console.error('Error updating question:', error);
        }
    };

    async function handleCreateQuestion() {
        const data = {
            question: questionStatement,
            subject,
            exam,
            language,
            difficulty: parseInt(difficulty.toString()),
            question_type: questionType,
            options: answerOptions,
            correct_options: correctOptions,
            explanation,
            tags
        }
        console.log(data)
        try {
            await axios.post(`${fetchURL}/questions/`, data, {headers: getHeaders()});
            setNewQuestionDialogOpen(false);
            setQuestionStatement("");
            setExplanation("");
            setAnswerOptions(["", "", "", ""]);
            setCorrectOptions([]);
            setFilters({
                subject: '', exam: '', language: '', tags: '', hours: '1', created_by: '', self: false,
            })
            fetchQuestions();
            enqueueSnackbar("Question created", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Question creation failed", {variant: 'error'});
            console.error('Error updating question:', error);
        }
    }

    const handleQuestionEditChange = (field, value) => {
        setQuestionToEdit(prev => ({...prev, [field]: value}));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...questionToEdit.options];
        newOptions[index] = value;
        handleQuestionEditChange('options', newOptions);
    };

    const handleCorrectOptionChange = (index) => {
        let newCorrectOptions = []
        if (questionToEdit.question_type === "m-select") {
            newCorrectOptions = questionToEdit.correct_options.includes(index.toString()) ? questionToEdit.correct_options.filter(i => i !== index.toString()) : [...questionToEdit.correct_options, index.toString()];
        } else if (questionToEdit.question_type === "m-choice") {
            newCorrectOptions = [index.toString()]
        }
        handleQuestionEditChange('correct_options', newCorrectOptions);
    };

    const handleTagsChange = (newTag) => {
        if (newTag && !questionToEdit.tags.includes(newTag)) {
            handleQuestionEditChange('tags', [...questionToEdit.tags, newTag]);
        }
    };

    const handleTagDelete = (tagToDelete) => {
        handleQuestionEditChange('tags', questionToEdit.tags.filter(tag => tag !== tagToDelete));
    };

    async function handleDeleteQuestion() {
        try {
            await axios.delete(`${fetchURL}/questions/${questionToEdit.id}`, {headers: getHeaders()});
            setDeleteConfirmModalOpen(false);
            setQuestions(prev => {
                return prev.filter((question) => question.id !== questionToEdit.id);
            })
            enqueueSnackbar("Question deleted successfully.", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Question delete failed", {variant: 'error'});
            console.error('Error updating question:', error);
        }
    }

    function toggleFloatingMenu() {
        setFloatingMenu(prev => !prev);
        // setTimeout(()=>{
        //     setFloatingMenu(false);
        // },4000)
    }

    return (<div className="container mx-auto px-4 py-8 max-w-7xl relative">
        {/* Filter Section */}
        <div
            className="z-[1000] shadow-lg floating-action-button fixed bottom-5 right-5 w-16 h-16 bg-red-400 text-white font-extrabold flex justify-center items-center rounded-[100rem] cursor-pointer"
            onClick={toggleFloatingMenu}
        >
            <FontAwesomeIcon icon={faPlus}/>
        </div>
        {floatingMenu && <div
            className="z-[1000] flex flex-col justify-center items-center fixed bottom-[6rem] right-5 h-24 w-48 bg-amber-400 shadow-md text-slate-700">
            <div
                className="bg-orange-200 h-full w-full border-b border-b-gray-300 flex justify-center items-center cursor-pointer hover:bg-orange-300"
                onClick={() => {
                    setNewQuestionDialogOpen(true)
                }}
            >
                New Question
            </div>
            <div
                className="bg-cyan-200 h-full w-full flex justify-center items-center cursor-pointer hover:bg-cyan-300"
                onClick={() => {
                    setNewQuizDialogOpen(true)
                }}
            >
                New Quiz
            </div>
        </div>}
        <div className="bg-white shadow-lg mb-4 py-4 px-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-full sm:w-48">
                    <select
                        name="hours"
                        value={filters.hours}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 appearance-none transition-all"
                    >
                        <option value="">Created In</option>
                        {hourOptions.map((option) => (<option key={option.value} value={option.value}>
                            {option.label}
                        </option>))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                    </div>
                </div>

                <button
                    onClick={toggleAdvancedFilters}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                >
                    <FontAwesomeIcon icon={showAdvancedFilters ? faChevronUp : faChevronDown}/>
                    {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.self}
                        onChange={handleChange}
                        name="self"
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">My Questions</span>
                </label>

                <button
                    onClick={fetchQuestions}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faFilter}/>
                    Apply Filters
                </button>

                <div className="text-gray-700">
                    {selectedQuestionIds.length} Questions selected
                </div>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ${showAdvancedFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {['subject', 'exam', 'language', 'tags', 'created_by'].map((field) => (<input
                            key={field}
                            type="text"
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                            name={field}
                            value={filters[field]}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-gray-700 placeholder-gray-400 transition-all"
                        />))}
                    </div>
                </div>
            </div>
        </div>

        {/* Questions Grid */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
            {questions && questions.map((q) => {
                const isOwner = q.created_by_id === userInfo.id;
                const isAdminOrOwner = userInfo.role === 'admin' || userInfo.role === 'owner' || isOwner;
                const isSelected = selectedQuestionIds.includes(q.id);

                return (<div
                    key={q.id}
                    onClick={() => {
                        setActiveQuestion(q);
                        setShowModal(true);
                    }}
                    className={`w-[25rem] h-[20rem] relative bg-white rounded-xl border shadow-sm p-6 transition-all duration-300 hover:shadow-xl ${isSelected ? 'border-indigo-500 border-2' : 'border-gray-200'}`}
                >
                    <div className="absolute top-4 left-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectQuestion(q.id)
                            }}
                            className="hover:text-indigo-500 transition-colors"
                        >
                            <FontAwesomeIcon
                                icon={isSelected ? faCheckSquare : faSquare}
                                className={`${isSelected ? 'text-indigo-500' : 'text-white'} border border-gray-600 w-6 h-6`}
                            />
                        </button>
                    </div>

                    {isAdminOrOwner && (<div
                        className="absolute top-4 right-4 flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        <button className="text-indigo-500 hover:text-indigo-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setQuestionToEdit(q);
                                    setEditModalOpen(true);
                                }}>
                            <FontAwesomeIcon icon={faEdit}/>
                        </button>
                        <button className="text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setQuestionToEdit(q);
                                    setDeleteConfirmModalOpen(true);
                                }}>
                            <FontAwesomeIcon icon={faTrash}/>
                        </button>
                    </div>)}

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">{q.question}</h3>

                        {q.tags?.length > 0 && (<div className="flex flex-wrap gap-2 mb-4">
                            {q.tags.map((tag, index) => (<span
                                key={index}
                                className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full"
                            >
                                                {tag}
                                            </span>))}
                        </div>)}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {[{label: 'Subject', value: q.subject}, {
                                label: 'Exam', value: q.exam
                            }, {label: 'Language', value: q.language}, {
                                label: 'Difficulty', value: q.difficulty
                            }, {label: 'Type', value: q.question_type}, {
                                label: 'Author', value: q.created_by_name
                            },].map(({label, value}) => (<div key={label}>
                                <p className="text-gray-500 text-xs font-medium">{label}</p>
                                <p className="text-gray-800 font-medium">{value || '—'}</p>
                            </div>))}
                        </div>
                    </div>
                </div>);
            })}
        </div>

        {(!questions || questions.length === 0) && (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm mt-8">
                <p className="text-gray-500 text-lg font-medium">
                    No questions found. Try adjusting your filters.
                </p>
            </div>)}

            <Dialog open={showModal} onClose={()=>{setShowModal(false)}} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                {activeQuestion && <div
                    className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">

                    <h2 className="text-xl font-bold mb-4">{activeQuestion.question}</h2>

                    <div className="mb-4">
                        <p><strong>Subject:</strong> {activeQuestion.subject}</p>
                        <p><strong>Exam:</strong> {activeQuestion.exam}</p>
                        <p><strong>Language:</strong> {activeQuestion.language}</p>
                        <p><strong>Difficulty:</strong> {activeQuestion.difficulty}</p>
                        <p><strong>Type:</strong> {activeQuestion.question_type}</p>
                        <p><strong>Author:</strong> {activeQuestion.created_by_name}</p>
                        <p><strong>Created At:</strong> {new Date(activeQuestion.created_at).toLocaleString()}</p>
                        <div><strong>Tags:</strong> {activeQuestion.tags?.join(', ') || '—'}</div>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Options:</h4>
                        <ul className="list-disc pl-6">
                            {activeQuestion.options.map((opt, idx) => (<li key={idx}>{opt}</li>))}
                        </ul>
                    </div>

                    {(userInfo.role === 'admin' || userInfo.role === 'owner' || activeQuestion.created_by_id === userInfo.id) && (
                        <div className="flex gap-4 mt-6">
                            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                    onClick={() => {
                                        setQuestionToEdit(activeQuestion);
                                        setEditModalOpen(true);
                                    }}>
                                Edit
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                    onClick={() => {
                                        setQuestionToEdit(activeQuestion);
                                        setDeleteConfirmModalOpen(true);
                                    }}
                            >
                                Delete
                            </button>
                        </div>)}
                </div>}
            </Dialog>
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}
                fullWidth
                sx={{'& .MuiDialog-paper': {minHeight: "15rem"}}}>
            <DialogTitle>Edit The Question</DialogTitle>
            <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                {questionToEdit && (<>
                    <TextField
                        label="Question"
                        value={questionToEdit.question}
                        onChange={(e) => handleQuestionEditChange('question', e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Subject"
                        value={questionToEdit.subject}
                        onChange={(e) => handleQuestionEditChange('subject', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Exam"
                        value={questionToEdit.exam}
                        onChange={(e) => handleQuestionEditChange('exam', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Language"
                        value={questionToEdit.language}
                        onChange={(e) => handleQuestionEditChange('language', e.target.value)}
                        fullWidth
                    >
                    </TextField>
                    <TextField
                        label="Difficulty"
                        value={questionToEdit.difficulty}
                        onChange={(e) => handleQuestionEditChange('difficulty', e.target.value)}
                        fullWidth
                    >
                    </TextField>
                    <TextField
                        select
                        label="Question Type"
                        value={questionToEdit.question_type}
                        onChange={(e) => handleQuestionEditChange('question_type', e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="m-choice">Multiple Choice</MenuItem>
                        <MenuItem value="m-select">Multi Select</MenuItem>
                        <MenuItem value="numeric">Numeric</MenuItem>
                    </TextField>
                    <div>
                        <h4 className="font-semibold mb-2">Options:</h4>
                        {questionToEdit.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <TextField
                                    label={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    fullWidth
                                />
                                <input
                                    type="checkbox"
                                    checked={questionToEdit.correct_options.includes(index.toString())}
                                    onChange={() => handleCorrectOptionChange(index)}
                                    className="w-5 h-5"
                                />
                            </div>))}
                    </div>
                    <TextField
                        label="Explanation"
                        value={questionToEdit.explanation || ''}
                        onChange={(e) => handleQuestionEditChange('explanation', e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <div>
                        <h4 className="font-semibold mb-2">Tags:</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {questionToEdit.tags.map((tag, index) => (<Chip
                                key={index}
                                label={tag}
                                onDelete={() => handleTagDelete(tag)}
                                color="primary"
                            />))}
                        </div>
                        <TextField
                            label="Add Tag"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleTagsChange(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                            fullWidth
                        />
                    </div>
                </>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setEditModalOpen(false)
                }}>Cancel</Button>
                <Button onClick={handleEditQuestion} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={deleteConfirmModalOpen} onClose={() => setDeleteConfirmModalOpen(false)}
                fullWidth
                sx={{'& .MuiDialog-paper': {minHeight: "15rem"}}}>
            <DialogTitle>Confirm delete?</DialogTitle>
            <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                {questionToEdit && (<>
                    Question: {questionToEdit.question}
                </>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setDeleteConfirmModalOpen(false)
                }}>Cancel</Button>
                <Button onClick={handleDeleteQuestion} variant="contained" color="primary">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog open={newQuestionDialogOpen} onClose={() => setNewQuestionDialogOpen(false)}
                sx={{'& .MuiDialog-paper': {minHeight: "15rem", minWidth: "80%", width: "100%", margin: "0"}}}>
            <DialogTitle>Create a new Question</DialogTitle>
            <DialogContent className="flex flex-col gap-4 mt-2">
                <div className={"flex flex-col lg:flex-row gap-4 border p-2"}>
                    <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-4">
                        <TextField
                            label="Question"
                            value={questionStatement}
                            onChange={(e) => setQuestionStatement(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
                            label="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Exam"
                            value={exam}
                            onChange={(e) => setExam(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            fullWidth
                        >
                        </TextField>
                        <TextField
                            label="Difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            fullWidth
                        >
                        </TextField>
                        <TextField
                            select
                            label="Question Type"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="m-choice">Multiple Choice</MenuItem>
                            <MenuItem value="m-select">Multi Select</MenuItem>
                            <MenuItem value="numeric">Numeric</MenuItem>
                        </TextField>
                    </div>
                    <div className={"w-full lg:w-1/2 flex flex-col"}>
                        <h4 className="font-semibold mb-2">Options:</h4>
                        {answerOptions.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <TextField
                                    label={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => setAnswerOptions(prevState => {
                                        const newOptions = [...prevState];
                                        newOptions[index] = e.target.value;
                                        return newOptions;
                                    })}
                                    fullWidth
                                />
                                <input
                                    type="checkbox"
                                    checked={correctOptions.includes(index)}
                                    onChange={() => setCorrectOptions(prevState => {
                                        if (questionType === "m-choice") {
                                            return [index]
                                        } else if (questionType === "m-select") {
                                            if (prevState.includes(index)) {
                                                return prevState.filter((option) => option !== index);
                                            } else {
                                                return [...prevState, index];
                                            }
                                        }
                                    })}
                                    className="w-5 h-5"
                                />
                            </div>))}
                        <TextField
                            label="Explanation"
                            value={explanation || ''}
                            onChange={(e) => setExplanation(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <div>
                            <h4 className="font-semibold mb-2">Tags:</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((tag, index) => (<Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => setTags(prevState => {
                                        return prevState.filter(t => t !== tag);
                                    })}
                                    color="primary"
                                />))}
                            </div>
                            <TextField
                                label="Add Tag"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setTags(prevState => {
                                            return [...prevState, e.target.value];
                                        });
                                    }
                                }}
                                fullWidth
                            />
                        </div>
                    </div>

                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setNewQuestionDialogOpen(false)
                }}>Cancel</Button>
                <Button onClick={handleCreateQuestion} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>


        <Dialog open={newQuizDialogOpen} onClose={() => setNewQuizDialogOpen(false)}
                fullWidth
                sx={{'& .MuiDialog-paper': {minHeight: "15rem"}}}>
            <DialogTitle>Confirm delete?</DialogTitle>
            <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                {questionToEdit && (<>
                    Question: {questionToEdit.question}
                </>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    setDeleteConfirmModalOpen(false)
                }}>Cancel</Button>
                <Button onClick={handleDeleteQuestion} variant="contained" color="primary">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    </div>);
}