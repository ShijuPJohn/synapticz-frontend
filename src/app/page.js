import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";

async function getQuestionSets() {
    console.log("checkpoint1")
    let response = null;
    try {
        response = await axios.get(`${fetchURL}/questionsets`);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
    return response.data.question_sets
}

export default async function Home() {

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
