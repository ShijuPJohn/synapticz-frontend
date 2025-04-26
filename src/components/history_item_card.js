"use client";
import React from "react";
import {useSelector} from "react-redux";
import Image from "next/image";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faPlay } from '@fortawesome/free-solid-svg-icons';

function HistoryItemCard({testSession}) {
    const {userInfo} = useSelector((state) => state.user);

    const formattedDate = new Date(testSession.updatedTime).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

    return (
        <div className="w-full md:w-[70%] lg:w-[60%] mx-auto bg-[rgba(0,0,0,.1)] rounded-lg  border-gray-200 shadow-sm py-2 px-4 md:p-4 flex items-center gap-2 flex-wrap hover:shadow-md transition">
            {/* Image */}
            <Link href={`/test/${testSession.id}`}>
                <div className="w-[3rem] h-[3rem] md:w-[5rem] md:h-[5rem] relative rounded overflow-hidden border border-gray-300 flex-shrink-0">
                    <Image
                        src={testSession.coverImage || "/images/placeholder.png"}
                        alt="Cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>
            </Link>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-1 text-sm text-slate-800">
                <div className="flex items-start justify-between w-full">
                    <Link href={`/test/${testSession.id}`}>
                        <h2 className="text-sm md:text-[1rem] font-semibold uppercase transition text-pink-900">
                            {testSession.qSetName}
                        </h2>
                    </Link>
                    {testSession.finished && (
                        <Link href={`/test/${testSession.id}`}>
                        <div className="flex items-center h-full">
                            <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full self-center">
                                Finished
                            </span>
                        </div>
                        </Link>
                    )}
                </div>

                <div className="text-slate-600 flex mt-1 text-[.7rem] md:text-[.9rem] flex-wrap justify-between w-full md:w-[50%]">
                    <p>
                        <span className="font-medium text-slate-500">Sub:</span>{" "}
                        {testSession.subject}
                    </p>
                    <p>
                        <span className="font-medium text-slate-500">Lang:</span>{" "}
                        {testSession.language}
                    </p>
                    <p>
                        <span className="font-medium text-slate-500">Last taken:</span>{" "}
                        {formattedDate}
                    </p>
                </div>
            </div>

            {/* CTA */}

        </div>
    );
}

export default HistoryItemCard;