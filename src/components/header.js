"use client"
import React, {useEffect, useRef, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "@/redux/authSlice";
import Image from 'next/image';

function Header() {
    const drawerTimeout = useRef(null);
    const drawerRef = useRef(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;
    const [hydrated, setHydrated] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDrawer && drawerRef.current && !drawerRef.current.contains(event.target)) {
                const menuButton = document.querySelector('button[class*="md:hidden absolute h-full left-2"]');
                if (menuButton && !menuButton.contains(event.target)) {
                    handleCloseDrawer();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDrawer]);

    function handleCloseDrawer() {
        setIsAnimating(true);
        clearTimeout(drawerTimeout.current);
        drawerTimeout.current = setTimeout(() => {
            setOpenDrawer(false);
            setIsAnimating(false);
        }, 500);
    }

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
            }, 10000);
        }
    }

    const navElements = [
        { id: 'quizzes', element: <li key="quizzes" className="header-list-item">
                <Link href="/quizzes">Quizzes</Link>
            </li> },
        ...(userInfo && Object.keys(userInfo).length ? [
            { id: 'history', element: <li key="history" className="header-list-item">
                    <Link href="/history">History</Link>
                </li> },
            { id: 'overview', element: <li key="overview" className="header-list-item">
                    <Link href="/overview">Profile</Link>
                </li> },
            { id: 'logout', element: <li key="logout" className="header-list-item">
                    <button className="logout-btn" onClick={() => {
                        dispatch(logout());
                        handleCloseDrawer();
                    }}>
                        LOGOUT
                    </button>
                </li> }
        ] : [
            { id: 'login', element: <li key="login" className="header-list-item">
                    <Link href="/login">Login</Link>
                </li> },
            { id: 'signup', element: <li key="signup" className="header-list-item">
                    <Link href="/signup">Signup</Link>
                </li> }
        ])
    ];

    return (
        <>
            {hydrated && <header
                className="flex flex-row items-center justify-center md:justify-between w-full bg-[#021222] px-4 py-2 h-[calc(4vw+1.8rem)] relative">
                <button
                    className="md:hidden absolute h-full left-2 top-0 text-gray-500 text-[calc(3vw+.5rem)] my-auto flex items-center justify-center"
                    onClick={handleOpenDrawer}>
                    <FontAwesomeIcon icon={faBars}/>
                </button>

                {openDrawer && (
                    <div
                        ref={drawerRef}
                        className={`absolute z-10 left-0 top-[calc(4vw+1.8rem)] bg-[rgba(2,18,34,.8)] h-[90vh] w-[40%] transition-transform duration-500 ease-in-out ${isAnimating ? 'menu-drawer hide' : 'menu-drawer'} flex items-center px-4 py-2`}
                    >
                        <nav className="navLinks" onClick={handleCloseDrawer}>
                            <ul className="flex text-white flex-col items-start justify-center uppercase">
                                {navElements.map(item => item.element)}
                            </ul>
                        </nav>
                    </div>
                )}

                <h1 className="logo text-[calc(1vw+1rem)] font-[600] text-white">
                    <Link href={"/"}>
                        <div className="logo-image-container w-[calc(8rem+7vw)] h-24 relative">
                            <Image
                                src="/images/logo.jpg"
                                alt="Logo"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                                className="object-contain"
                            />
                        </div>
                    </Link>
                </h1>
                <nav className="navLinks hidden md:block uppercase">
                    <ul className="flex items-center text-white">
                        {navElements.map(item => item.element)}
                    </ul>
                </nav>
            </header>}
        </>
    );
}

export default Header;
