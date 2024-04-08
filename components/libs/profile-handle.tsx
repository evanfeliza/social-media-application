import React from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/server'



const DynamicAvatar = dynamic(() => import(`./avatar`), { ssr: false })

const ProfileHandle = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (

        <div className="max-h-full max-w-full grid grid-flow-col gap-2">
            <div className="avatar">
                <div className="w-10 rounded-full mx-auto">
                    <DynamicAvatar email={user?.email as string} />
                </div>
            </div>
            <div className='my-auto'>
                <p className="font-bold text-md">{`@${user?.user_metadata?.displayName}`}</p>
            </div>
        </div>

    )
}

export default ProfileHandle