"use client"
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrash} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";

function QuestionSetCard({
                             questionSet,
                             editDeleteButtons,
                             setCurrentQuizCallback,
                             openDeleteModalCallback,
                             openEditModalCallback,
                         }) {
    const router = useRouter();

    function createSlug(input) {
        return input
            .trim() // remove leading/trailing whitespace
            .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '') // strip leading/trailing non-alphanumerics
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // replace all internal non-alphanumerics (incl. spaces, symbols) with '-'
            .replace(/-+/g, '-') // collapse multiple dashes into one
    }
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str?.charAt(0).toUpperCase() + str.slice(1);
    }

    function conditionalWrapper(child) {
        if (!editDeleteButtons) {
            return (
                <div
                    className="w-full mx-auto 4">
                    <Link href={`/quizzes/${questionSet.id}/${createSlug(questionSet.name)}`}
                          className={"w-full bg-[rgba(0,0,0,.1)] rounded-lg border-gray-200 shadow-sm transition p-4 block"}>
                        {child}
                    </Link>
                </div>
            )
        } else {
            return (
                <div
                    className="w-full mx-auto px-4 bg-[rgba(0,0,0,.1)] rounded-lg border-gray-200 shadow-sm transition p-4 flex">
                    {child}
                </div>);

        }
    }

    return (
        conditionalWrapper(<>
            <div className="flex items-center gap-2 flex-wrap">
                {/* Image */}
                <div
                    className="w-[3rem] h-[3rem] md:w-[5rem] md:h-[5rem] relative rounded overflow-hidden border border-gray-300 flex-shrink-0">
                    <Image
                        src={questionSet.coverImage || "https://storage.googleapis.com/synapticz-storage/profile_pics/Shiju-P-John-818a221f-d51a-4793-8576-5567da6ff04b.jpg"}
                        alt="Cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        className="object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col gap-1 md:gap-2 text-sm text-slate-800">
                    <h2 className="text-sm md:text-[1rem] font-semibold uppercase text-pink-900">
                        {questionSet.name}
                    </h2>

                    <div
                        className="text-slate-600 mt-1 text-[.7rem] md:text-[.9rem] flex gap-4 flex-wrap justify-start w-full  ">
                        <p>
                            <span className="font-medium text-slate-500">Sub:</span>{" "}
                            {capitalizeFirstLetter(questionSet.subject)}
                        </p>
                        <p>
                            <span className="font-medium text-slate-500">Lang:</span>{" "}
                            {capitalizeFirstLetter(questionSet.language)}
                        </p>
                        <p>
                            <span className="font-medium text-slate-500">Questions:</span>{" "}
                            {questionSet.question_ids?.length || 0}
                        </p>
                        <p>
                            <span className="font-medium text-slate-500">Access:</span>{" "}
                            {capitalizeFirstLetter(questionSet.access_level)}
                        </p>
                    </div>
                </div>
            </div>
            {
                editDeleteButtons &&
                <div className={"ml-auto flex justify-around items-center gap-2 text-gray-700 min-w-16 "}>
                    <FontAwesomeIcon icon={faEdit} size={"lg"} className={"cursor-pointer text-teal-600"}
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         // setCurrentQuizCallback(questionSet)
                                         openEditModalCallback(true);
                                     }}/>
                    <FontAwesomeIcon icon={faTrash} size={"lg"} className={"cursor-pointer text-red-700"}
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setCurrentQuizCallback(questionSet)
                                         openDeleteModalCallback(true);
                                     }}/>
                </div>

            }
        </>)
    )
        ;
}

export default QuestionSetCard;
