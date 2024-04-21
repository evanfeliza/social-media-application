import React from 'react'

const SettingsLayout = async ({
    children,
    relationships
}: {
    children: React.ReactNode;
    relationships: React.ReactNode;
}) => {

    return (
        <div className="max-h-full w-full rounded-xl bg-base-200/10 px-4 py-6">
            {children}
            {relationships}
        </div>
    )
}

export default SettingsLayout