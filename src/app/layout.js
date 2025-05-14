import "./globals.css";
import './fontawesome';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v14-appRouter';
import ComponentsWrapper from "@/components/ComponentsWrapper";
import Head from "next/head";
import React from "react";

export const metadata = {
    title: "Synapticz",
    description: "Think-Recall-Retain",
    openGraph: {
        images: "https://synapticz.com/images/icon.png",
    },
};
export default function RootLayout({children}) {
    return (
        <html lang="en">
        <head>
            <title>Synapticz</title>
            <link rel="icon" href="/images/favicon.ico"/>
            {/*<link rel="icon" href="/images/icon.svg" type="image/svg+xml" />*/}
            <link
                rel="icon"
                href="/images/icon.png"
                type="image/<generated>"
                sizes="<generated>"
            />
            <link rel="apple-touch-icon" href="/images/icon.png" />
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com"/>
            <link
                href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                rel="stylesheet"/>
        </head>
        <body
            // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <AppRouterCacheProvider>
            <ComponentsWrapper>
                {children}
            </ComponentsWrapper>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
