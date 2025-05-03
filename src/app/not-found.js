// app/not-found.js
'use client';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center text-center px-6 text-gray-800">
            <h1 className="text-6xl font-extrabold mb-4 text-blue-600">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Oops! Lost in space?</h2>
            <p className="text-lg mb-6 max-w-md">
                We couldn’t find the page you were looking for. If it’s not you, it’s probably us.
                We’ll fix it shortly!
            </p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Go back home
            </Link>
        </div>
    );
}
