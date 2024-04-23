import React from 'react'

const UserProfileLayout
    = async ({
        children,
    }: {
        children: React.ReactNode;
    }) => {

        return (
            <div className="max-h-full h-full w-full  bg-base-200/40 p-4">
                {children}
            </div>
        )
    }

export default UserProfileLayout