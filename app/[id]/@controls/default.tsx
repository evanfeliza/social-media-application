import Link from 'next/link'
import React from 'react'
import ProfileHandle from '@/components/libs/profile-handle'
import { createClient } from '@/utils/supabase/server'

const ControlsSection = async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    return (
        <div className="h-full drawer drawer-open menu bg-base-300 rounded-box " >
            <ul className="menu-md h-full w-full">
                <li>
                    <Link href={`/${user?.id}/settings`}>
                        <ProfileHandle />
                    </Link>
                </li>

                <li>
                    <Link href={`//${user?.id}/liked-posts`}>
                        <i className="fi fi-rr-heart mt-1"></i>
                        <span >Liked Posts</span>
                    </Link>
                </li>

                <li className='w-full'>
                    <Link href="/auth/logout">
                        <i className="fi fi-rr-power mt-1"></i>
                        <span className='not-italic '>Signout</span>
                    </Link>
                </li>
            </ul>
        </div >
    )
}

export default ControlsSection