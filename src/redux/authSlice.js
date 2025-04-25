"use client"
import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {fetchURL, protectedRoutePrefixes} from "@/constants";

function getFromLocalStorage() {
    if (typeof window === 'undefined') {
        // Server-side rendering, return default initial state
        return {loading: false, userInfo: {}, pendingSignupEmail: null};
    }
    try {
        const serializedStore = localStorage.getItem("store");
        if (serializedStore === null) {
            return {loading: false, userInfo: {}, pendingSignupEmail: null};
        }
        return JSON.parse(serializedStore).user;
    } catch (e) {
        return {loading: false, userInfo: {}};
    }
}

export const userSlice = createSlice({
    name: 'user',
    initialState: getFromLocalStorage(),
    reducers: {
        loginRequest: (state) => {
            state.loading = true
        },
        loginFail: (state,action) => {
            state.loading = false
            state.userInfo = {}
            enqueueSnackbar('Login Failed : '+action.payload, {variant: "error"})
        },
        login: (state, action) => {
            state.loading = false
            state.userInfo = action.payload
            enqueueSnackbar('Logged In. Redirecting to home page.', {variant: "success"})
        },
        signup: (state, action) => {
            state.loading = false
            state.userInfo = action.payload
            enqueueSnackbar('Logged In. Add profile details', {variant: "success"})
        },
        signupFail: (state, action) => {
            state.loading = false
            enqueueSnackbar('Signup Error ' + action.payload, {variant: "error"})
        },
        logout: (state) => {
            state.loading = false;
            state.userInfo = {};
            state.pendingSignupEmail = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem("store");
            }
            enqueueSnackbar('Logged Out', {variant: "error"})
        },
        setPendingSignup: (state, action) => {
            state.pendingSignupEmail = action.payload;
            state.loading = false;
        },
        clearPendingSignup: (state) => {
            state.pendingSignupEmail = null;
        }
    }
})
export const {
    setPendingSignup,
    clearPendingSignup,
    signup,
    loginRequest,
    login,
    logout,
    loginFail,
    signupFail
} = userSlice.actions
export const userReducer = userSlice.reducer

export const loginThunk = (email, password) => async (dispatch) => {
    try {
        dispatch(loginRequest())
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        const {data} = await axios.post(
            `${fetchURL}/auth/login`,
            {email, password},
            config
        )
        dispatch(login(data))
    } catch (e) {
        dispatch(loginFail(e.message))

        // if (e.response.status === 401) {
        //     enqueueSnackbar('Incorrect email or password', {variant: "error"})
        // }
        console.log(e);
    }
}

export const signupThunk = (name, email, password) => async (dispatch) => {
    try {
        dispatch(loginRequest());
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        await axios.post(`${fetchURL}/auth/users`, {name, email, password}, config);
        dispatch(setPendingSignup(email));
        enqueueSnackbar('Verification code sent to your email', {variant: "info"});
    } catch (e) {
        dispatch(signupFail(e.message || "Signup error"));
    }
}

export const verifyEmailThunk = ({email, code}) => async (dispatch) => {
    try {
        const {data} = await axios.post(`${fetchURL}/auth/users/verify`, {email, code});
        dispatch(signup(data));
        dispatch(clearPendingSignup());
    } catch (e) {
        enqueueSnackbar('Verification failed. Check the code.', {variant: "error"});
        console.log("Verification error:", e);
    }
};