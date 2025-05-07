"use client"
import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckSquare, faChevronDown, faChevronUp, faClose, faEdit, faFilter, faSquare, faTrash
} from "@fortawesome/free-solid-svg-icons";
import {
    Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField
} from "@mui/material";
import axios from "axios";
import {fetchURL} from "@/constants";
import {enqueueSnackbar} from "notistack";

function QuestionShowSelect({initialFetchIds, selectedQIds, setSelectedQIdsCallback, filters, setFilters}) {
    const [questions, setQuestions] = useState([]);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;
    const [showModal, setShowModal] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState(null);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [selectedQuestionsModalOpen, setSelectedQuestionsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [localFilters, setLocalFilters] = useState({
        subject: '', exam: '', language: '', tags: '', hours: '', created_by: '', self: false,
    });

    const hourOptions = [{label: '1 hour', value: '1'}, {label: '2 hours', value: '2'}, {
        label: '4 hours', value: '4'
    }, {label: '12 hours', value: '12'}, {label: '1 day', value: '24'}, {
        label: '2 days', value: '48'
    }, {label: '1 week', value: (24 * 7).toString()}, {
        label: '2 weeks', value: (24 * 14).toString()
    }, {label: '1 month', value: (24 * 30).toString()},];

    useEffect(() => {
        setLocalFilters(filters);
        fetchQuestions();
    }, [filters]);


    useEffect(() => {
        setSelectedQIdsCallback(selectedQuestions.map(question => question.id));
    }, [selectedQuestions])

    const handleSelectQuestion = (question) => {
        setSelectedQuestions((prev) => {
            if (prev.map(question => question.id).includes(question.id)) {
                return prev.filter((q) => q.id !== question.id);
            } else {
                return [...prev, {
                    id: question.id,
                    statement: question.question,
                    created_by: question.created_by_name,
                    created_time: question.created_at
                }]
            }
        })
    };

    async function fetchQuestionsInitial() {
        if (initialFetchIds.length > 0) {
            try {
                const response = await axios.get(`${fetchURL}/questions?qids=${initialFetchIds.join()}`, {headers: getHeaders()});
                setQuestions(response.data.questions);
                setSelectedQuestions(response.data.questions.map((question) => {
                    return {
                        id: question.id,
                        statement: question.question,
                        created_by: question.created_by_name,
                        created_time: question.created_at,
                    }
                }));
                setQuestionsCount(response.data.questions.length);
            } catch (error) {
                console.error('Error fetching questions:', error);
            } finally {
                setLoading(false);
            }
        }
    }

    const fetchQuestions = async () => {       //TODO
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        setLoading(true)
        try {
            const response = await axios.get(`${fetchURL}/questions?${params.toString()}`, {headers: getHeaders()});
            setQuestions(response.data.questions);
            setQuestionsCount(response.data.questions.length);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    useEffect(() => {
        if (initialFetchIds.length > 0) {
            fetchQuestionsInitial();
        } else {
            fetchQuestions();
        }
    }, []);

    const handleChangeFilters = (e) => {
        const {name, value, type, checked} = e.target;
        setLocalFilters({
            ...localFilters, [name]: type === 'checkbox' ? checked : value,
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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }

    function applyFilters() {
        setFilters(localFilters);
    }


    return (<div className="p-1 w-full">
        {/* Filter Section */}

        <div className="bg-white shadow-lg mb-1 py-4 px-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-full sm:w-48">
                    <select
                        name="hours"
                        value={localFilters.hours}
                        onChange={handleChangeFilters}
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
                        checked={localFilters.self}
                        onChange={handleChangeFilters}
                        name="self"
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">My Questions</span>
                </label>

                <button
                    onClick={applyFilters}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faFilter}/>
                    Apply Filters
                </button>

                <div className="cursor-pointer border-[1px] border-blue-900 rounded-lg p-2 text-blue-800"
                     onClick={() => {
                         setSelectedQuestionsModalOpen(true);
                     }}
                >
                    {selectedQuestions.length} Questions selected
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
                            value={localFilters[field]}
                            onChange={handleChangeFilters}
                            className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-gray-700 placeholder-gray-400 transition-all"
                        />))}
                    </div>
                </div>
            </div>
        </div>

        {/* Questions Grid */}
        <div className="flex flex-wrap gap-2 items-center px-2 justify-center w-full bg-white py-4">

            {questions && questions.map((q) => {
                const isOwner = q.created_by_id === userInfo.user_id;
                const isAdminOrOwner = userInfo.role === 'admin' || userInfo.role === 'owner' || isOwner;
                const isSelected = selectedQuestions.map(qstn => qstn.id).includes(q.id)

                return (<div
                    key={q.id}
                    onClick={() => {
                        setActiveQuestion(q);
                        setShowModal(true);
                    }}
                    className={`w-full md:w-[25rem] h-[20rem] relative bg-white rounded-xl border shadow-sm p-6 transition-all duration-300 hover:shadow-xl ${isSelected ? 'border-indigo-500 border-2' : 'border-gray-200'}`}
                >
                    <div className="absolute top-4 left-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectQuestion(q)
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

        <Dialog open={showModal} onClose={() => {
            setShowModal(false)
        }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {activeQuestion && <div
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto border border-gray-100">
                {/* Header with question icon */}
                <div className="flex items-start gap-3 mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <span className="text-blue-600 text-xl">❓</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{activeQuestion.question}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span>Question Details</span>
                        </div>
                    </div>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="text-purple-600 mt-0.5">
                            <span className="text-lg">📚</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Subject</p>
                            <p className="text-gray-800">{activeQuestion.subject}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-blue-600 mt-0.5">
                            <span className="text-lg">📝</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Exam</p>
                            <p className="text-gray-800">{activeQuestion.exam}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-green-600 mt-0.5">
                            <span className="text-lg">🌐</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Language</p>
                            <p className="text-gray-800">{activeQuestion.language}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-yellow-600 mt-0.5">
                            <span className="text-lg">📊</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Difficulty</p>
                            <p className="text-gray-800 capitalize">{activeQuestion.difficulty}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-red-600 mt-0.5">
                            <span className="text-lg">🔤</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="text-gray-800">{activeQuestion.question_type}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-indigo-600 mt-0.5">
                            <span className="text-lg">👤</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Author</p>
                            <p className="text-gray-800">{activeQuestion.created_by_name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-gray-600 mt-0.5">
                            <span className="text-lg">🕒</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Created At</p>
                            <p className="text-gray-800">{new Date(activeQuestion.created_at).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="text-pink-600 mt-0.5">
                            <span className="text-lg">🏷️</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Tags</p>
                            <p className="text-gray-800">{activeQuestion.tags?.join(', ') || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Options section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg text-gray-600">🔘</span>
                        <h4 className="font-semibold text-gray-700">Options</h4>
                    </div>
                    <ul className="space-y-2 pl-8">
                        {activeQuestion.options.map((opt, idx) => (<li key={idx}
                                                                       className="relative before:absolute before:-left-5 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-gray-400">
                            <div
                                className={`bg-gray-50 p-3 rounded-lg border border-gray-200 ${activeQuestion.correct_options.includes(idx.toString()) ? "bg-green-300" : "bg-gray-200"}`}>
                                <p className="text-gray-800">{opt}</p>
                            </div>
                        </li>))}
                    </ul>
                </div>

                {/* Action buttons */}
                {(userInfo.role === 'admin' || userInfo.role === 'owner' || activeQuestion.created_by_id === userInfo.id) && (
                    <div className="flex flex-wrap gap-3 mt-8 border-t pt-6">
                        <button
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            onClick={() => {
                                setQuestionToEdit(activeQuestion);
                                setEditModalOpen(true);
                            }}>
                            <span>✏️</span>
                            <span>Edit</span>
                        </button>
                        <button
                            className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                            onClick={() => {
                                setQuestionToEdit(activeQuestion);
                                setDeleteConfirmModalOpen(true);
                            }}>
                            <span>🗑️</span>
                            <span>Delete</span>
                        </button>
                    </div>)}
            </div>}
        </Dialog>
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}
                fullWidth
                sx={{'& .MuiDialog-paper': {minHeight: "15rem", minWidth: "80%", width: "100%", margin: "0"}}}>
            <DialogTitle>Edit The Question</DialogTitle>
            {questionToEdit && <DialogContent className="flex flex-col lg:flex-row gap-4 mt-2 border p-2">
                <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-4 mt-4">
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
                </div>
                <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-4">
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
                </div>
            </DialogContent>}
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

        <Dialog open={selectedQuestionsModalOpen} onClose={() => setSelectedQuestionsModalOpen(false)}
                fullWidth
                sx={{'& .MuiDialog-paper': {minHeight: "15rem", minWidth: "70%"}}}>
            <DialogTitle>Selected Questions</DialogTitle>
            <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                <div className="flex flex-col gap-2">
                    {selectedQuestions.map((question, index) => (<div
                        key={question.id}
                        className="flex justify-between items-center bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2"
                    >
                        <div
                            className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm w-full overflow-hidden">
                                <span className="font-medium text-gray-800 truncate">
                                  Q{index + 1}: {question.statement}
                                </span>
                            <span className="text-gray-500 hidden sm:inline">
                                  · Created by {question.created_by}
                                </span>
                            <span className="text-gray-400 hidden md:inline">
                                  · {new Date(question.created_time).toLocaleString("ml-IN")}
                                </span>
                        </div>

                        <button
                            onClick={() => setSelectedQuestions((prev) => prev.filter((q) => q.id !== question.id))}
                            className="ml-4 text-red-500 hover:text-red-700 text-sm font-medium"
                            title="Remove"
                        >
                            <FontAwesomeIcon icon={faClose}/>
                        </button>
                    </div>))}
                </div>

            </DialogContent>
            <DialogActions>

                <button onClick={() => setSelectedQuestionsModalOpen(false)} variant="contained" color="primary">
                    Close
                </button>
            </DialogActions>
        </Dialog>
        {loading &&
            <div className="loading-container absolute w-full h-full top-0 left-0 bg-[rgba(0,0,0,.2)] z-[1000] flex justify-center items-start">
                <CircularProgress style={{ width: '10rem', height: '10rem' }} />
            </div>}
    </div>);
}

export default QuestionShowSelect;