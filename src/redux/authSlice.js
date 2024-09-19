import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {enqueueSnackbar} from "notistack";
import {fetchURL} from "@/constants";

function getFromLocalStorage() {
    if (typeof window === 'undefined') {
        // Server-side rendering, return default initial state
        return { loading: false, userInfo: {} };
    }
    try {
        const serializedStore = localStorage.getItem("store");
        if (serializedStore === null) {
            return {loading: false, userInfo: {}};
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
        loginFail: (state) => {
            state.loading = false
            state.userInfo = {}
            enqueueSnackbar('Login Failed', {variant: "error"})
        },
        login: (state, action) => {
            state.loading = false
            state.userInfo = action.payload
            enqueueSnackbar('Logged In', {variant: "success"})
        },
        logout: (state) => {
            state.loading = false
            state.userInfo = {}
            enqueueSnackbar('Logged Out')
        }
    }
})
export const {signup, loginRequest, login, logout, loginFail} = userSlice.actions
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
        console.log("attempted login", data)
        dispatch(login(data))
    } catch (e) {
        dispatch(loginFail())
        if (e.response.status === 401) {
            enqueueSnackbar('Incorrect email or password', {variant: "error"})
        }
    }
}

export const signupThunk = (username, email, password) => async (dispatch) => {
    try {
        dispatch(loginRequest())
        const config = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        const {data} = await axios.post(
            `${fetchURL}/users`,
            {username, email, password},
            config
        )
        dispatch(login(data))
    } catch (e) {
        dispatch(loginFail())
    }
}