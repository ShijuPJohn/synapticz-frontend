"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

export default function QuestionSetSearch({ searchTerm = "" }) {
    const [term, setTerm] = useState(searchTerm);
    const router = useRouter();

    const handleSearch = () => {
        const query = term.trim();
        if (query) {
            router.push(`/quizzes?search=${encodeURIComponent(query)}`);
        } else {
            router.push(`/quizzes`);
        }
    };

    return (
        <div className="bg-[rgba(0,0,0,.15)] p-[1px] rounded-lg w-[95%] md:w-[60%] mx-auto my-4">
            <div className="flex items-center gap-3  rounded-xl px-4 py-3">
                <label className="text-sm font-medium text-gray-600 md:mr-2 whitespace-nowrap">
                    Search Quizzes
                </label>

                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title, topic, or keyword..."
                        className="bg-[rgba(255,255,255,.7)] w-full pl-10 pr-4 py-2 rounded-lg  outline-none "
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                <button
                    className="bg-blue-700 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-all shadow-md"
                    onClick={handleSearch}
                >
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </div>
        </div>

    );
}
