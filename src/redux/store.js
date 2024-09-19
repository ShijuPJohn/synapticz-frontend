// redux/store.js
import {configureStore} from '@reduxjs/toolkit';
import {createWrapper} from "next-redux-wrapper";
import {nextReducer} from "@/redux/authSlice";

const store = configureStore({
    reducer: {
        user: nextReducer
    }
})
export default store
store.subscribe(() => {
    localStorage.setItem('store', JSON.stringify(store.getState()))
})
export const wrapper = createWrapper(store)