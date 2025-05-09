"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";

export default function QuestionSetSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state with URL params
    const [localFilters, setLocalFilters] = useState({
        subject: searchParams.get('subject') || '',
        exam: searchParams.get('exam') || '',
        language: searchParams.get('language') || '',
        tags: searchParams.get('tags') || '',
        created_by: searchParams.get('created_by') || '',
        self: searchParams.get('self') === 'true' || false,
        page: parseInt(searchParams.get('page')) || 1,
        search: searchParams.get('search') || '',
    });

    const searchInputRef = useRef(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(
        ['subject', 'exam', 'language', 'tags', 'created_by', 'self'].some(param => searchParams.has(param)));

    // Update state when URL changes
    useEffect(() => {
        setLocalFilters({
            subject: searchParams.get('subject') || '',
            exam: searchParams.get('exam') || '',
            language: searchParams.get('language') || '',
            tags: searchParams.get('tags') || '',
            created_by: searchParams.get('created_by') || '',
            self: searchParams.get('self') === 'true' || false,
            page: parseInt(searchParams.get('page')) || 1,
            search: searchParams.get('search') || '',
        });

        // Update the search input field
        if (searchInputRef.current) {
            searchInputRef.current.value = searchParams.get('search') || '';
        }

        // Show advanced filters if any advanced filter is present
        setShowAdvancedFilters(
            ['subject', 'exam', 'language', 'tags', 'created_by', 'self', 'resource'].some(
                param => searchParams.has(param))
        );
    }, [searchParams]);

    const handleSearch = (fltrs = localFilters) => {
        const params = new URLSearchParams();
        Object.entries(fltrs).forEach(([key, value]) => {
            if (value && value !== 'false') {
                params.append(key, value.toString());
            }
        });
        router.push(`/quizzes?${params.toString()}`);
    };

    const toggleAdvancedFilters = () => {
        if (showAdvancedFilters) {
            setLocalFilters(prev => ({
                ...prev,
                subject: '',
                exam: '',
                language: '',
                tags: '',
                created_by: '',
                resource:'',
                self: false
            }));
        } else{
            setLocalFilters(prevState => ({...prevState, search: ''}))
            searchInputRef.current.value="";
        }
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    const handleChangeFilters = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalFilters({
            ...localFilters,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const applyFilters = () => {
        handleSearch();
    };

    return (
        <div className={"w-full flex flex-wrap items-center bg-[rgba(255,255,255,.6)] shadow-lg p-1 md:p-2 rounded-2xl mb-2 border-[1px] border-gray-400"}>
            <div className="w-full flex flex-wrap items-center justify-start gap-4">
                <input
                    className={"w-[50%] md:w-[65%] xl:w-[75%] rounded-2xl outline-none border-[1px] border-gray-400 bg-[rgba(255,255,255,.2)] p-2"}
                    placeholder="Search..."
                    name="search"
                    defaultValue={localFilters.search}
                    onChange={handleChangeFilters}
                    onKeyPress={handleKeyPress}
                    type="text"
                    ref={searchInputRef}
                />
                <button
                    onClick={applyFilters}
                    className="flex items-center gap-2 h-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faSearch} />
                </button>

                <button
                    onClick={toggleAdvancedFilters}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-400 hover:bg-slate-500 transition-colors text-gray-700 font-medium"
                >
                    <FontAwesomeIcon icon={showAdvancedFilters ? faEraser : faFilter} />
                   <span className={"text-sm hidden md:block"}>
                        {showAdvancedFilters ? 'Clear Filters' : 'Filters'}
                   </span>
                </button>
            </div>
            <div
                className={`overflow-hidden transition-all duration-300 ${showAdvancedFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} w-full`}
            >
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {['subject', 'exam', 'language', 'tags', 'created_by', 'resource'].map((field) => (
                            <input
                                key={field}
                                type="text"
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                                name={field}
                                value={localFilters[field]}
                                onChange={handleChangeFilters}
                                onKeyPress={handleKeyPress}
                                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-gray-700 placeholder-gray-400 transition-all"
                            />
                        ))}
                        <div className="flex items-center gap-2 p-3">
                            <input
                                type="checkbox"
                                id="self-filter"
                                name="self"
                                checked={localFilters.self}
                                onChange={handleChangeFilters}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="self-filter" className="text-gray-700">
                                Only my question sets
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}