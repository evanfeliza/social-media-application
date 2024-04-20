"use client"
import Avatar from '@/components/libs/avatar'
import QueryProvider from '@/components/providers/query-provider'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher'
import { useParams, usePathname } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import { toast, Toaster } from 'sonner'

const supabase = createClient()

type UserProfiles = {
    id: string;
    email: string;
    display_name: string;
}


const getUsers = async (userId: string): Promise<UserProfiles[]> => {
    const { data: profiles } = await supabase
        .from('profiles')
        .select()
        .neq('id', userId)
    if (!profiles) {
        throw Error('No profiles found')
    }

    return profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name
    }))
}

const getFollowings = async (userId: string) => {
    const { data: followings } = await supabase
        .from('followings')
        .select('following_user_id')
        .eq('user_id', userId)

    return followings
}

const UserFollowCard = ({ user }: {
    user: {
        id: string;
        email: string;
        displayName: string;
        isFollowing: boolean;
    }
}) => {
    const queryClient = useQueryClient()
    const mutationFollowUser = useMutation({
        mutationFn: async (user: { id: string }) => {
            return await supabase
                .from('followings')
                .insert([
                    { following_user_id: user.id },
                ])
                .select()
        }
    })

    const mutationUnfollowUser = useMutation({
        mutationFn: async (user: { id: string }) => {
            return await supabase
                .from('followings')
                .delete()
                .eq("following_user_id", user.id)
        }
    })

    const handleMutationFollowUser = (user: { id: string, displayName: string }) => {
        mutationFollowUser.mutate(user, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['followingProfiles'] })
                toast.success(`You are now following ${user.displayName}!. Stay updated with their latest posts!`, { className: "tracking-widest text-xs" })
            },
            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })
    }

    const handleMutationUnfollowUser = (user: { id: string, displayName: string }) => {
        mutationUnfollowUser.mutate(user, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['followingProfiles'] })
                toast.success(`You have successfully unfollowed ${user.displayName}. You will no longer see their posts in your feed.`, { className: "tracking-widest text-xs" })
            },
            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })
    }

    return <li key={user.id} className='p-2 bg-base-100 rounded-lg w-full'>
        <div className="avatar flex">
            <div className="w-10 rounded-full mr-2">
                <Avatar email={user.email} />
            </div>
            <p className="my-auto font-semibold text-md break-all ">{user.displayName}</p>

        </div>

        <div className='join mt-2 w-full justify-end '>
            {user.isFollowing ? <>
                <div className='badge badge-success badge-outline w-1/2 join-item badge-lg text-xs pointer-events-none'>Following</div>
                <button className='btn btn-outline btn-xs w-1/2 join-item text-xs' onClick={() => handleMutationUnfollowUser({ id: user.id, displayName: user.displayName })}>Unfollow</button>
            </> : <><button className='btn btn-outline btn-xs join-item text-xs btn-block' onClick={() => handleMutationFollowUser({ id: user.id, displayName: user.displayName })}>Follow</button></>}
        </div>
    </li>
}

const UsersList = () => {
    const params = useParams()

    const { data: users, isFetching: isUsersFetching } = useQuery({ queryKey: ['users'], queryFn: () => getUsers(params?.id as string) })
    const { data: followingProfiles, isFetching: isFollowingProfileFetching } = useQuery({ queryKey: ['followingProfiles'], queryFn: () => getFollowings(params?.id as string) })

    const buildUserProfiles = (users: UserProfiles[], followings: { following_user_id: string }[]) => {
        if (!isFollowingProfileFetching) {
            const followingIds = new Set(followings.map(f => f.following_user_id))
            return users?.map(user => ({
                ...user,
                isFollowing: followingIds.has(user.id)
            }))
        }
    }

    const userProfiles = useMemo(() => {
        return buildUserProfiles(users as [], followingProfiles as []);
    }, [isUsersFetching, isFollowingProfileFetching])


    return <ul className="max-h-full w-full grid gap-2 grid-flow-row">
        {!isUsersFetching ? (userProfiles?.map(user => <UserFollowCard key={user.id} user={{ id: user.id, email: user.email, displayName: user.display_name, isFollowing: user.isFollowing }} />)) : <span className="mx-auto loading loading-dots loading-lg text-primary"></span>}
    </ul>
}


const EventSection = () => {
    return (
        <QueryProvider>
            <Toaster position="bottom-right" richColors />
            <div className="h-full bg-base-10 px-2">
                <UsersList />
            </div>
        </QueryProvider>
    )
}

export default EventSection 