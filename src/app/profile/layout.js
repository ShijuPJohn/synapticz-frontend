"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Profile({ children }) {
    const pathname = usePathname()

    const isActive = (path) => pathname === path

    return (
        <div className="m-2 w-full md:w-[70%]">
            <div className="flex gap-4 bg-gray-100 px-4 pt-4 ">
                <Tab href="/profile/overview" label="Overview" active={isActive('/profile/overview')} />
                <Tab href="/profile/history" label="Test History" active={isActive('/profile/history')} />
                <Tab href="/profile/bookmarked-questions" label="Bookmarks" active={isActive('/profile/bookmarked-questions')} />
                <Tab href="/profile/saved-explanations" label="Saved Explanations" active={isActive('/profile/saved-explanations')} />

            </div>

            <div>{children}</div>
        </div>
    )
}

function Tab({ href, label, active }) {
    return (
        <Link
            href={href}
            className={`pb-2 border-b-[3px] ${active ? 'border-blue-500 font-semibold': 'border-transparent text-slate-700'}`}
        >
            {label}
        </Link>
    )
}
