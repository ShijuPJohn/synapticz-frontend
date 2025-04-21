import React from 'react';
import axios from "axios";
import { fetchURL } from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import QuestionSetSearch from "@/components/question_set_search";

async function Page({ searchParams }) {
    const searchTerm = searchParams?.search?.toLowerCase() || "";

    let questionSets = [];

    try {
        const res = await axios.get(`${fetchURL}/questionsets?search=${searchTerm}`);
        questionSets = res.data.map((item) => ({
            ...item,
            coverImage: item.coverImage || "/images/placeholder_book.png",
        }));
    } catch (err) {
        console.error("Failed to fetch sets:", err);
    }

    return (
        <main>
            <QuestionSetSearch searchTerm={searchTerm} />
            {questionSets.map(set => (
                <QuestionSetCard key={set.id} questionSet={set} />
            ))}
        </main>
    );
}

export default Page;
