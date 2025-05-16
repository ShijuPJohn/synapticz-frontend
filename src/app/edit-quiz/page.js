"use client";

import React, {useEffect, useRef, useState} from 'react';
import axios from "axios";
import {useRouter, useSearchParams} from "next/navigation";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import QuestionSetSearch from "@/components/question_set_search";
import {useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import {
    Button, Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    TextField
} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faArrowRight,
    faChevronDown,
    faChevronUp,
    faEdit, faEraser,
    faFilter,
    faListCheck, faSearch,
    faTrash,
    faWarning
} from "@fortawesome/free-solid-svg-icons";
import QuestionShowSelect from "@/components/question_show_select";
import Image from "next/image";

import {Suspense} from 'react';

const EditQuizComponent = () => {
    const searchParams = useSearchParams();
    const [fetched, setFetched] = useState(false);
    const [questionSets, setQuestionSets] = useState([]);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState({});
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;
    const [showEditModal, setShowEditModal] = useState(false);
    const router = useRouter();
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        mode: "practice",
        subject: "",
        exam: "",
        language: "",
        time_duration: 40,
        description: "",
        associated_resource: "",
        tags: [],
        question_ids: [],
        coverImage: "",
        slug: ""
    });

    const [localFilters, setLocalFilters] = useState({
        subject: '', exam: '', language: '', tags: '', created_by: '', self: false, page: 1, search: '',
    });
    const searchInputRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [noQs, setNoQs] = useState(10);
    const [totalNumberOfPages, setTotalNumberOfPages] = useState(0);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // const [accessLevel, setAccessLevel] = useState("premium");

    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    const fetchSets = async (fltrs = localFilters) => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.entries(fltrs).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });
        try {
            const res = await axios.get(`${fetchURL}/questionsets?${params.toString()}&uid=${userInfo.user_id}`);
            const sets = res.data.data.map(item => ({
                ...item,
                coverImage: item.coverImage || "/images/placeholder_book.png",
            }));
            setTotalNumberOfPages(res.data.pagination.total_pages)
            setQuestionSets(sets);
        } catch (err) {
            console.error("Failed to fetch sets:", err);
        } finally {
            setLoading(false);
        }
        setFetched(true)
    };

    // useEffect(() => {
    //     fetchSets();
    // }, [searchTerm]);

    async function handleDeleteQuiz() {
        setLoading(true);
        try {
            await axios.delete(`${fetchURL}/questionsets/${currentQuiz.id}`, {headers: getHeaders()});
            setDeleteConfirmModalOpen(false);
            setQuestionSets(prev => {
                return prev.filter((qSet) => qSet.id !== currentQuiz.id);
            })
            enqueueSnackbar("Quiz deleted successfully.", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Quiz delete failed", {variant: 'error'});
            console.error('Error updating question:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        setLoading(true);
        try {
            const response = await axios.put(
                `${fetchURL}/questionsets/${currentQuiz.id}`,
                {...formData, cover_image: uploadedUrl},
                {headers: getHeaders()}
            );

            // Update the questionSets state properly
            setQuestionSets(prev => {
                return prev.map(qSet =>
                    qSet.id === currentQuiz.id
                        ? {
                            ...qSet, ...formData,
                            coverImage: uploadedUrl ? uploadedUrl : currentQuiz.coverImage,
                            slug: formData.slug
                        }
                        : qSet
                );
            });
            setUploadedUrl(null);
            setShowEditModal(false);
            setSelectedQuestions([])
            enqueueSnackbar("Question set updated successfully!", {variant: "success"});
        } catch (error) {
            console.error("Failed to update questionSet set:", error);
            enqueueSnackbar("Update failed. Please try again.", {variant: "error"});
        } finally {
            setLoading(false);
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCoverImagePreview(URL.createObjectURL(file));

        const formDataImg = new FormData();
        formDataImg.append("file", file);
        setLoading(true);
        try {
            const res = await axios.post(`${fetchURL}/image-upload`, formDataImg, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });
            enqueueSnackbar("Image uploaded successfully.", {variant: "success"});
            setUploadedUrl(res.data.url);
        } catch (err) {
            console.error("Failed to upload image", err);
        } finally {
            setLoading(false);
        }
    };
// Update the useEffect for form data initialization
    useEffect(() => {
        if (currentQuiz) {
            setFormData({
                name: currentQuiz.name || "",
                mode: currentQuiz.mode || "practice",
                subject: currentQuiz.subject || "",
                exam: currentQuiz.exam || "",
                language: currentQuiz.language || "",
                time_duration: currentQuiz.time_duration || 40,
                description: currentQuiz.description || "",
                associated_resource: currentQuiz.associated_resource || "",
                tags: currentQuiz.tags || [],
                question_ids: Array.isArray(currentQuiz.question_ids) ? currentQuiz.question_ids : [],
                coverImage: currentQuiz.coverImage || "/images/placeholder_book.png",
                slug: currentQuiz.slug || "",
                verified: currentQuiz.verified || false,
                creator_type: currentQuiz.creator_type || "",
                access_level: currentQuiz.access_level || "",
            });
            setSelectedQuestions(Array.isArray(currentQuiz.question_ids) ? currentQuiz.question_ids : []);
            setCoverImagePreview(currentQuiz.coverImage);
        }
    }, [currentQuiz]);

// Add this useEffect to sync selectedQuestions with formData
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            question_ids: selectedQuestions
        }));
    }, [selectedQuestions]);

    const toggleAdvancedFilters = () => {
        if (showAdvancedFilters) {
            setLocalFilters({
                subject: '', exam: '', language: '', tags: '', created_by: '', self: false, page: 1,
            })
        } else {
            setLocalFilters(prevState => ({...prevState, search: ''}))
            searchInputRef.current.value = "";
        }
        setShowAdvancedFilters(!showAdvancedFilters);
    };
    const handleChangeFilters = (e) => {
        const {name, value, type, checked} = e.target;
        setLocalFilters({
            ...localFilters, [name]: type === 'checkbox' ? checked : value,
        });
    };

    function applyFilters() {
        fetchSets();
    }

    function prevPageHandler() {
        setCurrentPage(prevState => {
            return prevState - 1;
        });
    }

    function nextPageHandler() {
        setCurrentPage(prevState => prevState + 1);
    }

    useEffect(() => {
        const updatedFilters = {
            ...localFilters,
            page: currentPage,
        };
        setLocalFilters(updatedFilters);
        fetchSets(updatedFilters);
    }, [currentPage]);

    return (
        <div className="w-full">
            <main className="w-full">
                <div
                    className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] bg-[rgba(255,255,255,.6)] shadow-lg  p-2 md:p-4 rounded-2xl mb-2 border-[1px] border-gray-400">
                    <div className="flex flex-wrap items-center justify-start gap-2">
                        <input
                            className={"w-[60%] lg:w-[70%] rounded-2xl outline-none border-[1px] border-gray-400 bg-[rgba(255,255,255,.2)] p-2"}
                            placeholder={"Search..."}
                            name={"search"}
                            onChange={handleChangeFilters}
                            type={"text"}
                            ref={searchInputRef}
                        />
                        <button
                            onClick={applyFilters}
                            className="flex items-center gap-2 h-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faSearch}/>
                        </button>

                        <button
                            onClick={toggleAdvancedFilters}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-400 hover:bg-slate-500 transition-colors text-gray-700 font-medium"
                        >
                            <FontAwesomeIcon icon={showAdvancedFilters ? faEraser : faFilter}/>
                            <span
                                className={"hidden md:block"}>{showAdvancedFilters ? 'Clear Filters' : 'Filters'}</span>
                        </button>
                    </div>

                    <div
                        className={`overflow-hidden transition-all duration-300 ${showAdvancedFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {['subject', 'exam', 'language', 'tags', 'created_by', 'resource'].map((field) => (
                                    <input
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
                {loading ?
                    <p className="text-center text-gray-500">Loading question sets...</p>
                    : questionSets.length > 0 ? (<div className={"w-full md:w-[80%] lg:w-[70%] xl:w-[60%]"}>

                            <div className={"w-full  flex flex-col gap-3"}>{
                                questionSets.map((set, index) => (
                                    <QuestionSetCard key={set.id} questionSet={set}
                                                     editDeleteButtons={userInfo.role === "owner" || userInfo.role === "admin" || userInfo.user_id === parseInt(set.created_by_id)}
                                                     setCurrentQuizCallback={setCurrentQuiz}
                                                     openEditModalCallback={() => {
                                                         setShowEditModal(true)
                                                         setCurrentQuiz(set)
                                                         setSelectedQuestions(set.question_ids)
                                                     }}
                                                     openDeleteModalCallback={setDeleteConfirmModalOpen}
                                    />
                                ))
                            }</div>
                            {totalNumberOfPages > 1 &&
                                <div className="pagination-buttons-container w-full flex justify-center items-center gap-2">
                                    <Button className={"flex gap-2 w-28"} variant={"contained"}
                                            disabled={currentPage <= 1}
                                            onClick={prevPageHandler}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft}/>Previous
                                    </Button>
                                    {`${currentPage}/${totalNumberOfPages}`}
                                    <Button className={"flex gap-2 w-28"} variant={"contained"}
                                            disabled={currentPage >= totalNumberOfPages}
                                            onClick={nextPageHandler}
                                    >
                                        Next<FontAwesomeIcon icon={faArrowRight}/>
                                    </Button>
                                </div>}
                        </div>) :
                        <p className="text-center text-gray-500">No question sets found.</p>

                }
            </main>
            <Dialog open={deleteConfirmModalOpen} onClose={() => setDeleteConfirmModalOpen(false)}
                    fullWidth
                    sx={{'& .MuiDialog-paper': {minHeight: "15rem", minWidth: "80%", width: "100%", margin: "0"}}}>
                <DialogTitle><FontAwesomeIcon size={"xl"} className={"text-red-800"} icon={faWarning}/> Confirm delete?</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                    {currentQuiz && (<>
                        Question: {currentQuiz.name}
                    </>)}

                    <p className={"text-red-800"}> Remember! This quiz will be permanently deleted.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDeleteConfirmModalOpen(false);
                    }}>Cancel</Button>
                    <Button onClick={handleDeleteQuiz} variant="contained" color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={showEditModal} onClose={() => {
                setShowEditModal(false)
                setSelectedQuestions([])
            }}
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            minHeight: "15rem",
                            height: "100%",
                            width: "100%",
                            margin: "0"
                        }
                    }}>
                <DialogTitle>Edit the Quiz</DialogTitle>
                <DialogContent className="w-full flex flex-col gap-4 mt-2 py-4">
                    <div className="w-full lg:mx-auto bg-white ">
                        <TextField
                            label="Name"
                            fullWidth
                            margin="normal"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <TextField
                            select
                            label="Mode"
                            fullWidth
                            margin="normal"
                            value={formData.mode}
                            onChange={(e) => setFormData({...formData, mode: e.target.value})}
                        >
                            <MenuItem value="practice">Practice</MenuItem>
                            <MenuItem value="exam">Exam</MenuItem>
                        </TextField>
                        <TextField
                            label="Subject"
                            fullWidth
                            margin="normal"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                        <TextField
                            label="Exam"
                            fullWidth
                            margin="normal"
                            value={formData.exam}
                            onChange={(e) => setFormData({...formData, exam: e.target.value})}
                        />
                        <TextField
                            label="Language"
                            fullWidth
                            margin="normal"
                            value={formData.language}
                            onChange={(e) => setFormData({...formData, language: e.target.value})}
                        />
                        <TextField
                            label="URL Slug"
                            fullWidth
                            margin="normal"
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        />
                        <TextField
                            select
                            label="Access Type"
                            fullWidth
                            margin="normal"
                            value={formData.access_level}
                            onChange={e => {
                                setFormData({...formData, access_level: e.target.value})
                            }}
                        >
                            <MenuItem value="free">Free</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                        </TextField>
                        {userInfo.role === "admin" || userInfo.role === "owner" &&
                            <div>
                                <TextField
                                    select
                                    label="Creator Type"
                                    fullWidth
                                    margin="normal"
                                    value={formData.creator_type}
                                    onChange={(e) => {
                                        setFormData({...formData, creatorType: e.target.value});
                                    }}
                                >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="community">Community</MenuItem>
                                    <MenuItem value="owner">Owner</MenuItem>
                                </TextField>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.verified}
                                            onChange={(e) => {
                                                setFormData({...formData, verified: e.target.checked});
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label="Verified"
                                /></div>
                        }
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="w-36 h-36 rounded-full overflow-hidden border border-slate-200 shadow">
                                {coverImagePreview ? (
                                    <Image
                                        src={coverImagePreview}
                                        alt="Profile"
                                        width={144}
                                        height={144}
                                        priority
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200"/>
                                )}
                            </div>
                            <label className="cursor-pointer text-blue-600 text-lg">
                                <FontAwesomeIcon icon={faEdit}/> Change Cover Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>


                        <TextField
                            type="number"
                            label="Time Duration (in minutes)"
                            fullWidth
                            margin="normal"
                            value={formData.time_duration}
                            onChange={(e) =>
                                setFormData({...formData, time_duration: Number(e.target.value)})
                            }
                        />
                        <TextField
                            label="Description"
                            multiline
                            rows={4}
                            fullWidth
                            margin="normal"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({...formData, description: e.target.value})
                            }
                        />
                        <TextField
                            label="Associated Resource (URL)"
                            fullWidth
                            margin="normal"
                            value={formData.associated_resource}
                            onChange={(e) =>
                                setFormData({...formData, associated_resource: e.target.value})
                            }
                        />

                        <div className="my-4">
                            <h4 className="font-semibold mb-2">Tags:</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        onDelete={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tags: prev.tags.filter((t) => t !== tag),
                                            }));
                                        }}
                                        color="primary"
                                    />
                                ))}
                            </div>
                            <TextField
                                label="Add Tag"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value.trim()) {
                                        e.preventDefault();
                                        if (!formData.tags.includes(e.target.value.trim())) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tags: [...prev.tags, e.target.value.trim()],
                                            }));
                                        }
                                        e.target.value = "";
                                    }
                                }}
                                fullWidth
                            />
                        </div>

                        <div className="flex items-center justify-center gap-4 ">
                            {currentQuiz && <TextField
                                label="Question IDs"
                                fullWidth
                                margin="normal"
                                disabled
                                value={(selectedQuestions || []).join(", ")}
                                // onChange={(e) =>
                                //     setFormData({
                                //         ...formData,
                                //         question_ids: e.target.value
                                //             .split(",")
                                //             .map((id) => parseInt(id.trim()))
                                //             .filter((id) => !isNaN(id)),
                                //     })
                                // }
                                helperText="Comma-separated question IDs"
                            />}
                            <FontAwesomeIcon icon={faListCheck} size={"xl"}
                                             className={"text-white bg-blue-600 p-2 rounded-md shadow-md mb-2 hover:bg-blue-700 cursor-pointer"}
                                             onClick={() => {
                                                 setShowQuestionsModal(true)
                                             }}
                            />
                        </div>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowEditModal(false);
                    }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showQuestionsModal} onClose={() => {
                setShowQuestionsModal(false)
            }}
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            minHeight: "15rem",
                            height: "100%",
                            minWidth: "98%",
                            width: "100%",
                            margin: "0"
                        }
                    }}>
                <DialogTitle>Select Questions</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                    <QuestionShowSelect
                        mode={"edit"}
                        initialFetchIds={currentQuiz.question_ids}
                        setSelectedQIdsCallback={setSelectedQuestions}

                    />
                </DialogContent>
                <DialogActions>
                    <Button variant={"contained"} onClick={() => {
                        setShowQuestionsModal(false);
                    }}>Done</Button>
                </DialogActions>
            </Dialog>


        </div>
    );
};

function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditQuizComponent/>
        </Suspense>
    );
}

export default Page;
