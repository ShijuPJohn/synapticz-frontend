import React from 'react';
import axios from "axios";
import {fetchURL} from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import QuestionSetSearch from "@/components/question_set_search";
import {Button} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';

async function Page({searchParams}) {
    let questionSets = [];
    let totalPages = 1;
    let currentPage = parseInt(searchParams?.page) || 1;

    try {
        const params = new URLSearchParams();
        Object.entries(searchParams || {}).forEach(([key, value]) => {
            if (value && key !== 'page') params.append(key, value);
        });

       const res = await axios.get(`${fetchURL}/questionsets?${params.toString()}&page=${currentPage}`);

        questionSets = res.data.data.map((item) => ({
            ...item,
            coverImage: item.coverImage || "/images/placeholder_book.png",
        }));
        totalPages = res.data.pagination.total_pages || 1;
        currentPage = res.data.pagination.current || currentPage;
    } catch (err) {
        console.error("Failed to fetch sets:", err);
    }

    // Function to build URL with updated page parameter
    const buildPageUrl = (page) => {
        const params = new URLSearchParams(searchParams || {});
        params.set('page', page);
        return `/quizzes?${params.toString()}`;
    };

    return (
        <main>
            <div className={"w-full md:w-[70%] lg:w-[60%] flex flex-col gap-2"}>
                <QuestionSetSearch searchParams={searchParams}/>
                {questionSets.map(set => (
                    <QuestionSetCard key={set.id} questionSet={set}/>
                ))}
            </div>
            {totalPages > 1 && (
                <div className="pagination-buttons-container w-full flex justify-center items-center gap-2">
                    <Button
                        component={Link}
                        href={buildPageUrl(currentPage - 1)}
                        className="flex gap-2 w-28"
                        variant="contained"
                        disabled={currentPage <= 1}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Previous
                    </Button>

                    {`${currentPage}/${totalPages}`}

                    <Button
                        component={Link}
                        href={buildPageUrl(currentPage + 1)}
                        className="flex gap-2 w-28"
                        variant="contained"
                        disabled={currentPage >= totalPages}
                    >
                        Next <FontAwesomeIcon icon={faArrowRight} />
                    </Button>
                </div>
            )}
        </main>
    );
}

export default Page;