import React from 'react';
import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";

async function getQuestionSets() {
    let response = null;
    try {
        response = await axios.get(`${fetchURL}/questionsets`);
        console.log(response)
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
    return response.data
}

async function Page(props) {
    const questionSets = await getQuestionSets();

    return (
        <main className={"flex flex-col p-4 items-center"}>
            {
                questionSets.map(set => (
                    <QuestionSetCard key={set.id} questionSet={set}/>
                ))
            }
        </main>
    );
}

export default Page;