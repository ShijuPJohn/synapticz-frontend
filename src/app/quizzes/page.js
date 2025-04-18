import React from 'react';
import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import Link from "next/link";

async function getQuestionSets() {
    let questionSetsModified = []
    let response = null;
    try {
        response = await axios.get(`${fetchURL}/questionsets`);
        const questionSets = response.data;
        questionSetsModified = questionSets.map((item) => {
            if (item.coverImage === "") {
                return {...item, coverImage: "/images/placeholder_book.png"}
            }
            return item;
        })
        console.log(questionSetsModified)
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
    return questionSetsModified
}

async function Page(props) {
    const questionSets = await getQuestionSets();
    console.log(questionSets);

    return (<main>
        {questionSets.map(set => (
            <QuestionSetCard key={set.id} questionSet={set}/>
        ))}

    </main>);
}

export default Page;