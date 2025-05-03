"use client"
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import axios from "axios";
import {fetchURL} from "@/constants";
import ConfirmModal from "@/components/confirm_modal";
import {CheckCircle, Eye, EyeOff, Trash2, Pencil} from "lucide-react";
import {enqueueSnackbar} from "notistack";
import {TextareaAutosize} from "@mui/material";

export default function SavedExplanationsPage() {
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;

    const [explanations, setExplanations] = useState([]);
    const [showDetails, setShowDetails] = useState({});
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    function getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo?.token}`
        };
    }

    async function fetchExplanations() {
        try {
            const response = await axios.get(`${fetchURL}/explanations/`, {
                headers: getHeaders()
            });
            setExplanations(response.data.saved_explanations);
        } catch (error) {
            console.error('Error fetching:', error.response?.data || error.message);
        }
    }

    async function updateExplanation(id, newText) {
        try {
            await axios.put(`${fetchURL}/explanations/${id}`, {explanation: newText}, {
                headers: getHeaders()
            });
            setExplanations(prev =>
                prev.map(e => e.id === id ? {...e, explanation: newText} : e)
            );
            setShowEditModal(false);
            enqueueSnackbar("Explanation updated successfully", {variant: "success"});
        } catch (error) {
            enqueueSnackbar("Error updating explanation", {variant: "error"});
            console.error('Update failed:', error.response?.data || error.message);
        }
    }

    async function deleteExplanation(id) {
        try {
            await axios.delete(`${fetchURL}/explanations/${id}`, {
                headers: getHeaders()
            });
            setExplanations(prev => prev.filter(e => e.id !== id));
            setShowDeleteModal(false);
            enqueueSnackbar("Explanation deleted", {variant: "success"});
        } catch (error) {
            enqueueSnackbar("Error deleting explanation", error.message);
            console.error('Delete failed:', error.response?.data || error.message);
        }
    }

    function toggleDetails(id) {
        setShowDetails(prev => ({...prev, [id]: !prev[id]}));
    }

    function handleEdit(id, currentText) {
        setEditId(id);
        setEditText(currentText);
        setShowEditModal(true);
    }

    function handleDelete(id) {
        setDeleteId(id);
        setShowDeleteModal(true);
    }

    useEffect(() => {
        fetchExplanations();
    }, []);

    return (
        <div className="p-4  mx-auto space-y-4 bg-white min-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">Your Saved Explanations</h2>

            {explanations.length === 0 ? (
                <p className="text-gray-500">No saved explanations found.</p>
            ) : (
                explanations.map(exp => (
                    <div key={exp.id} className="rounded-2xl shadow-md border border-gray-200 bg-white p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <strong className="text-yellow-900">Explanation:</strong>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(exp.id, exp.explanation)}
                                        className="text-blue-600 hover:text-blue-800">
                                    <Pencil className="w-5 h-5" title="Edit explanation"/>
                                </button>
                                <button onClick={() => handleDelete(exp.id)}
                                        className="text-red-600 hover:text-red-800">
                                    <Trash2 className="w-5 h-5" title="Delete explanation"/>
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-yellow-800">{exp.explanation}</p>

                        <button
                            className="text-sm text-indigo-600 hover:underline"
                            onClick={() => toggleDetails(exp.id)}
                        >
                            {showDetails[exp.id] ? (
                                <span className="inline-flex items-center gap-1"><EyeOff className="w-4 h-4"/> Hide Question</span>
                            ) : (
                                <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4"/> Show Question</span>
                            )}
                        </button>

                        {showDetails[exp.id] && (
                            <div className="mt-3 space-y-2">
                                <h3 className="text-gray-800 font-semibold">{exp.question}</h3>
                                {exp.options.map((opt, index) => {
                                    const isCorrect = exp.correct_options.includes(index);
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center px-3 py-2 rounded-md text-sm ${
                                                isCorrect
                                                    ? "bg-green-100 text-green-800 font-medium"
                                                    : "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {isCorrect && <CheckCircle className="w-4 h-4 mr-2 text-green-600"/>}
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))
            )}

            {/* Confirm Delete Modal */}
            {showDeleteModal && (
                <ConfirmModal
                    message="Are you sure you want to delete this saved explanation?"
                    onConfirm={() => deleteExplanation(deleteId)}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {/* Edit Explanation Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
                        <h3 className="text-lg font-semibold">Edit Explanation</h3>
                        <TextareaAutosize
                            className="w-full border border-gray-300 p-2 rounded-md text-sm"
                            rows={4}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateExplanation(editId, editText)}
                                className="px-4 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
