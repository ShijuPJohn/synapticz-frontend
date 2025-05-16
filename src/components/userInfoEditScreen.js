import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {fetchURL} from '@/constants';
import {
    Card,
    CardHeader,
    Avatar,
    CardContent,
    Grid,
    Typography,
    Divider,
    Chip,
    Skeleton,
    Box,
    Paper
} from '@mui/material';
import {
    Email,
    Phone,
    Public,
    Person,
    VerifiedUser,
    Star,
    CalendarToday,
    LockClock,
    Facebook,
    Instagram,
    LinkedIn
} from '@mui/icons-material';

function UserInfoEditScreen({userId}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;

    useEffect(() => {
        fetchUserInfo();
    }, []);

    async function fetchUserInfo() {
        try {
            setLoading(true);
            const response = await fetch(`${fetchURL}/admin/users/${userId}`, {
                headers: getHeaders()
            });
            const data = await response.json();
            setUser(data.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }

    function getHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`,
        };
    }

    const renderDetailItem = (icon, label, value, fallback = 'Not provided') => (
        <Grid item xs={12} sm={6} sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
            {icon}
            <Box>
                <Typography variant="subtitle2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body1">
                    {value || <span style={{color: '#999', fontStyle: 'italic'}}>{fallback}</span>}
                </Typography>
            </Box>
        </Grid>
    );

    if (loading) {
        return (
            <Card sx={{maxWidth: 800, mx: 'auto', my: 4}}>
                <CardHeader
                    avatar={<Skeleton variant="circular" width={80} height={80}/>}
                    title={<Skeleton width="60%"/>}
                    subheader={<Skeleton width="40%"/>}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {[...Array(8)].map((_, i) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Skeleton variant="rectangular" height={50}/>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return <Typography>User not found</Typography>;
    }

    return (
            <Card sx={{maxWidth: "100%", height:"100%", mx: 'auto', border:"none", outline:'none'}}>
                <CardHeader
                    avatar={
                        <Avatar
                            src={user.profile_pic}
                            sx={{width: 150, height: 150}}
                            alt={user.name}
                        >
                            {user.name.charAt(0)}
                        </Avatar>
                    }
                    title={
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Typography variant="h5" component="div">
                                {user.name}
                            </Typography>
                            {user.verified && (
                                <Chip
                                    icon={<VerifiedUser fontSize="small"/>}
                                    label="Verified"
                                    color="success"
                                    size="small"
                                />
                            )}
                            {user.is_premium && (
                                <Chip
                                    icon={<Star fontSize="small"/>}
                                    label="Premium"
                                    color="warning"
                                    size="small"
                                />
                            )}
                        </Box>
                    }
                    subheader={
                        <Chip
                            icon={<Person fontSize="small"/>}
                            label={user.role.toUpperCase()}
                            variant="outlined"
                            size="small"
                        />
                    }
                />

                <Divider/>

                <CardContent>
                    <Grid container spacing={2}>
                        {renderDetailItem(<Email color="primary"/>, "Email", user.email)}
                        {renderDetailItem(<Phone color="primary"/>, "Mobile", user.mobile_number)}
                        {renderDetailItem(<Public color="primary"/>, "Country", user.country)}
                        {renderDetailItem(
                            <CalendarToday color="primary"/>,
                            "Member since",
                            new Date(user.created_at).toLocaleDateString()
                        )}
                        {renderDetailItem(
                            <LockClock color="primary"/>,
                            "Last password change",
                            new Date(user.password_changed_at).toLocaleDateString()
                        )}

                        {/* About Section */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{p: 2, bgcolor: 'background.default'}}>
                                <Typography variant="subtitle1" gutterBottom>
                                    About
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {user.about || "No information provided"}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Goal Section */}
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{p: 2, bgcolor: 'background.default'}}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Goal
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {user.goal || "No goals specified"}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Social Links */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Social Links
                            </Typography>
                            <Box sx={{display: 'flex', gap: 2}}>
                                {user.social_links?.facebook && (
                                    <Chip
                                        icon={<Facebook/>}
                                        label="Facebook"
                                        component="a"
                                        href={user.social_links.facebook}
                                        target="_blank"
                                        clickable
                                    />
                                )}
                                {user.social_links?.instagram && (
                                    <Chip
                                        icon={<Instagram/>}
                                        label="Instagram"
                                        component="a"
                                        href={user.social_links.instagram}
                                        target="_blank"
                                        clickable
                                    />
                                )}
                                {user.social_links?.linkedin && (
                                    <Chip
                                        icon={<LinkedIn/>}
                                        label="LinkedIn"
                                        component="a"
                                        href={user.social_links.linkedin}
                                        target="_blank"
                                        clickable
                                    />
                                )}
                                {!user.social_links?.facebook && !user.social_links?.instagram && !user.social_links?.linkedin && (
                                    <Typography variant="body2" color="text.secondary">
                                        No social links provided
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
    );
}

export default UserInfoEditScreen;