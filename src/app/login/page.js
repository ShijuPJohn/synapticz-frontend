'use client';
import React, {useEffect, useState} from 'react';
import {useForm} from "react-hook-form";
import {IconButton, InputAdornment, TextField} from "@mui/material";
import Link from "next/link";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useDispatch, useSelector} from "react-redux";
import {login, loginThunk} from "@/redux/authSlice";
import {useRouter} from "next/navigation";

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
        <main className="flex justify-center items-center my-4 bg-gray-100 p-6 rounded-lg w-full max-w-md mx-auto">
            <div className="flex flex-col items-center justify-around w-full">
                <h3 className="text-2xl font-light text-gray-800 border-b border-amber-500 pb-2 mb-4">Login</h3>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col items-center w-full space-y-6">
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
                    <div className="flex justify-around w-full mt-4">
                        <button
                            className="bg-[var(--primary-color-light)] text-white py-2 px-4 rounded-[5px] w-36 h-12"
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </form>
                <div className="my-4 h-[1px] w-3/5 bg-gray-300"></div>
                <Link href="/signup">
                    <p className="text-blue-500 text-lg">Create an account</p>
                </Link>
            </div>
        </main>
    </>);
};

export default LoginPage;
