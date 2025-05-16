'use client'
import React, {Suspense, useEffect, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Pagination
} from '@mui/material'
import {
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Star as PremiumIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faCrown,
    faEnvelope,
    faGlobe,
    faShieldAlt,
    faUser
} from '@fortawesome/free-solid-svg-icons'
import {fetchURL} from "@/constants";
import {useSelector} from "react-redux";
import UserInfoEditScreen from "@/components/userInfoEditScreen";

function UsersDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [infoEditModalShow, setInfoEditModalShow] = useState(false)
    const userLogin = useSelector((state) => state.user);
    const [currentUserId, setCurrentUserId] = useState(null)
    const {userInfo} = userLogin;
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    })
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        country: '',
        isPremium: '',
        verified: ''
    })

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    useEffect(() => {
        fetchUsers()
    }, [pagination.page, filters])

    useEffect(() => {
        if (!(userInfo.role === 'admin' || userInfo.role === 'owner')) {
            router.push('/quizzes')
        }
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            })

            const response = await fetch(`${fetchURL}/admin/users?${params}`, {headers: getHeaders()})
            const data = await response.json()
            setUsers(data.data.users)
            setPagination(prev => ({
                ...prev,
                total: data.data.pagination.total,
                totalPages: data.data.pagination.total_pages
            }))
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (event, value) => {
        setPagination(prev => ({...prev, page: value}))
    }

    const handleFilterChange = (e) => {
        const {name, value} = e.target
        setFilters(prev => ({...prev, [name]: value}))
        setPagination(prev => ({...prev, page: 1}))
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            role: '',
            country: '',
            isPremium: '',
            verified: ''
        })
    }

    useEffect(() => {
        if (currentUserId) {
            setInfoEditModalShow(true);
        }
    }, [currentUserId])

    return (
        <main>
            <div className="bg-white rounded-lg shadow-md mx-auto w-full md:w-[80%] xl:w-[70%] my-4">
                <div className="bg-blue-600 text-white p-4 rounded-t-lg w-full flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-xl font-bold">User Management</h1>
                    <div className="flex items-center mt-2 sm:mt-0">
                        <span className="mr-4 hidden sm:block">{pagination.total} Total Users</span>
                        <button
                            onClick={fetchUsers}
                            className="text-white hover:bg-blue-700 p-2 rounded-full"
                            title="Refresh"
                        >
                            <RefreshIcon />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                        </select>

                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            name="isPremium"
                            value={filters.isPremium}
                            onChange={handleFilterChange}
                        >
                            <option value="">All</option>
                            <option value="true">Premium</option>
                            <option value="false">Regular</option>
                        </select>

                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            name="verified"
                            value={filters.verified}
                            onChange={handleFilterChange}
                        >
                            <option value="">All</option>
                            <option value="true">Verified</option>
                            <option value="false">Not Verified</option>
                        </select>

                        <button
                            onClick={resetFilters}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FilterIcon className="mr-2" />
                            Reset
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto mb-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Country
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setCurrentUserId(user.id)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.profile_pic ? (
                                                            <img className="h-10 w-10 rounded-full" src={user.profile_pic} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="lg:hidden text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 opacity-60" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {user.role === 'admin' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                                                        <span className="hidden sm:inline">Admin</span>
                                                    </span>
                                                ) : user.role === 'owner' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        <FontAwesomeIcon icon={faCrown} className="mr-1" />
                                                        <span className="hidden sm:inline">Owner</span>
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        <FontAwesomeIcon icon={faUser} className="mr-1" />
                                                        <span className="hidden sm:inline">User</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-4">
                                                {user.country ? (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                                                        {user.country}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex space-x-2">
                                                    {user.is_premium && (
                                                        <span title="Premium User">
                                                            <PremiumIcon className="text-blue-500" />
                                                        </span>
                                                    )}
                                                    {user.verified && (
                                                        <span title="Verified">
                                                            <VerifiedIcon className="text-green-500" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing {users.length} of {pagination.total} users
                                </div>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={pagination.page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                    size="small"
                                    className="flex-shrink-0"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Dialog
                open={infoEditModalShow}
                onClose={() => setInfoEditModalShow(false)}
                fullWidth
                maxWidth="lg"
                classes={{ paper: 'm-2' }}
            >
                <DialogTitle>User Details</DialogTitle>
                <DialogContent className="p-4 border-none shadow-none">
                    <div className="w-full">
                        <UserInfoEditScreen userId={currentUserId}/>
                    </div>
                </DialogContent>
                <DialogActions className={"border-none"}>
                    <button
                        onClick={() => setInfoEditModalShow(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                    >
                        Close
                    </button>
                </DialogActions>
            </Dialog>
        </main>
    )
}

function Page() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <UsersDashboard/>
        </Suspense>
    );
}

export default Page;