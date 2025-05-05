"use client";

import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useRouter, useSearchParams} from "next/navigation";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import QuestionSetSearch from "@/components/question_set_search";
import {useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";

const Page = () => {
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("search")?.toLowerCase() || "";

    const [questionSets, setQuestionSets] = useState([]);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;
    const router = useRouter();

    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const res = await axios.get(`${fetchURL}/questionsets?search=${searchTerm}&uid=${userInfo.user_id}`);
                console.log("fetched data", res.data)
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
        };

        fetchSets();
    }, [searchTerm]);

    async function handleDeleteQuiz() {
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
        }
    }

    // function handleEditQuiz() {
    //     router.push(`/edit-quiz/${currentQuiz.id}`);
    // }

    return (
        <>
            <main className="">
                <QuestionSetSearch searchTerm={searchTerm}/>

                {loading ? (
                    <p className="text-center text-gray-500">Loading question sets...</p>
                ) : (
                    questionSets.length > 0 ? (
                        questionSets.map(set => (
                            <QuestionSetCard key={set.id} questionSet={set}
                                             editDeleteButtons={userInfo.role === "owner" || userInfo.role === "admin" || userInfo.user_id === parseInt(set.created_by_id)}
                                             setCurrentQuizCallback={setCurrentQuiz}
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
        </>
    );
};

export default Page;
