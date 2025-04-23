"use client"
import React, {useEffect} from 'react';
import {login} from "@/redux/authSlice";
import {useDispatch} from "react-redux";
import {fetchURL} from "@/constants";
import {useRouter} from "next/navigation";
import axios from "axios";

function Page() {
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await axios.get(`${fetchURL}/auth/verify-oauth`, {
                    withCredentials: true,
                });
                const data = response.data;
                if (response.status === 200) {
                    dispatch(login(data));
                    router.push('/profile/edit');
                }
            } catch (error) {
                console.error("Verification failed:", error.response?.data || error.message);
                // optionally redirect to login page
                router.push('/login');
            }
        };

        verify();
    }, [dispatch, router]);

    return null;
}

export default Page;
