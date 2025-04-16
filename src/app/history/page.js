'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import {useSelector} from "react-redux";
import Link from "next/link";
import HistoryItemCard from "@/components/history_item_card";

function Page() {
    const [testSessions, setTestSessions] = useState([]);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;
    const token = userInfo?.token;

    useEffect(() => {
        async function getTestHistory() {
            const headers = {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
            };
            try {
                const response = await axios.get(`${fetchURL}/test_session/history?limit=50`, {headers});
                const testHistory = response.data.history;
                const testHistoryModified = testHistory.map((item) => {
                    if (item.coverImage === "") {
                        return {...item, coverImage: "/images/placeholder_book.png"}
                    }
                    return item;
                })
                setTestSessions(testHistoryModified);
                console.log(testHistoryModified)
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
            }
        }

        if (token) getTestHistory();
    }, [token]);

    return (<main className="flex flex-col p-4 items-center">
            {testSessions && testSessions.map((testSession, index) => (
                <HistoryItemCard testSession={testSession} key={index}/>

            ))}
        </main>);
}

export default Page;
