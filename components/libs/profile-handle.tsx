import React from 'react'
import dynamic from 'next/dynamic'

const DynamicAvatar = dynamic(() => import(`./avatar`), { ssr: false })

const ProfileHandle = ({ email, displayName }: { email: string, displayName: string }) => {
    return (

        <>
            <div className="avatar flex-1">
                <div className="w-10 rounded-full mr-2">
                    <DynamicAvatar email={email} />
                </div>
                <p className="my-auto font-semibold text-md break-all">{`@${displayName}`}</p>
            </div>

        </>

    )
}

export default ProfileHandle