'use client';
import React, {useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {
    IconButton,
    InputAdornment,
    TextField,
    Modal,
    Box,
} from "@mui/material";
import Link from "next/link";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {signupThunk, verifyEmailThunk} from "@/redux/authSlice"; // <-- You'll need to add verifyEmailThunk
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/navigation";
import Image from "next/image";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {fetchURL} from "@/constants";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    p: 4,
};

const LoginPage = () => {
    const {register, formState: {errors}, handleSubmit} = useForm();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const [id, setId] = useState(0);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;

    const [pendingVerification, setPendingVerification] = useState(false);
    const [emailForVerification, setEmailForVerification] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    useEffect(() => {
        if (userInfo?.token) {
            router.push('/profile/edit');
        }
    }, [userInfo]);

    const onSubmit = async (data) => {
        setEmailForVerification(data.email);
        setId(data.id);
        setPendingVerification(true);
        setModalOpen(true);
        dispatch(signupThunk(data.username, data.email, data.password));
    };

    const handleVerificationCodeSubmit = async () => {
        try {
            const resultAction = await dispatch(
                verifyEmailThunk({email: emailForVerification, code: verificationCode})
            );
        } catch (err) {
            enqueueSnackbar("Verification failed. Please check the code and try again.",{variant:"error"});
        }
    };

    const [canResend, setCanResend] = useState(false);
    const [timer, setTimer] = useState(45);

// Countdown
    useEffect(() => {
        if (!modalOpen) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [modalOpen]);

    const handleResendCode = async () => {
        try {
            await axios.post(`${fetchURL}/auth/users/resend-verification`, {
                id,
                email: emailForVerification,
            });
            setCanResend(false);
            setTimer(45);
        } catch (err) {
            console.error("Resend failed:", err);
            enqueueSnackbar("Failed to resend code. Try again later.", {variant: "error"});
        }
    };


    return (
        <>
            <title>Signup | Synapticz.com</title>
            <main>
                <div
                    className="signup-form-main-container flex flex-col md:flex-row rounded-lg bg-white p-2 w-full md:w-[45%] md:min-h-[30rem] shadow-lg">
                    <div className="hidden md:flex md:w-1/3 relative">
                        <Image
                            src="/images/neural_network.jpg"
                            alt="Neural Network"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col items-center justify-around">
                        <h3 className="text-2xl font-light text-gray-800 border-b border-amber-500 pb-2 mb-4">Sign
                            Up</h3>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col items-center w-full space-y-6 p-4">
                            <TextField
                                className="w-full"
                                error={!!errors.username}
                                helperText={errors.username?.message}
                                disabled={pendingVerification}
                                label="Full Name"
                                {...register("username", {
                                    required: "Required",
                                    minLength: {value: 3, message: "Username should be at least 3 characters"},
                                })}
                            />
                            <TextField
                                className="w-full"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                disabled={pendingVerification}
                                label="Email"
                                {...register("email", {
                                    required: "Required",
                                    pattern: {
                                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                                        message: "Invalid email"
                                    }
                                })}
                            />
                            <TextField
                                className="w-full"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                disabled={pendingVerification}
                                {...register("password", {
                                    required: "Required",
                                    minLength: {value: 6, message: "Minimum 6 characters"},
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: "Must include uppercase, lowercase, number, symbol"
                                    }
                                })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <button
                                className="bg-[var(--primary-color)] hover:bg-[var(--primary-color-light)] text-white py-2 px-6 rounded-md w-full max-w-xs h-12 transition-colors duration-200"
                                type="submit"
                            >
                                Submit
                            </button>
                        </form>

                        <div className="my-4 h-[1px] w-3/5 bg-gray-300"></div>
                        <Link href="/login">
                            <p className="text-blue-500 text-lg">Sign in with credentials</p>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Verification Code Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: 400,
                        height: "24rem",
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 24,
                        px: 4,
                        py: 5,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <h3 className="text-xl font-semibold text-slate-800 mb-3 text-center">
                        Verify Your Email
                    </h3>

                    <p className="text-sm text-gray-600 mb-5 text-center">
                        Enter the 6-digit code sent to <strong>{emailForVerification}</strong>
                    </p>

                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Verification Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        inputProps={{
                            maxLength: 6,
                            style: {letterSpacing: '0.2em', textAlign: 'center'},
                        }}
                        className="mb-6"
                    />

                    <button
                        onClick={handleVerificationCodeSubmit}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 w-full rounded-md transition text-base font-medium"
                    >
                        Confirm
                    </button>
                    {canResend ? (
                        <button
                            onClick={handleResendCode}
                            className="text-blue-600 font-medium border rounded-lg p-4 mt-4"
                        >
                            Resend Code
                        </button>
                    ) : (
                        <>You can resend the code in <strong>{timer}s</strong></>
                    )}
                </Box>
            </Modal>

        </>
    );
};

export default LoginPage;
