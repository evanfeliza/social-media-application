"use client"
import Link from 'next/link'
import React from 'react'
import ProfileHandle from './profile-handle'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'


const supabase = createClient()

const getUser =
    async () => {
        const {
            data: {
                user
            }
        } =
            await supabase.auth.getUser();

        return user;
    };


const SidebarProfileSkeleton = () => {
    return <>
        <li>
            <div className="max-h-full max-w-full grid grid-flow-col gap-2">
                <div className="avatar">
                    <div className="w-10 h-10 rounded-full mx-auto">
                    </div>
                </div>
                <div className="skeleton h-5 my-auto">

                </div>
            </div>
        </li>
    </>
}

const SidebarControls = () => {
    const { data, isFetching } = useQuery({ queryKey: ['profileInfo'], queryFn: getUser })

    return <div className="h-full drawer drawer-open menu bg-base-100 rounded-box mt-1 " >
        <ul className="menu-md max-h-full w-full">
            {!isFetching ? <>
                <li>
                    <Link href={`/${data?.id}/settings`}>
                        <ProfileHandle email={data?.email as string} displayName={data?.user_metadata.display_name as string} />
                    </Link>
                </li>
            </> : <SidebarProfileSkeleton />}
            <li>
                <Link href={`/${data?.id}`}>
                    <i className=
                        "fi fi-rr-rss mt-1"></i>
                    <span >Feed</span>
                </Link>
            </li>
            <li>
                <Link href={`/${data?.id}/liked-posts`}>
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

        <Link href={`/${data?.id}/bug-report`} className='mt-auto btn btn-block btn-ghost btn-xs'>
            <i className="fi fi-rs-bug"></i>
            <span className='not-italic'>Report a Bug</span>
        </Link>
    </div >
}

export default SidebarControls