'use client';
import React, {useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {IconButton, InputAdornment, TextField} from "@mui/material";
import Link from "next/link";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import {loginThunk} from "@/redux/authSlice";
import {useRouter} from "next/navigation";
import Image from "next/image";

const LoginPage = () => {
    const router = useRouter();
    const {register, formState: {errors}, handleSubmit} = useForm();
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [returnUrl, setReturnUrl] = useState('/');
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;

    useEffect(() => {
        // Client-side only URL parsing
        const params = new URLSearchParams(window.location.search);
        setReturnUrl(params.get('returnUrl') || '/');
    }, []);

    const onSubmit = async (data) => {
        dispatch(loginThunk(data.email, data.password));
    };

    useEffect(() => {
        if (userInfo && Object.keys(userInfo).length !== 0) {
            router.replace(returnUrl);
        }
    }, [userInfo, returnUrl, router]);

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <>
            <title>Login | Synapticz.com</title>
            <main>
                <div
                    className="login-container flex flex-col md:flex-row rounded-lg bg-white p-2 w-full md:w-[45%] md:min-h-[30rem] shadow-lg overflow-hidden">
                    {/* Image Banner */}
                    <div className="hidden md:flex md:w-1/3 relative">
                        <Image
                            src="/images/neural_network.jpg"
                            alt="Neural Network"
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="w-full md:w-2/3 p-8 flex flex-col gap-2 items-center justify-center">
                        <h3 className="text-2xl font-light text-gray-800 border-b border-amber-500 pb-2 mb-6">
                            Login
                        </h3>
                        <button className={`w-full p-3 border border-gray-300 rounded-md bg-white text-slate-800 flex gap-2 justify-center items-center`}
                                onClick={() => window.location.href = 'http://localhost:8080/api/auth/google-login'}
                        >
                            <Image src={"/images/google_icon.png"} alt={"Google"} width={25} height={25} />
                            Login with Google
                        </button>
                        <div className="my-6 h-[1px] w-4/5 bg-amber-500"></div>

                        <form onSubmit={handleSubmit(onSubmit)}
                              className="w-full space-y-6 flex flex-col justify-center items-center">
                            {/* Email Field */}

                            <TextField
                                className={`w-full p-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                label="Email"
                                variant="outlined"
                                {...register("email", {
                                    required: "Required",
                                    pattern: {
                                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i,
                                        message: "Invalid email"
                                    }
                                })}
                            />

                            {/* Password Field */}
                            <TextField
                                className={`w-full p-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                variant="outlined"
                                {...register("password", {required: "Required"})}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
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

                        <div className="my-6 h-[1px] w-4/5 bg-gray-300"></div>
                        <Link href="/signup" className="text-blue-500 hover:text-blue-700 text-lg">
                            Create an account
                        </Link>

                    </div>
                </div>
            </main>
        </>
    );
};

export default LoginPage;