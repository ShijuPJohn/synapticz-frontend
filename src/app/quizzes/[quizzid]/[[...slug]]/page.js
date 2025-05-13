import React from "react";
import axios from "axios";
import {fetchURL} from "@/constants";
import Image from "next/image";
import StartSessionControlBox from "@/components/start_session_control_box";

export async function generateMetadata({params}) {
    const quiz = await fetchQuizById(params.quizzid);

    if (!quiz) {
        return {
            title: 'Quiz Not Found',
        };
    }

    // Ensure cover image is absolute URL
    const coverImage = quiz.cover_image ? quiz.cover_image
        : 'https://synapticz.com/images/icon.png';

    return {
        title: quiz.name,
        description: quiz.description,
        metadataBase: new URL('https://synapticz.com'),
        openGraph: {
            title: quiz.name,
            description: quiz.description,
            url: `/quiz/${quiz.id}/${quiz.slug}`,
            siteName: 'Synapticz',
            images: [
                {
                    url: coverImage,
                    width: 1200,
                    height: 630,
                    alt: quiz.name,
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: quiz.name,
            description: quiz.description,
            images: [coverImage],
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
        }
    };
}

async function fetchQuizById(qzid) {
    try {
        const response = await axios.get(`${fetchURL}/questionsets/${qzid}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching quiz:", err);
        return null;
    }
}

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function Info({label, value}) {
    return (
        <div>
            <p className="text-gray-500 text-xs mb-0.5">{label}</p>
            <p className="text-gray-800 font-semibold">{value || "N/A"}</p>
        </div>
    );
}

export default async function Page({params}) {
    const quiz = await fetchQuizById(params.quizzid);

    if (!quiz) {
        return (
            <main>
                <p className="text-blue-600 text-lg font-medium animate-pulse">
                    Loading quiz details...
                </p>
            </main>
        );
    }

    return (
        <main>
            <div
                className="w-[98%] md:w-[80%] lg:w-[50%] mx-auto bg-white rounded-2xl p-4 md:p-12 border border-purple-100">
                {/* Top Section: Image + Metadata */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cover Image */}
                    <div className="w-full lg:w-1/3 h-56 border-[1px] border-purple-300 rounded-xl relative">
                        <Image
                            src={quiz.cover_image || "https://storage.googleapis.com/synapticz-storage/profile_pics/Shiju-P-John-818a221f-d51a-4793-8576-5567da6ff04b.jpg"}
                            alt="Quiz Cover"
                            className="w-full h-full object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-[1.2rem] md:text-2xl font-bold text-pink-900 mb-4 uppercase">
                            {quiz.name}
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            Created by{" "}
                            <span className="font-semibold text-blue-600">
                {quiz.created_by_name}
              </span>{" "}
                            ·{" "}
                            <span className="text-gray-500">
                {new Date(quiz.created_at).toLocaleDateString()}
              </span>
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-md text-gray-700">
                            <Info label="📚 Subject" value={quiz.subject}/>
                            <Info label="🎓 Exam" value={quiz.exam === "na" ? "Any" : quiz.exam}/>
                            <Info label="🗣 Language" value={capitalizeFirstLetter(quiz.language)}/>
                            <Info label="🎯 Mode" value={capitalizeFirstLetter(quiz.mode)}/>
                            <Info label="🚀 Taken" value={`${quiz.test_sessions_taken} times`}/>
                            <Info
                                label="No. of Questions"
                                value={`${quiz.question_ids ? quiz.question_ids.length : 0}`}
                            />
                            <Info
                                label="Availability"
                                value={`${capitalizeFirstLetter(quiz.access_level || "free")}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-8 border-t border-purple-200"/>

                {/* Description */}
                {quiz.description && (
                    <section className="mb-8">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">
                            📄 Description
                        </h3>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            {quiz.description}
                        </p>
                    </section>
                )}

                {/* Tags */}
                {quiz.tags?.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">
                            🏷 Tags
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {quiz.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full shadow-sm"
                                >
                  #{tag}
                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Resource Link */}
                {quiz.associated_resource && quiz.associated_resource !== "N/A" && (
                    <section className="mb-10">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">
                            🔗 Resource
                        </h3>
                        <a
                            href={quiz.associated_resource}
                            className="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {quiz.associated_resource}
                        </a>
                    </section>
                )}

                {/* Start Test Button */}
                {quiz.can_start_test && (
                    <StartSessionControlBox qid={params.quizzid}/>
                )}
            </div>
        </main>
    );
}