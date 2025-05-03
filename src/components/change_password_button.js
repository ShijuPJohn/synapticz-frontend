import React, {useState} from 'react';
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {fetchURL} from "@/constants";
import axios from "axios";
import {enqueueSnackbar} from "notistack";

function ChangePasswordButton({resetPasswordBtn}) {
    const [showPassword, setShowPassword] = useState(false);

    const [openForgotModal, setOpenForgotModal] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [code, setCode] = useState('');
    const [codeVerified, setCodeVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailDisabled, setEmailDisabled] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleClickShowPassword = () => setShowPassword(!showPassword);


    const handlePasswordReset = async ({
                                           email,
                                           code,
                                           newPassword,
                                           confirmPassword,
                                           emailSent,
                                           codeVerified,
                                           fetchURL,
                                           setErrorMsg,
                                           setLoading,
                                           setEmailDisabled,
                                           setEmailSent,
                                           setCodeVerified,
                                           setOpenForgotModal
                                       }) => {
        setErrorMsg('');
        setLoading(true);

        try {
            if (!emailSent) {
                await axios.post(`${fetchURL}/auth/password-reset`, {email});
                setEmailDisabled(true);
                setEmailSent(true);
            } else if (!codeVerified) {
                await axios.post(`${fetchURL}/auth/reset-code`, {email, code});
                setCodeVerified(true);
            } else {
                if (newPassword !== confirmPassword) {
                    setErrorMsg("Passwords don't match");
                    return;
                }
                await axios.post(`${fetchURL}/auth/reset-password`, {
                    email,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                    code
                });
                setOpenForgotModal(false);
                setEmailSent(false);
                setCodeVerified(false);
                setLoading(false);
                setEmailDisabled(false);
                enqueueSnackbar("Password reset successfully.", {variant: "success"});
            }

        } catch (err) {
            enqueueSnackbar("Couldn't reset password", {variant: "error"});
            const msg = err?.response?.data?.error || err.message || 'Something went wrong';
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="prop-btn"
            onClick={()=>{
                setOpenForgotModal(true);
            }}
            >
                {resetPasswordBtn}
            </div>
            <Dialog open={openForgotModal} onClose={() => setOpenForgotModal(false)}
                    fullWidth
                    sx={{'& .MuiDialog-paper': {minHeight: "15rem"}}}>
                <DialogTitle>Enter you email</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2 py-4">
                    {/* Email Field */}
                    <div className="email0-textfield-container py-2">
                        <TextField
                            label="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={emailDisabled}
                            fullWidth
                            error={!!errorMsg}
                            helperText={errorMsg}
                        />
                    </div>

                    {/* Code Field */}
                    {emailSent && !codeVerified && (<TextField
                        label="Verification Code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        fullWidth
                    />)}

                    {/* Password Fields */}
                    {codeVerified && (<>
                        <TextField
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            fullWidth
                        />
                    </>)}
                </DialogContent>
                <DialogActions>
                    {loading ? (<CircularProgress size={24}/>) : (<Button
                        onClick={() => handlePasswordReset({
                            email,
                            code,
                            newPassword,
                            confirmPassword,
                            emailSent,
                            codeVerified,
                            fetchURL,
                            setErrorMsg,
                            setLoading,
                            setEmailDisabled,
                            setEmailSent,
                            setCodeVerified,
                            setOpenForgotModal
                        })}
                    >
                        {codeVerified ? "Reset Password" : emailSent ? "Verify Code" : "Submit"}
                    </Button>)}
                </DialogActions>
            </Dialog></>
    );
}

export default ChangePasswordButton;