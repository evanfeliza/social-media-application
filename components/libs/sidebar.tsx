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

    return <div className="h-full drawer drawer-open menu bg-base-100 px-6 py-4">
        <ul className="menu-md max-h-full w-full space-y-5">
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
                        "fi fi-rr-rss mt-1 text-2xl"></i>
                    <span >Feed</span>
                </Link>
            </li>
            <li>
                <Link href={`/${data?.id}/liked-posts`}>
                    <i className="fi fi-rr-heart mt-1 text-2xl"></i>
                    <span >Liked Posts</span>
                </Link>
            </li>
            <li className='w-full'>
                <Link href="/auth/logout">
                    <i className="fi fi-rr-power mt-1 text-2xl"></i>
                    <span className='not-italic '>Signout</span>
                </Link>
            </li>
            <li className='w-full'>
                <Link href={`/${data?.id}/bug-report`} className=''>
                    <i className="fi fi-rs-bug mt-1 text-2xl"></i>
                    <span className='not-italic'>Report a Bug</span>
                </Link>
            </li>
        </ul>
    </div >
}

export default SidebarControls