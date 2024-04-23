"use client"
import { createClient } from "@/utils/supabase/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import EditProfileButton from "@/components/libs/edit-profile"
import Avatar from "@/components/libs/avatar"
import QueryProvider, { useQueryClient } from "@/components/providers/query-provider"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useMemo } from "react"
import { getFollowing, getFollowings } from "@/app/api/users/action"


type Profile = {
    id: string;
    email: string;
    display_name: string;
}
const supabase = createClient()
const getUserProfile = async ({ params }: { params: { user: string } }) => {
    const {
        data
    } =
        await supabase
            .from('profiles')
            .select('*')
            .eq('display_name', params?.user)
    if (data) {
        return data[0]
    }
};

const getUserRelationships = async (id?: string) => {
    const { data: postCount } = await supabase.from('posts')
        .select('id')
        .eq('user_id', id)
    const { data: followersCount } = await supabase.from('followers')
        .select('id')
        .eq('id', id)
    const { data: followingCount } = await supabase.from('followings')
        .select('id')
        .eq('user_id', id)

    return {
        postCount,
        followersCount,
        followingCount
    }
}

const buildUserProfiles = (user: Profile, followings: string[], isFollowingProfileFetching: boolean) => {
    if (!isFollowingProfileFetching) {
        const followingId = new Set(followings?.map(following => following))
        return ({
            ...user,
            isFollowing: followingId?.has(user?.id)
        })
    }
}

const UserRelationshipInformation = () => {
    const params = useParams<{ user: string }>()
    const { data: profile } = useQuery({ queryKey: ['otherProfileInfo'], queryFn: () => getUserProfile({ params }) })
    const { data: userRelationship } = useQuery({ queryKey: ['otherProfileRelationships'], queryFn: () => getUserRelationships(profile?.id as string), enabled: !!profile, refetchOnMount: "always" })


    return <ul className="grid grid-cols-12 rounded-lg mt-4 bg-base-200/30">
        <li className="col-span-4">
            <div className="flex px-6 py-3 gap-2 items-center justify-between h-full">
                <div className="my-auto"><i className="fi fi-rr-thumbtack"></i></div>
                <div className="w-full">
                    <p className="text-md tracking-wide font-bold">Post</p>
                    <p className="text-xs font-bold">{userRelationship?.postCount?.length ?? "0"}</p>
                </div>
            </div>
        </li>
        <li className="col-span-4">
            <div className="flex px-6 py-3 gap-2 items-center justify-between h-full">
                <div className="my-auto"><i className="fi fi-rr-followcollection"></i></div>
                <div className="w-full">
                    <p className="text-md tracking-wide font-bold">Followers</p>
                    <p className="text-xs font-bold">{userRelationship?.followersCount?.length ?? "0"}</p>
                </div>
            </div>
        </li>
        <li className="col-span-4">
            <div className="flex px-6 py-3 gap-2 items-center justify-between h-full">
                <div className="my-auto"><i className="fi fi-rr-following"></i></div>
                <div className="w-full">
                    <p className="text-md tracking-wide font-bold">Following</p>
                    <p className="text-xs font-bold">{userRelationship?.followingCount?.length ?? "0"}</p>
                </div>
            </div>
        </li>

    </ul>
}


const LoadingProfileSettings = () => {

    return (<div className="h-full w-full" >
        <div className="avatar w-full">
            <div className="mx-auto rounded-full w-1/4 skeleton">
            </div>
        </div>
        <div className="grid grid-cols-2 max-h-full gap-2">
            <div className="space-y-2">
                <h1 className="skeleton h-4 w-32"></h1>
                <p className="skeleton h-4 w-44" ></p>
            </div>
            <div className="grid justify-end">
                <p className="skeleton h-10 w-36 text-end" ></p>
            </div>
        </div>
    </div>)
}


const UserProfile = () => {
    const queryClient = useQueryClient()
    const params = useParams<{ id: string; user: string }>()
    const { data: profile, isFetching: isProfileFetching } = useQuery({ queryKey: ['user'], queryFn: () => getUserProfile({ params }) })
    const { data: followingProfiles, isFetching: isFollowingProfileFetching } = useQuery({ queryKey: ['followingProfile'], queryFn: () => getFollowing(profile?.id as string), enabled: !!profile })


    const userProfiles = useMemo(() => {
        return buildUserProfiles(profile, followingProfiles as [], isFollowingProfileFetching);
    }, [followingProfiles, isProfileFetching])



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

    const handleMutationFollowUser = (user: { id: string, display_name: string }) => {
        mutationFollowUser.mutate(user, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['followingProfiles'] })
                queryClient.invalidateQueries({ queryKey: ['followingProfile'] })
                toast.success(`You are now following ${user.display_name}!. Stay updated with their latest posts!`, { className: "tracking-widest text-xs" })
            },
            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })
    }

    const handleMutationUnfollowUser = (user: { id: string, display_name: string }) => {
        mutationUnfollowUser.mutate(user, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['followingProfiles'] })
                queryClient.invalidateQueries({ queryKey: ['followingProfile'] })
                toast.success(`You have successfully unfollowed ${user.display_name}. You will no longer see their posts in your feed.`, { className: "tracking-widest text-xs" })
            },
            onError: (context) => {
                toast.error(`${context.message}`, { className: "capitalize tracking-widest text-xs" })
            }
        })
    }



    return (<>
        {userProfiles && profile ? (<div className="max-w-full" >
            <div className="avatar w-full">
                <div className="rounded-full w-1/5 mx-auto">
                    <Avatar email={profile?.email as string} />
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div>
                    <h1 className="text-xl font-medium tracking-wider">@{profile?.display_name}</h1>
                    <p className="text-sm !dark:text-primary" >{profile?.email}</p>
                </div>
                <div className='join join-vertical mt-2 w-full items-end gap-1'>
                    {params?.id !== profile?.id ? (userProfiles?.isFollowing ? <>
                        <div className='badge badge-success badge-outline w-1/2 join-item badge-lg text-xs pointer-events-none'>Following</div>
                        <button className='btn btn-outline btn-xs w-1/2 join-item text-xs' onClick={() => handleMutationUnfollowUser({ id: userProfiles?.id, display_name: userProfiles.display_name })}>Unfollow</button>
                    </> : <><button className='btn btn-outline btn-xs w-1/2 join-item text-xs ' onClick={() => handleMutationFollowUser({ id: userProfiles?.id as string, display_name: userProfiles?.display_name as string })}>Follow</button></>) : <EditProfileButton />}

                </div>
            </div>
        </div>) : <LoadingProfileSettings />}
    </>
    )
}

const UserProfileDetails = () => {

    return (
        <QueryProvider>
            <div className="rounded-lg px-6 py-4 bg-base-100 ">
                <UserProfile />
                <UserRelationshipInformation />
            </div>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider>
    )
}


export default UserProfileDetails