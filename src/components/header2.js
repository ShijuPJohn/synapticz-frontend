"use client"
import React, {useEffect, useRef, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "@/redux/authSlice";
import Image from 'next/image';
import {Avatar, IconButton, Menu, MenuItem, ListItemIcon, Divider} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Header() {
    const drawerTimeout = useRef(null);
    const drawerRef = useRef(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;
    const [hydrated, setHydrated] = useState(false);
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
    };

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
                className="flex flex-row items-center justify-between w-full bg-[#021222] px-4 py-2 h-[calc(4vw+1.8rem)] relative">

                {/* Left: Hamburger */}
                <button
                    className="md:hidden h-full text-gray-500 text-[calc(3vw+.5rem)] my-auto flex items-center justify-center"
                    onClick={handleOpenDrawer}>
                    <FontAwesomeIcon icon={faBars}/>
                </button>

                {/* Logo */}
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

                {/* Right: Avatar with Material UI Menu */}
                <nav className={"flex flex-row gap-6 items-center justify-center"}>
                    <nav className="navLinks hidden md:block uppercase">
                        <ul className="flex items-center text-white border p-2"><Link href={"/quizzes"} className={"flex justify-center items-center gap-2"}>
                            <Image className={"bg-white"} src={"/images/exam3.png"} alt={"exam icon"} width={35} height={35}/>
                            Start Learning
                        </Link>
                        </ul>
                    </nav>
                    <IconButton
                        onClick={handleAvatarClick}
                        size="small"
                        sx={{ml: 2}}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar sx={{width: 32, height: 32, bgcolor: '#3f51b5'}}>
                            {userInfo ? userInfo.name?.charAt(0)?.toUpperCase() : <PersonIcon/>}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    >
                        {!userInfo || Object.keys(userInfo).length === 0 ? (
                            <>
                                <MenuItem component={Link} href="/login" onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <LoginIcon fontSize="small"/>
                                    </ListItemIcon>
                                    Login
                                </MenuItem>
                                <MenuItem component={Link} href="/signup" onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <PersonAddIcon fontSize="small"/>
                                    </ListItemIcon>
                                    Sign Up
                                </MenuItem>
                            </>
                        ) : (
                            <>
                                <MenuItem component={Link} href="/overview" onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small"/>
                                    </ListItemIcon>
                                    Profile
                                </MenuItem>
                                <MenuItem component={Link} href="/history" onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <HistoryIcon fontSize="small"/>
                                    </ListItemIcon>
                                    History
                                </MenuItem>
                                <MenuItem component={Link} href="/profile/edit" onClick={handleMenuClose}>
                                    <ListItemIcon>
                                        <EditIcon fontSize="small"/>
                                    </ListItemIcon>
                                    Edit Profile
                                </MenuItem>
                                <Divider/>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small"/>
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </>
                        )}
                    </Menu>
                </nav>

                {/* Drawer (Mobile Nav) */}
                {openDrawer && (
                    <div
                        ref={drawerRef}
                        className={`absolute z-10 left-0 top-[calc(4vw+1.8rem)] bg-[rgba(2,18,34,.8)] h-[90vh] w-[40%] transition-transform duration-500 ease-in-out ${isAnimating ? 'menu-drawer hide' : 'menu-drawer'} flex items-center px-4 py-2`}
                    >
                        <nav className="navLinks" >
                            <ul className="flex text-white flex-col items-start justify-center uppercase">
                                {navElements.map(item => item.element)}
                            </ul>
                        </nav>
                    </div>
                )}

            </header>}
        </>
    );
}

export default Header;