'use client';
import React, {useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {IconButton, InputAdornment, TextField} from "@mui/material";
import Link from "next/link";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {signupThunk} from "@/redux/authSlice";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/navigation";

const LoginPage = () => {
    const {register, formState: {errors}, handleSubmit} = useForm();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const onSubmit = async (data) => {
        dispatch(signupThunk(data.username, data.email, data.password));
    };
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    useEffect(() => {
        if (userInfo && Object.keys(userInfo).length !== 0){
            setTimeout(()=>{
                router.push('/');
            },500)
        }
    }, [userInfo]);
    return (<>
        <title>Signup | Synapticz.com</title>
        <main>
            <div className="signup-form-main-container flex justify-center items-center my-4 bg-gray-100 p-6 w-[calc(120%-30vw)] g md:w-[55vw] lg:w-[30%] lg:min-h-[25rem]">
                <div className="flex flex-col items-center justify-around w-full">
                    <h3 className="text-2xl font-light text-gray-800 border-b border-amber-500 pb-2 mb-4">Sign Up</h3>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col items-center w-full space-y-6">
                        <div className="w-full">
                            <TextField
                                className={`w-full p-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                error={!!errors.username}
                                helperText={errors.username ? errors.username.message : null}
                                autoFocus
                                label="Full Name"
                                {...register("username", {
                                    required: "Required",
                                    minLength: {value: 3, message: "Username should be at least 3 characters"},
                                })}
                            />
                        </div>
                        <div className="w-full">
                            <TextField
                                className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                error={!!errors.email}
                                helperText={errors.email ? errors.email.message : null}
                                autoFocus
                                label="Email"
                                {...register("email", {
                                    required: "Required", pattern: {
                                        value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/i, message: "Invalid email"
                                    }
                                })}
                            />
                        </div>

                        <div className="w-full">
                            <TextField
                                className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                error={!!errors.password}
                                helperText={errors.password ? errors.password.message : null}
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                {...register("password", {
                                    required: "Required",
                                    minLength: {value: 6, message: "Length of password must be atleast 6 characters"},
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                        message: "Password should consist of an uppercase letter, a lowercase letter, number, and symbol"
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
                        </div>
                        <div className="flex justify-around w-full mt-4">
                            <button
                                className="bg-[var(--primary-color-light)] text-white py-2 px-4 rounded-[5px] w-36 h-12"
                                type="submit"
                            >
                                Submit
                            </button>
                            {/*<button*/}
                            {/*    className="bg-gray-500 text-white py-2 px-4 rounded-lg w-24"*/}
                            {/*    type="reset"*/}
                            {/*>*/}
                            {/*    Clear*/}
                            {/*</button>*/}
                        </div>
                    </form>
                    <div className="my-4 h-[1px] w-3/5 bg-gray-300"></div>
                    <Link href="/login">
                        <p className="text-blue-500 text-lg">Sign in with credentials</p>
                    </Link>
                </div>
            </div>
        </main>
    </>);
};

export default LoginPage;
