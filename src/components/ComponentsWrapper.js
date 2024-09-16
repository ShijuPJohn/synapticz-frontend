'use client';
import React from 'react';
// import {Provider} from "react-redux";
// import store from "@/app/store";
import {SnackbarProvider} from "notistack";
import Header from "@/components/header";

const ComponentsWrapper = ({children}) => {
    return (
        // <Provider store={store}>
        <>
            <Header/>
            <SnackbarProvider autoHideDuration={4000}>
                {children}
            </SnackbarProvider>
            {/*<Footer/>*/}
        {/*</Provider>*/}
        </>
    );
};

export default ComponentsWrapper;