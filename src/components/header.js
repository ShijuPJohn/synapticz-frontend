"use client"
import React, {useEffect, useRef, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "@/redux/authSlice";


function Header() {
    const drawerTimeout = useRef(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin
    const [hydrated, setHydrated] = useState(false); // Add hydration state
    const dispatch = useDispatch();

    useEffect(() => {
        setHydrated(true);
    }, [])

    function handleOpenDrawer() {
        if (openDrawer) {
            setIsAnimating(true);
            clearTimeout(drawerTimeout.current);
            drawerTimeout.current = setTimeout(() => {
                setOpenDrawer(false);
                setIsAnimating(false);
            }, 600);
        } else {
            setOpenDrawer(true);
            drawerTimeout.current = setTimeout(() => {
                setIsAnimating(true);
                setTimeout(() => {
                    setOpenDrawer(false);
                    setIsAnimating(false);
                }, 600);
            }, 3000);
        }
    }

    return (
        <>
            {hydrated && <header
                className="flex flex-row items-center justify-center md:justify-between w-full bg-gray-700 px-4 py-2 h-[calc(4vw+1.5rem)] relative">
                <button className="md:hidden absolute left-2 top-0 text-gray-500 text-[calc(3vw+.5rem)] my-auto"
                        onClick={handleOpenDrawer}>
                    <FontAwesomeIcon icon={faBars}/>
                </button>

                {openDrawer && (
                    <div
                        className={`absolute left-0 top-[calc(4vw+1.5rem)] bg-[rgba(55,56,77,0.95)] h-[90vh] w-[40%] transition-transform duration-500 ease-in-out ${
                            isAnimating ? 'menu-drawer hide' : 'menu-drawer'
                        } flex items-center px-4 py-2`}
                    >
                        <nav className="navLinks ">
                            <ul className="flex text-white flex-col items-start justify-center">
                                <li className="drawer-item">
                                    <Link href="/" className="">Home</Link>
                                </li>
                                <li className="drawer-item">
                                    <Link href="/contact">Browse Quizzes</Link>
                                </li>
                                <li className="drawer-item">
                                    <Link href="/about">LeaderBoard</Link>
                                </li>
                                <li className="drawer-item">
                                    <Link href="/login">Login</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}

                {/*<h1 className="logo text-[calc(1vw+1rem)] font-[600] text-white">Synapticz</h1>*/}
                <h1 className="logo text-[calc(1vw+1rem)] font-[600] text-white"><Link href={"/"}>[Placeholder]</Link></h1>
                <nav className="navLinks hidden md:block">
                    <ul className="flex items-center text-white">
                        <li className="header-list-item">
                            <Link href="/">Home</Link>
                        </li>
                        <li className="header-list-item">
                            <Link href="/contact">Browse Quizzes</Link>
                        </li>
                        <li className="header-list-item">
                            <Link href="/about">LeaderBoard</Link>
                        </li>

                        {userInfo && Object.keys(userInfo).length !== 0 ?
                            <li className="header-list-item">
                                <button className={"logout-btn"} onClick={() => {
                                    dispatch(logout())
                                }}>Logout
                                </button>
                                {/*<li className={styles.main_nav_links_item}><Link href="/dashboard">Dashboard</Link></li>*/}
                            </li> : <li className="header-list-item">
                                <Link href="/login">Login</Link>
                            </li>}
                    </ul>
                </nav>
            </header>
            }</>
    )
        ;
}

export default Header;
