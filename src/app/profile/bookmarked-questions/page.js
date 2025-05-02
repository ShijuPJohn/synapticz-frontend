"use client";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionCard from "@/components/question_card";
import ConfirmModal from "@/components/confirm_modal";
import {enqueueSnackbar} from "notistack";

export default function BookmarksPage() {
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;

    const [bookmarks, setBookmarks] = useState([]);
    const [selectedId, setSelectedId] = useState(null); // for modal
    const [showModal, setShowModal] = useState(false);

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo?.token}`
        };
    }

    async function fetchBookmarks() {
        try {
            const response = await axios.get(`${fetchURL}/bookmarks/`, {
                headers: getHeaders()
            });
            setBookmarks(response.data.bookmarks);
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    async function removeBookmark(id) {
        try {
            await axios.delete(`${fetchURL}/bookmarks/${id}`, {
                headers: getHeaders()
            });
            setBookmarks(prev => prev.filter(q => q.id !== id));
            enqueueSnackbar("Bookmark removed", {variant: "success"});
        } catch (error) {
            enqueueSnackbar("Error removing bookmark", {variant: "error"});
            console.error('Error removing bookmark:', error.response ? error.response.data : error.message);
        }
    }

    useEffect(() => {
        fetchBookmarks();
    }, []);

    function confirmRemove(id) {
        setSelectedId(id);
        setShowModal(true);
    }

    function handleConfirm() {
        if (selectedId !== null) {
            removeBookmark(selectedId);
            setShowModal(false);
            setSelectedId(null);
        }
    }

    function handleCancel() {
        setShowModal(false);
        setSelectedId(null);
    }

    return (
        <div className="p-4 space-y-4 bg-white">
            <h2 className="text-2xl font-bold">Your Bookmarked Questions</h2>
            {bookmarks.length === 0 ? (
                <p className="text-gray-500">No bookmarks found.</p>
            ) : (
                bookmarks.map((question) => (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        onRemove={() => confirmRemove(question.id)}
                    />
                ))
            )}
            {showModal && (
                <ConfirmModal
                    message="Are you sure you want to remove this bookmark?"
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}