import React from 'react';
import {Button} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function Header(props) {
    return (
        <header className={"flex flex-row items-center justify-center md:justify-between w-full bg-gray-700 px-4 py-2 h-[calc(4vw+1rem)] relative"}>
            <button className={"md:hidden absolute left-2 top-0 text-gray-500 text-[calc(3vw+.5rem)] my-auto"}>
                <FontAwesomeIcon icon={faBars} />
            </button>
            <h1 className=" logo text-[calc(1vw+1rem)] font-[600] text-white">
                Synapticz
            </h1>
            <nav className="navLinks hidden md:block">
                <ul className="flex items-center text-white">
                    <li className="header-list-item">
                        <Link href="/" class="text-lg text-cyan-400">Home</Link>
                    </li>
                    <li className="header-list-item">
                        <Link href="/contact">Browse Quizzes</Link>
                    </li>
                    <li className="header-list-item">
                        <Link href="/about">LeaderBoard</Link>
                    </li>
                    <li className="header-list-item">
                        <Link href="/login">Login</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
        ;
}

export default Header;