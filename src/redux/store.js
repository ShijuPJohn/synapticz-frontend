// redux/store.js
import {configureStore} from '@reduxjs/toolkit';
import {createWrapper} from "next-redux-wrapper";
import {nextReducer, userReducer} from "@/redux/authSlice";

const store = configureStore({
    reducer: {
        user: userReducer,
    }
})
export default store
store.subscribe(() => {
    localStorage.setItem('store', JSON.stringify(store.getState()))
})
export const wrapper = createWrapper(store)