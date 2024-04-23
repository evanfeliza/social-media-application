import React from 'react'

const SettingsLayout
    = async ({
        children,
    }: {
        children: React.ReactNode;
    }) => {

        return (
            <div className="max-h-full h-full w-full  bg-base-200/40 px-4 py-6">
                {children}
            </div>
        )
    }

export default SettingsLayout