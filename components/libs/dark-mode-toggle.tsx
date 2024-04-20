"use client"
import { useState, useEffect } from 'react'



const DarkModeToggle = () => {
    const [theme, setTheme] = useState("corporate")
    useEffect(() => {
        document.querySelector("html")?.setAttribute("data-theme", theme)
        document.querySelector("html")?.classList.add("duration-100")
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === "forest" ? "corporate" : "forest")
    }
    return (
        <label className='swap swap-rotate'>
            <input onClick={toggleTheme} type='checkbox' />
            <i className="swap-on fi fi-ss-moon-stars"></i>
            <i className="swap-off fi fi-ss-brightness"></i>
        </label>
    )
}

export default DarkModeToggle