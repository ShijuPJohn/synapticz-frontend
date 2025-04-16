"use client";
import React from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";

function HistoryItemCard({ testSession }) {
    const { userInfo } = useSelector((state) => state.user);

    const formattedDate = new Date(testSession.updatedTime).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );

    return (
        <div className="w-full max-w-5xl mx-auto bg-[rgba(0,0,0,.1)]  border-gray-200 rounded-lg shadow-sm my-3 p-4 flex items-center gap-4 hover:shadow-md transition">
            {/* Image */}
            <div className="w-24 h-24 relative rounded overflow-hidden border border-gray-300 flex-shrink-0">
                <Image
                    src={testSession.coverImage}
                    alt="Cover"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-1 text-sm text-slate-800">
                <div className="flex items-start justify-between w-full">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {testSession.qSetName}
                    </h2>
                    {testSession.finished && (
                        <div className="flex items-center h-full">
              <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full self-center">
                Finished
              </span>
                        </div>
                    )}
                </div>

                <div className="text-slate-600 flex gap-6 mt-1 flex-wrap">
                    <p>
                        <span className="font-medium text-slate-500">Subject:</span>{" "}
                        {testSession.subject}
                    </p>
                    <p>
                        <span className="font-medium text-slate-500">Language:</span>{" "}
                        {testSession.language}
                    </p>
                    <p>
                        <span className="font-medium text-slate-500">Last taken:</span>{" "}
                        {formattedDate}
                    </p>

                </div>
            </div>

            {/* CTA */}
            <div>
                <Link
                    href={`/test/${testSession.id}`}
                    className="text-sm px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition"
                >
                    {testSession.finished ? "See Result" : "Resume"}
                </Link>
            </div>
        </div>
    );
}

export default HistoryItemCard;
