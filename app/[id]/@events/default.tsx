"use client"
import { getFollowings, getUsers } from '@/app/api/users/action'
import Avatar from '@/components/libs/avatar'
import QueryProvider from '@/components/providers/query-provider'
import { createClient } from '@/utils/supabase/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import { toast, Toaster } from 'sonner'

const supabase = createClient()

type UserProfiles = {
    id: string;
    email: string;
    display_name: string;
}

const UserFollowCard = ({ user }: {
    user: {
        id: string;
        email: string;
        displayName: string;
        isFollowing: boolean;
    }
}) => {
    const router = useRouter()
    const params = useParams()
    const queryClient = useQueryClient()
    const mutationFollowUser = useMutation({
        mutationFn: async (user: { id: string }) => {
            return await supabase
                .from('followings')
                .insert([
                    { user_id: user.id },
                ])
                .select()
        }
    })

    const mutationUnfollowUser = useMutation({
        mutationFn: async (user: { id: string }) => {
            return await supabase
                .from('followings')
                .delete()
                .eq("user_id", user.id)
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


    return <li key={user.id} className='px-4 py-2 bg-base-200/30 rounded-lg w-full'>
        <div role="button" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['followingProfiles'] })
            router.replace(`/${params?.id}/${user?.displayName}`)
        }} className="avatar flex group">
            <div className="w-10 rounded-full mr-2">
                <Avatar email={user.email} />
            </div>
            <p className="my-auto font-semibold text-md break-all group-hover:underline group-hover:underline-offset-4 group-hover:text-accent duration-100">{user.displayName}</p>

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
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => getUsers(params?.id as string) })
    const { data: followingProfiles, isFetching: isFollowingProfileFetching } = useQuery({ queryKey: ['followingProfiles'], queryFn: () => getFollowings(params?.id as string), refetchOnMount: true })



    const buildUserProfiles = (users: UserProfiles[], followings: string[]) => {
        if (!isFollowingProfileFetching) {
            const followingIds = new Set(followings?.map(following => following))
            return users?.map(user => {

                return ({
                    ...user,
                    isFollowing: followingIds?.has(user?.id)
                })
            })
        }
    }

    const userProfiles = useMemo(() => {
        return buildUserProfiles(users as [], followingProfiles as []);
    }, [followingProfiles])



    return <ul className="max-h-full w-full grid gap-4 grid-flow-row">
        {(userProfiles?.map(user => <UserFollowCard key={user.id} user={{ id: user.id, email: user.email, displayName: user.display_name, isFollowing: user.isFollowing }} />))}
    </ul>
}




const EventSection = () => {
    return (
        <QueryProvider>
            <Toaster position="bottom-right" richColors />
            <UsersList />
        </QueryProvider>
    )
}

export default EventSection 