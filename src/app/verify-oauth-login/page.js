"use client";

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { login } from '@/redux/authSlice';
import { fetchURL } from '@/constants';

function Page() {
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const handleOAuthLogin = async () => {
            const url = new URL(window.location.href);
            const token = url.searchParams.get('token');
            const isNewUser = url.searchParams.get('newuser') === 'true';

            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // Save token
                localStorage.setItem('token', token);

                // Verify token and fetch user info
                const response = await axios.get(`${fetchURL}/auth/verify-oauth`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;

                // Dispatch login info to Redux
                dispatch(login(data));

                // Redirect accordingly
                if (isNewUser) {
                    router.push('/edit-profile');
                } else {
                    router.push('/quizzes');
                }

            } catch (error) {
                console.error("Login verification failed:", error.response?.data || error.message);
                localStorage.removeItem('store');
                router.push('/login');
            }
        };

        handleOAuthLogin();
    }, [dispatch, router]);

    return null;
}

export default Page;
