import DarkModeToggle from '@/components/libs/dark-mode-toggle'
import React from 'react'

const SignInLayout = async ({
    children,
}: {
    children: React.ReactNode
}) => {

    return (
        <div className="container  mx-auto relative">
            <div className="absolute top-3 left-3">
                <DarkModeToggle />
            </div>
            {children}
        </div>
    )
}

export default SignInLayout