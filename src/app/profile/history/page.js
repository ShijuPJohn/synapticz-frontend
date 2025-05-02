'use client'
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import {useSelector} from "react-redux";
import Link from "next/link";
import HistoryItemCard from "@/components/history_item_card";
import {CircularProgress} from "@mui/material";

function Page() {
    const [testSessions, setTestSessions] = useState([]);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;
    const token = userInfo?.token;
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        async function getTestHistory() {
            const headers = {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
            };
            try {
                const response = await axios.get(`${fetchURL}/test_session/history?limit=50`, {headers});
                const testHistory = response.data.history;
                const testHistoryModified = testHistory.map((item) => {
                    if (!item.coverImage || item.coverImage === "") {
                        return {...item, coverImage: "/images/placeholder_book.png"}
                    }
                    return item;
                })
                setTestSessions(testHistoryModified);
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
            } finally {
                setFetched(true);
            }
        }

        if (token) getTestHistory();
    }, [token]);
    if (!fetched) {
        return (
            <div>
                <CircularProgress size="3rem"/>
            </div>
        )
    }

    return (<main className={"p-0 bg-white"}>
        <div className="history-cards-main-container w-[100%] mx-auto p-2 md:p-6 lg:p-8 flex flex-col gap-2 items-center justify-center bg-white">
            {(testSessions && testSessions.map((testSession, index) => (
                <HistoryItemCard testSession={testSession} key={index}/>

            )))}
        </div>

    </main>);
}

export default Page;
