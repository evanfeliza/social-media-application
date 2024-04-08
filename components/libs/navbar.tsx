"use client"
import Link from 'next/link'
import React from 'react'
import DarkModeToggle from './dark-mode-toggle'

const Navbar = () => {

    return (
        <div className="navbar shadow-sm">
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-xl"><p className="font-bold tracking-wider"><span className="text-primary">Connect</span>opia</p></Link>
            </div>
            <div className="flex-1 justify-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-circle btn-ghost"><i className="fi fi-rr-apps"></i></div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-[7rem]">
                        <li ><DarkModeToggle /></li>
                        <Link href="/auth/logout">
                            <li >
                                <button className="btn btn-ghost btm-nav-sm text-xs w-full">
                                    Signout
                                </button>
                            </li>
                        </Link>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Navbar