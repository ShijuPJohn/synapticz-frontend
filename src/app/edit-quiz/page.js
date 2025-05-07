"use client";

import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useRouter, useSearchParams} from "next/navigation";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import QuestionSetSearch from "@/components/question_set_search";
import {useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import {Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faListCheck} from "@fortawesome/free-solid-svg-icons";
import QuestionShowSelect from "@/components/question_show_select";
import Image from "next/image";

const Page = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("search")?.toLowerCase() || "";
    const [fetched, setFetched] = useState(false);
    const [questionSets, setQuestionSets] = useState([]);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;
    const [showEditModal, setShowEditModal] = useState(false);
    const router = useRouter();
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [filters, setFilters] = useState({
        subject: '', exam: '', language: '', tags: '', hours: '', created_by: '', self: false,
    });
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
        coverImage: ""
    });

    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    useEffect(() => {
        const fetchSets = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${fetchURL}/questionsets?search=${searchTerm}&uid=${userInfo.user_id}`);
                const sets = res.data.map(item => ({
                    ...item,
                    coverImage: item.coverImage || "/images/placeholder_book.png",
                }));
                setQuestionSets(sets);
            } catch (err) {
                console.error("Failed to fetch sets:", err);
            } finally {
                setLoading(false);
            }
            setFetched(true)
        };
        fetchSets();
    }, [searchTerm]);

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
                        ? {...qSet, ...formData, coverImage: uploadedUrl?uploadedUrl:currentQuiz.coverImage}
                        : qSet
                );
            });
            setUploadedUrl(null);
            setShowEditModal(false);
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


    return (
        <>
            <main className="">
                <QuestionSetSearch searchTerm={searchTerm}/>

                {loading ? (
                    <p className="text-center text-gray-500">Loading question sets...</p>
                ) : (
                    questionSets.length > 0 ? (
                        questionSets.map((set, index) => (
                            <QuestionSetCard key={set.id} questionSet={set}
                                             editDeleteButtons={userInfo.role === "owner" || userInfo.role === "admin" || userInfo.user_id === parseInt(set.created_by_id)}
                                             setCurrentQuizCallback={setCurrentQuiz}
                                             openEditModalCallback={setShowEditModal}
                                             openDeleteModalCallback={setDeleteConfirmModalOpen}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No question sets found.</p>
                    )
                )}
            </main>
            <Dialog open={deleteConfirmModalOpen} onClose={() => setDeleteConfirmModalOpen(false)}
                    fullWidth
                    sx={{'& .MuiDialog-paper': {minHeight: "15rem"}}}>
                <DialogTitle>Confirm delete?</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                    {currentQuiz && (<>
                        Question: {currentQuiz.name}
                    </>)}
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


            <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            minHeight: "15rem",
                            height: "100%",
                            minWidth: "50%",
                            width: "65%",
                            margin: "0"
                        }
                    }}>
                <DialogTitle>Edit the Quiz</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                    <div className="p-2 max-w-3xl lg:mx-auto bg-white ">
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


                        <div className="flex items-center gap-4">
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
                                value={(selectedQuestions || []).join(", ")}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        question_ids: e.target.value
                                            .split(",")
                                            .map((id) => parseInt(id.trim()))
                                            .filter((id) => !isNaN(id)),
                                    })
                                }
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

            {currentQuiz && <Dialog open={showQuestionsModal} onClose={() => setShowQuestionsModal(false)}
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
                    <QuestionShowSelect initialFetchIds={currentQuiz.question_ids} selectedQIds={selectedQuestions}
                                        setSelectedQIdsCallback={setSelectedQuestions} filters={filters} setFilters={setFilters}/>
                </DialogContent>
                <DialogActions>
                    <Button variant={"contained"} onClick={() => {
                        setShowQuestionsModal(false);
                    }}>Done</Button>
                </DialogActions>
            </Dialog>}


        </>
    );
};

export default Page;
