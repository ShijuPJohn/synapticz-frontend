import React from 'react';
import axios from "axios";
import { fetchURL } from "@/constants";
import QuestionSetCard from "@/components/question_set_card";
import QuestionSetSearch from "@/components/question_set_search";
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ searchParams }) {
    const baseUrl = 'https://synapticz.com';
    const title = 'Explore Quizzes | Synapticz';
    const description = 'Discover and take quizzes on various subjects. Test your knowledge and learn something new!';
    const defaultImage = `${baseUrl}/images/placeholder_book.png`;

    // Build canonical URL with search params
    const params = new URLSearchParams(searchParams || {});
    const canonicalUrl = `${baseUrl}/quizzes?${params.toString()}`;

    return {
        title,
        description,
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Synapticz',
            images: [
                {
                    url: defaultImage,
                    width: 1200,
                    height: 630,
                    alt: 'Quiz Collection',
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [defaultImage],
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
            },
        },
    };
}

async function Page({ searchParams }) {
    let questionSets = [];
    let totalPages = 1;
    let currentPage = parseInt(searchParams?.page) || 1;

    try {
        const params = new URLSearchParams();
        Object.entries(searchParams || {}).forEach(([key, value]) => {
            if (value && key !== 'page') params.append(key, value);
        });

        const res = await axios.get(`${fetchURL}/questionsets/verified?${params.toString()}&page=${currentPage}`);
        questionSets = res.data.data.map((item) => ({
            ...item,
            coverImage: item.coverImage || "https://synapticz.com/images/icon.png",
        }));
        totalPages = res.data.pagination.total_pages || 1;
        currentPage = res.data.pagination.current || currentPage;
    } catch (err) {
        console.error("Failed to fetch sets:", err);
    }

    const buildPageUrl = (page) => {
        const params = new URLSearchParams(searchParams || {});
        params.set('page', page);
        return `/quizzes?${params.toString()}`;
    };

    return (
        <main>
            <div className={"w-full md:w-[70%] lg:w-[60%] flex flex-col gap-2"}>
                <QuestionSetSearch searchParams={searchParams} verified={true} />
                {questionSets.length > 0 ? (
                    questionSets.map(set => (
                        <QuestionSetCard key={set.id} questionSet={set} />
                    ))
                ) : (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-semibold text-gray-700">No quizzes found</h3>
                        <p className="text-gray-500">Try adjusting your search filters</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-buttons-container w-full flex justify-center items-center gap-2 mt-8">
                    <Button
                        component={Link}
                        href={buildPageUrl(currentPage - 1)}
                        className="flex gap-2 w-28"
                        variant="contained"
                        disabled={currentPage <= 1}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Previous
                    </Button>

                    <span className="text-gray-600 mx-4">
            Page {currentPage} of {totalPages}
          </span>

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