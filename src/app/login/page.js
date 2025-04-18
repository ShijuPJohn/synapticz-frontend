'use client';
import React, {useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {IconButton, InputAdornment, TextField} from "@mui/material";
import Link from "next/link";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import {login, loginThunk} from "@/redux/authSlice";
import {useRouter} from "next/navigation";
import Image from "next/image";

const LoginPage = () => {
    const router = useRouter();
    const {register, formState: {errors}, handleSubmit} = useForm();
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const onSubmit = async (data) => {
        console.log("data", data);
        dispatch(loginThunk(data.email, data.password));

    };
    useEffect(() => {
        if (userInfo && Object.keys(userInfo).length !== 0){
            setTimeout(()=>{
                router.push('/');
            },500)
        }
    }, [userInfo]);
    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (<>
        <title>Login | Synapticz.com</title>
        <main>
            <div className="login-container flex flex-col md:flex-row rounded-lg bg-[rgba(255,255,255,.8)] p-2 w-full md:w-[45%] md:min-h-[30rem] shadow-lg overflow-hidden">
                {/* Image Banner - Takes 1/3 width on desktop, hidden on mobile */}
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

                {/* Form Section - Takes full width on mobile, 2/3 on desktop */}
                <div className="w-full md:w-2/3 p-8 flex flex-col items-center justify-center">
                    <h3 className="text-2xl font-light text-gray-800 border-b border-amber-500 pb-2 mb-6">
                        Login
                    </h3>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full space-y-6"
                    >
                        <div className="w-full">
                            <TextField
                                className="w-full"
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : null}
                                autoFocus
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
                        </div>

                        <div className="w-full">
                            <TextField
                                className="w-full"
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : null}
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                variant="outlined"
                                {...register("password", {
                                    required: "Required"
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
                        </div>

                        <div className="flex justify-center w-full mt-6">
                            <button
                                className="bg-[var(--primary-color-light)] hover:bg-[var(--primary-color-dark)] text-white py-2 px-6 rounded-md w-full max-w-xs h-12 transition-colors duration-200"
                                type="submit"
                            >
                                Submit
                            </button>
                        </div>
                    </form>

                    <div className="my-6 h-[1px] w-4/5 bg-gray-300"></div>

                    <Link href="/signup">
                        <p className="text-blue-500 hover:text-blue-700 text-lg transition-colors duration-200">
                            Create an account
                        </p>
                    </Link>
                </div>
            </div>
        </main>
    </>);
};

export default LoginPage;
