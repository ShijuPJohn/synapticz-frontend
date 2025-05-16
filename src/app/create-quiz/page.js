"use client"
import React, {useState} from 'react';
import axios from 'axios';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBars, faEdit, faListCheck, faPlus, faQuestion} from '@fortawesome/free-solid-svg-icons';
import {useSelector} from "react-redux";
import {fetchURL} from "@/constants";
import {
    Button, Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel, FormGroup,
    MenuItem,
    TextField
} from "@mui/material";
import {enqueueSnackbar} from "notistack";
import {useRouter} from "next/navigation";
import Image from "next/image";
import QuestionShowSelect from "@/components/question_show_select";
import {FiChevronDown} from "react-icons/fi";

export default function QuestionsPage() {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;

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
    const [qName, setQName] = useState("");
    const [qMode, setQMode] = useState("practice");
    const [qSubject, setQSubject] = useState("");
    const [qExam, setQExam] = useState("");
    const [qLanguage, setQLanguage] = useState("");
    const [qDuration, setQDuration] = useState(40);
    const [qDescription, setQDescription] = useState("");
    const [qAssociatedResource, setQAssociatedResource] = useState("");
    const [qTags, setQTags] = useState([]);
    const router = useRouter();
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [slug, setSlug] = useState("");
    const [accessLevel, setAccessLevel] = useState("free");
    const [creatorType, setCreatorType] = useState("admin");
    const [quizVerified, setQuizVerified] = useState(false);


    function getHeaders() {
        return {
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
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
            console.log("uploaded url", res.data.url)
        } catch (err) {
            console.error("Failed to upload image", err);
        } finally {
            setLoading(false);
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
            slug: slug,
            correct_options: correctOptions,
            explanation,
            tags,
            verified: quizVerified,
            creator_type: creatorType,
        }
        setLoading(true)
        try {
            await axios.post(`${fetchURL}/questions/`, data, {headers: getHeaders()});
            setNewQuestionDialogOpen(false);
            setQuestionStatement("");
            setExplanation("");
            setAnswerOptions(["", "", "", ""]);
            setCorrectOptions([]);
            // setFilters(prevState => {
            //     return {...filters, hours: 1}
            // })
            enqueueSnackbar("Question created", {variant: 'success'});
        } catch (error) {
            enqueueSnackbar("Question creation failed", {variant: 'error'});
            console.error('Error updating question:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateQuiz() {
        const data = {
            name: qName,
            mode: qMode,
            subject: qSubject,
            exam: qExam,
            language: qLanguage,
            time_duration: qDuration,
            description: qDescription,
            associated_resource: qAssociatedResource,
            question_ids: selectedQuestions,
            tags: qTags,
            cover_image: uploadedUrl,
            slug: slug,
            access_level: accessLevel,
            creator_type: creatorType,
        };
        setLoading(true);
        try {
            await axios.post(`${fetchURL}/questionsets/`, data, {headers: getHeaders()});
            enqueueSnackbar("Quiz created successfully", {variant: 'success'});
            setNewQuizDialogOpen(false);
            // Optional: reset form fields or refetch question sets
        } catch (error) {
            console.error("Error creating quiz:", error);
            enqueueSnackbar("Failed to create quiz", {variant: 'error'});
        } finally {
            setLoading(false);
        }
    }

    function toggleFloatingMenu() {
        setFloatingMenu(prev => !prev);
        setTimeout(() => {
            setFloatingMenu(false);
        }, 4000)
    }

    return (
        <div className="container mx-auto p-1 w-full relative">
            <div
                className="z-[1000] shadow-lg floating-action-button fixed bottom-5 right-5 w-16 h-16 bg-red-400 text-white font-extrabold flex justify-center items-center rounded-[100rem] cursor-pointer"
                onClick={toggleFloatingMenu}
            >
                <FontAwesomeIcon icon={faBars}/>
            </div>
            <Dialog open={floatingMenu} onClose={() => {
                setFloatingMenu(false)
            }}>
                <div
                    className="z-[1000] flex flex-col justify-center items-center fixed bottom-[6rem] right-5 h-40 w-56 bg-gray-200 shadow-md text-slate-700">
                    <div
                        className="h-full w-full flex justify-center gap-4 border-b   border-b-gray-300  items-center cursor-pointer hover:bg-cyan-300"
                        onClick={() => {
                            router.push("/bulk-create-questions")
                        }}
                    >
                        <FontAwesomeIcon icon={faListCheck}/>
                        Bulk Create Questions
                    </div>
                    <div
                        className=" h-full w-full border-b gap-4  border-b-gray-300 flex justify-center items-center cursor-pointer hover:bg-cyan-300"
                        onClick={() => {
                            setNewQuestionDialogOpen(true)
                        }}
                    ><FontAwesomeIcon icon={faQuestion}/>

                        New Question
                    </div>
                    <div
                        className=" h-full w-full border-b   border-b-gray-300  flex justify-center gap-4 items-center cursor-pointer hover:bg-cyan-300"
                        onClick={() => {
                            setNewQuizDialogOpen(true)
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus}/>
                        New Quiz
                    </div>
                    <div
                        className="h-full w-full flex justify-center gap-4  items-center cursor-pointer hover:bg-cyan-300"
                        onClick={() => {
                            router.push("/edit-quiz")
                        }}
                    >
                        <FontAwesomeIcon icon={faEdit}/>
                        Edit Quizzes
                    </div>

                </div>
            </Dialog>
            {/*{floatingMenu &&*/}
            {/*   }*/}
            {loading &&
                <div
                    className="loading-container absolute w-full h-full top-0 left-0 bg-[rgba(0,0,0,.2)] z-[1000] flex justify-center items-center">
                    <CircularProgress style={{width: '2rem', height: '2rem'}}/>
                </div>}

            <div className="bg-white shadow-lg mb-1 relative">
                <QuestionShowSelect setSelectedQIdsCallback={setSelectedQuestions} selectedQIds={selectedQuestions}
                                    initialFetchIds={[]} mode={"full_control"}
                />
            </div>


            <Dialog open={newQuestionDialogOpen} onClose={() => setNewQuestionDialogOpen(false)}
                    sx={{'& .MuiDialog-paper': {minHeight: "15rem", minWidth: "80%", width: "100%", margin: "0"}}}>
                <DialogTitle>Create a new Question</DialogTitle>
                <DialogContent className="flex flex-col lg:flex-row gap-4 mt-2 border p-2">
                    <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-4 mt-4">
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
                        ></TextField>
                        <TextField
                            label="Difficulty"
                            value={difficulty}
                            onChange={(e) => setDifficulty(parseInt(e.target.value))}
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

            <Dialog open={newQuizDialogOpen} onClose={() => setNewQuizDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        value={qName}
                        onChange={(e) => setQName(e.target.value)}
                    />
                    <TextField
                        label="URL Slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        fullWidth>
                    </TextField>
                    <TextField
                        select
                        label="Access Type"
                        fullWidth
                        margin="normal"
                        value={accessLevel}
                        onChange={(e) => setAccessLevel(e.target.value)}
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
                                value={creatorType}
                                onChange={(e) => setAccessLevel(e.target.value)}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="community">Community</MenuItem>
                                <MenuItem value="owner">Owner</MenuItem>
                            </TextField>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={quizVerified}
                                        onChange={(e) => setQuizVerified(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Verified"
                            /></div>
                    }

                    <TextField
                        select
                        label="Mode"
                        fullWidth
                        margin="normal"
                        value={qMode}
                        onChange={(e) => setQMode(e.target.value)}
                    >
                        <MenuItem value="practice">Practice</MenuItem>
                        <MenuItem value="exam">Exam</MenuItem>
                    </TextField>
                    <TextField
                        label="Subject(s)"
                        fullWidth
                        margin="normal"
                        value={qSubject}
                        onChange={(e) => setQSubject(e.target.value)}
                        helperText="Comma-separated for multiple subjects"
                    />
                    <TextField
                        label="Exam"
                        fullWidth
                        margin="normal"
                        value={qExam}
                        onChange={(e) => setQExam(e.target.value)}
                    />
                    <TextField
                        label="Language"
                        fullWidth
                        margin="normal"
                        value={qLanguage}
                        onChange={(e) => setQLanguage(e.target.value)}
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
                        value={qDuration}
                        onChange={(e) => setQDuration(Number(e.target.value))}
                    />
                    <TextField
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        margin="normal"
                        value={qDescription}
                        onChange={(e) => setQDescription(e.target.value)}
                    />
                    <TextField
                        label="Associated Resource (URL)"
                        fullWidth
                        margin="normal"
                        value={qAssociatedResource}
                        onChange={(e) => setQAssociatedResource(e.target.value)}
                    />
                    <div>
                        <h4 className="font-semibold mb-2">Tags:</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {qTags.map((tag, index) => (<Chip
                                key={index}
                                label={tag}
                                onDelete={() => setQTags(prevState => {
                                    return prevState.filter(t => t !== tag);
                                })}
                                color="primary"
                            />))}
                        </div>
                        <TextField
                            label="Add Tag"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setQTags(prevState => {
                                        return [...prevState, e.target.value];
                                    });
                                    e.target.value = '';
                                }

                            }}
                            fullWidth
                        />
                    </div>
                    <TextField
                        label="Question IDs"
                        fullWidth
                        margin="normal"
                        value={selectedQuestions}
                        disabled
                        // onChange={(e) => setQQuestionIds(e.target.value.split(",").map(id => parseInt(id.trim())))}
                        helperText="Comma-separated question IDs"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewQuizDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleCreateQuiz}>Create</Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}