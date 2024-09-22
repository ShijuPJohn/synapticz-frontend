"use client"
import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import axios from "axios";
import {fetchURL} from "@/constants";

function Page({params}) {
    const [testData, setTestData] = useState({});
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin

    useEffect(() => {
        if (params.testid) {
            fetchTestById(params.testid);
        }
    }, []);

    async function fetchTestById(id) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        };
        try {
            const response = await axios.get(`${fetchURL}/test_session/${id}`, {headers});
            console.log(response.data)
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    }

    return (
        <div></div>
    );
}

export default Page;