"use client"
import React, {useEffect, useRef, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "@/redux/authSlice";
import Image from 'next/image';
import {Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {protectedRoutePrefixes} from "@/constants";
import {usePathname, useRouter} from "next/navigation";
import {AutoFixHigh, Diversity1, NoteAdd, PeopleOutline} from "@mui/icons-material";

function Header() {
    const drawerTimeout = useRef(null);
    const drawerRef = useRef(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const userLogin = useSelector(state => state.user);
    const {userInfo} = userLogin;
    const [hydrated, setHydrated] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

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
        const isProtected = protectedRoutePrefixes.some((prefix) =>
            pathname.startsWith(prefix)
        );

        if (isProtected) {
            router.push("/login");
        }
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
        {
            id: 'verified_quizzes', element: <li key="verified_quizzes" className="header-list-item">
                <Link href="/verified-quizzes">Verified Quizzes</Link>
            </li>
        },{
            id: 'quizzes', element: <li key="quizzes" className="header-list-item">
                <Link href="/quizzes">User Generated</Link>
            </li>
        },
        ...(userInfo && Object.keys(userInfo).length ? [
            (userInfo.role === 'admin' || userInfo.role === 'owner') &&
            {
                id: 'admin-dashboard', element: <li key="admin-dashboard" className="header-list-item">
                    <Link href="/admin">Admin Dashboard</Link>
                </li>
            },
            {
                id: 'generator', element: <li key="generator" className="header-list-item">
                    <Link href="/ai-quiz-generator">AI Quiz Generator</Link>
                </li>
            },
            {
                id: 'profile', element: <li key="profile" className="header-list-item">
                    <Link href="/profile">Profile</Link>
                </li>
            },
            {
                id: 'overview', element: <li key="overview" className="header-list-item">
                    <Link href="/edit-profile">Edit Profile</Link>
                </li>
            },
            {
                id: 'create-quiz', element: <li key="create" className="header-list-item">
                    <Link href="/create-quiz">Quiz Studio</Link>
                </li>
            },
            {
                id: 'logout', element: <li key="logout" className="header-list-item">
                    <button className="logout-btn" onClick={handleLogout}>
                        LOGOUT
                    </button>
                </li>
            }
        ] : [
            {
                id: 'generator', element: <li key="generator" className="header-list-item">
                    <Link href="/ai-quiz-generator">AI Quiz Generator</Link>
                </li>
            },
            {
                id: 'login', element: <li key="login" className="header-list-item">
                    <Link href="/login">Login</Link>
                </li>
            },
            {
                id: 'signup', element: <li key="signup" className="header-list-item">
                    <Link href="/signup">Signup</Link>
                </li>
            }
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
                        className={`absolute z-10 left-0 top-[calc(4vw+1.8rem)] bg-[rgba(2,18,34,.8)] h-[calc(100vh-4vw-1.8rem)] w-[55%] transition-transform duration-500 ease-in-out ${isAnimating ? 'menu-drawer hide' : 'menu-drawer'} flex flex-col justify-around items-center px-4 py-2`}
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
                            {/*LOGO*/}
                        </div>
                    </Link>
                </h1>
                <nav className="navLinks hidden md:flex md:gap-2 uppercase  justify-center">
                    <ul className="flex items-center text-white border border-[#3583a5] p-2"><Link
                        href={"/verified-quizzes"}
                        className={"flex justify-center items-center gap-2"}>
                        <Image className={"bg-[#3583a5]"} src={"/images/exam3.png"} alt={"exam icon"} width={35}
                               height={35}/>
                        Verified Quizzes
                    </Link>
                    </ul>
                    {(userInfo.role === 'admin' || userInfo.role === 'owner') &&
                        <ul className="flex items-center text-white border border-[#3583a5] p-2"><Link href={"/admin"}
                                                                                                       className={"flex justify-center items-center gap-2"}>
                            Admin Dashboard
                        </Link>
                        </ul>
                    }
                    <IconButton
                        onClick={handleAvatarClick}
                        size="small"
                        sx={{ml: 2}}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar sx={{width: 32, height: 32, bgcolor: '#3583a5'}}>
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
                                    bgcolor: '#4998c3',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    >
                        {!userInfo || Object.keys(userInfo).length === 0 ? [
                            <MenuItem component={Link} href="/ai-quiz-generator" onClick={handleMenuClose}
                                      key="generator">
                                <ListItemIcon>
                                    <AutoFixHigh fontSize="small"/>
                                </ListItemIcon>
                                AI Quiz Generator
                            </MenuItem>,
                            <MenuItem component={Link} href="/quizzes" onClick={handleMenuClose}
                                      key="user_generated">
                                <ListItemIcon>
                                    <AutoFixHigh fontSize="small"/>
                                </ListItemIcon>
                                User Generated
                            </MenuItem>,
                            <MenuItem component={Link} href="/login" onClick={handleMenuClose} key="login">
                                <ListItemIcon>
                                    <LoginIcon fontSize="small"/>
                                </ListItemIcon>
                                Login
                            </MenuItem>,
                            <MenuItem component={Link} href="/signup" onClick={handleMenuClose} key="signup">
                                <ListItemIcon>
                                    <PersonAddIcon fontSize="small"/>
                                </ListItemIcon>
                                Sign Up
                            </MenuItem>
                        ] : [
                            <MenuItem component={Link} href="/quizzes" onClick={handleMenuClose}
                                      key="user_generated">
                                <ListItemIcon>
                                    <Diversity1 fontSize="small"/>
                                </ListItemIcon>
                                User Generated
                            </MenuItem>,
                            <MenuItem component={Link} href="/profile" onClick={handleMenuClose} key="profile">
                                <ListItemIcon>
                                    <PersonIcon fontSize="small"/>
                                </ListItemIcon>
                                Profile
                            </MenuItem>,
                            <MenuItem component={Link} href="/ai-quiz-generator" onClick={handleMenuClose}
                                      key="generator">
                                <ListItemIcon>
                                    <AutoFixHigh fontSize="small"/>
                                </ListItemIcon>
                                AI Quiz Generator
                            </MenuItem>,
                            <MenuItem component={Link} href="/edit-profile" onClick={handleMenuClose}
                                      key="edit-profile">
                                <ListItemIcon>
                                    <EditIcon fontSize="small"/>
                                </ListItemIcon>
                                Edit Profile
                            </MenuItem>,
                            <MenuItem component={Link} href="/create-quiz" onClick={handleMenuClose} key="create">
                                <ListItemIcon>
                                    <NoteAdd fontSize="small"/>
                                </ListItemIcon>
                                Quiz Studio
                            </MenuItem>,
                            <Divider key="divider"/>,
                            <MenuItem onClick={handleLogout} key="logout">
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small"/>
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        ]}
                    </Menu>
                </nav>
            </header>}
        </>
    );
}

export default Header;