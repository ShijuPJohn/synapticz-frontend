'use client'
import React, {Suspense, useEffect, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip
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
    faCrown, faEdit,
    faEnvelope,
    faGlobe,
    faListCheck, faPlus,
    faQuestion,
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
            "Content-Type": "application/json", Authorization: `Bearer ${userInfo.token}`,
        };
    }

    useEffect(() => {
        fetchUsers()
    }, [pagination.page, filters])

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
            console.log("data", data)
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
        setPagination(prev => ({...prev, page: 1})) // Reset to first page when filters change
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
    useEffect(()=>{
        if (currentUserId){
            setInfoEditModalShow(true);
        }
    },[currentUserId])

    return (
        <>
        <Card sx={{boxShadow: 3}}>
            <CardHeader
                title="User Management"
                action={
                    <div className={"flex items-center justify-center"}>
                        <div>
                            {pagination.total} Total Users
                        </div>
                        <Tooltip title="Refresh">
                            <IconButton onClick={fetchUsers}>
                                <RefreshIcon/>
                            </IconButton>
                        </Tooltip>

                    </div>
                }
                sx={{
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'white'
                }}
            />

            <CardContent>
                <Box sx={{display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap'}}>
                    <TextField
                        placeholder="Search users..."
                        variant="outlined"
                        size="small"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon/>
                                </InputAdornment>
                            ),
                        }}
                        sx={{flexGrow: 1, maxWidth: 400}}
                    />

                    <FormControl size="small" sx={{minWidth: 120}}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={filters.role}
                            onChange={handleFilterChange}
                            label="Role"
                        >
                            <MenuItem value=""><em>All Roles</em></MenuItem>
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="owner">Owner</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{minWidth: 120}}>
                        <InputLabel>Premium</InputLabel>
                        <Select
                            name="isPremium"
                            value={filters.isPremium}
                            onChange={handleFilterChange}
                            label="Premium"
                        >
                            <MenuItem value=""><em>All</em></MenuItem>
                            <MenuItem value="true">Premium</MenuItem>
                            <MenuItem value="false">Regular</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{minWidth: 120}}>
                        <InputLabel>Verified</InputLabel>
                        <Select
                            name="verified"
                            value={filters.verified}
                            onChange={handleFilterChange}
                            label="Verified"
                        >
                            <MenuItem value=""><em>All</em></MenuItem>
                            <MenuItem value="true">Verified</MenuItem>
                            <MenuItem value="false">Not Verified</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon/>}
                        onClick={resetFilters}
                    >
                        Reset
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}>
                        <CircularProgress/>
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} sx={{mb: 2}}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{backgroundColor: (theme) => theme.palette.grey[100]}}>
                                        <TableCell>User</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Country</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Joined</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} hover onClick={()=>{
                                            setCurrentUserId(user.id);

                                        }}>
                                            <TableCell>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Avatar src={user.profile_pic || undefined}>
                                                        {user.name.charAt(0)}
                                                    </Avatar>
                                                    {user.name}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                    <FontAwesomeIcon icon={faEnvelope} style={{opacity: 0.6}}/>
                                                    {user.email}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'admin' ? (
                                                    <Chip
                                                        icon={<FontAwesomeIcon icon={faShieldAlt}/>}
                                                        label="Admin"
                                                        color="warning"
                                                        size="small"
                                                    />
                                                ) : user.role === 'owner' ? (
                                                    <Chip
                                                        icon={<FontAwesomeIcon icon={faCrown}/>}
                                                        label="Owner"
                                                        color="secondary"
                                                        size="small"
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<FontAwesomeIcon icon={faUser}/>}
                                                        label="User"
                                                        color="primary"
                                                        size="small"
                                                        style={{padding:".4rem"}}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.country ? (
                                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                        <FontAwesomeIcon icon={faGlobe}/>
                                                        {user.country}
                                                    </Box>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex', gap: 1}}>
                                                    {user.is_premium && (
                                                        <Tooltip title="Premium User">
                                                            <PremiumIcon color="primary"/>
                                                        </Tooltip>
                                                    )}
                                                    {user.verified && (
                                                        <Tooltip title="Verified">
                                                            <VerifiedIcon color="success"/>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box>
                                Showing {users.length} of {pagination.total} users
                            </Box>
                            <Pagination
                                count={pagination.totalPages}
                                page={pagination.page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
            <Dialog open={infoEditModalShow} onClose={() => {
                setInfoEditModalShow(false)
            }}
                    sx={{'& .MuiDialog-paper': {minHeight: "15rem", minWidth: "80%", width: "100%", margin: "0"}}}
            >
                <DialogTitle>User Details</DialogTitle>
                <DialogContent className="flex flex-col lg:flex-row items-center justify-center gap-4 mt-2 border p-2 ">
                    <div className="w-full flex flex-col gap-2 lg:gap-4 mt-4 ">
                        <UserInfoEditScreen userId={currentUserId}/>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setInfoEditModalShow(false)
                    }}>Close</Button>
                    {/*<Button onClick={handleCreateQuestion} variant="contained" color="primary">*/}
                    {/*    Save*/}
                    {/*</Button>*/}
                </DialogActions>
            </Dialog>
        </>
    )
}
function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UsersDashboard/>
        </Suspense>
    );
}

export default Page;
