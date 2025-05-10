"use client"
import React, {useState} from 'react';
import {enqueueSnackbar} from "notistack";
import {useSelector} from "react-redux";
import {usePathname, useRouter} from "next/navigation";
import axios from "axios";
import {fetchURL} from "@/constants";
import dynamic from "next/dynamic";
import {Box, Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import {white} from "next/dist/lib/picocolors";

const TimingOptions = dynamic(() => import("./timing_options"), {ssr: false});


async function createTest(questionSetID, token, router, timingEnabled, timingMode, secondsPerQuestion, totalTimeCapMinutes) {
    const headers = {
        "Content-Type": "application/json", Authorization: `Bearer ${token}`,
    };
    let mode = ""
    if (timingEnabled && timingMode === "total") {
        mode = "t_timed";
    } else if (timingEnabled && timingMode === "per-question") {
        mode = "q_timed";
    } else {
        mode = "untimed";
    }
    const data = {
        question_set_id: parseInt(questionSetID),
        randomize_questions: true,
        mode,
        seconds_per_question: timingMode === "per-question" ? parseInt(secondsPerQuestion) : 0,
        time_cap_seconds: timingMode === "total" ? parseInt(totalTimeCapMinutes)*60 : 0,
    };

    try {
        const response = await axios.post(`${fetchURL}/test_session`, data, {
            headers
        });

        enqueueSnackbar("Test session successfully created!");
        router.push(`/test/${response.data.test_session}`);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

function StartSessionControlBox({qid}) {
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const router = useRouter();
    const pathname = usePathname(); // Get current path
    const [timingEnabled, setTimingEnabled] = useState(false);
    const [timingMode, setTimingMode] = useState(""); // "per-question" or "total"
    const [secondsPerQuestion, setSecondsPerQuestion] = useState(10);
    const [totalTimeCapMinutes, setTotalTimeCapMinutes] = useState(60);
    return (<>
            <section className="mb-10">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">
                    ⏱️ Timed Mode Options
                </h3>

                <FormControlLabel
                    control={<Checkbox
                        checked={timingEnabled}
                        onChange={(e) => {
                            setTimingEnabled(e.target.checked);
                            if (!e.target.checked) {
                                setTimingMode("");
                            }
                        }}
                        color="primary"
                    />}
                    label={"Timed/Untimed"}
                />
                <Box className="mt-4 ml-4 p-4 border rounded-lg border-purple-200 bg-purple-50">
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Choose Timing Mode</FormLabel>
                        <RadioGroup
                            aria-label="timing-mode"
                            name="timing-mode"
                            value={timingMode}
                            onChange={(e) => setTimingMode(e.target.value)}
                        >
                            <FormControlLabel
                                value="per-question"
                                control={<Radio/>}
                                label="⏳ Timed per question"
                                disabled={!timingEnabled}
                            />
                            <FormControlLabel
                                value="total"
                                control={<Radio/>}
                                label="🕒 Total test time"
                                disabled={!timingEnabled}
                            />
                        </RadioGroup>
                    </FormControl>

                    {timingMode === "per-question" && (<Box className="mt-4 bg-white w-1/2">
                            <TextField
                                label="Seconds per question"
                                type="number"
                                value={secondsPerQuestion}
                                onChange={(e) => setSecondsPerQuestion(e.target.value)}
                                InputProps={{inputProps: {min: 1}}}
                                fullWidth
                                variant="outlined"
                                disabled={!timingEnabled}
                            />
                        </Box>)}

                    {timingMode === "total" && (<Box className="mt-4 bg-white  w-1/2">
                            <TextField
                                disabled={!timingEnabled}
                                label="Total time (minutes)"
                                type="number"
                                value={totalTimeCapMinutes}
                                onChange={(e) => setTotalTimeCapMinutes(e.target.value)}
                                InputProps={{inputProps: {min: 1}}}
                                fullWidth
                                variant="outlined"
                            />
                        </Box>)}
                </Box>
            </section>
            <button
                className="bg-[#167e82] uppercase text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300"
                onClick={() => {
                    if (Object.keys(userInfo).length === 0) {
                        enqueueSnackbar("Please sign in if you have an account. Sign up otherwise", {variant: "warning"})
                        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
                    } else {
                        createTest(qid, userInfo.token, router, timingEnabled, timingMode, secondsPerQuestion, totalTimeCapMinutes);
                    }
                }}
            >
                Start Quiz
            </button>
        </>);
}

export default StartSessionControlBox;