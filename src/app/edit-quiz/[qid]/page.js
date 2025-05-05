"use client";
import {useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {fetchURL} from "@/constants";
import {Chip, MenuItem, TextField, Button} from "@mui/material";
import {enqueueSnackbar} from "notistack";

function Page({params}) {
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;

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
    });

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    async function fetchQuizById() {
        try {
            const response = await axios.get(`${fetchURL}/questionsets/${params.qid}`, {
                headers: getHeaders(),
            });
            const data = response.data;
            setFormData({
                name: data.name || "",
                mode: data.mode || "practice",
                subject: data.subject || "",
                exam: data.exam || "",
                language: data.language || "",
                time_duration: data.time_duration || 40,
                description: data.description || "",
                associated_resource: data.associated_resource || "",
                tags: data.tags || [],
                question_ids: data.question_ids || [],
            });
        } catch (error) {
            console.error("Error fetching questionset:", error);
        }
    }

    async function handleSubmit() {
        try {
            const response = await axios.put(
                `${fetchURL}/questionsets/${params.qid}`,
                formData,
                {headers: getHeaders()}
            );
            enqueueSnackbar("Question set updated successfully!", {variant: "success"});
        } catch (error) {
            console.error("Failed to update question set:", error);
            enqueueSnackbar("Update failed. Please try again.", {variant: "error"});
        }
    }

    useEffect(() => {
        fetchQuizById();
    }, []);

    return (
        <main className="p-2 md:p-4">
            <div className="p-2 md:p-4 max-w-3xl lg:mx-auto bg-white ">
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

                <TextField
                    label="Question IDs"
                    fullWidth
                    margin="normal"
                    value={formData.question_ids.join(", ")}
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
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    className="mt-6"
                >
                    Save Changes
                </Button>
            </div>
        </main>
    );
}

export default Page;
