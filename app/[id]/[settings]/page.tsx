"use client"
import { createClient } from "@/utils/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import EditProfileButton from "@/components/libs/edit-profile"
import Avatar from "@/components/libs/avatar"
import QueryProvider from "@/components/providers/query-provider"



const supabase = createClient()
const getUser = async () => {
    const {
        data: {
            user
        }
    } =
        await supabase.auth.getUser();

    return user;
};


const getUserRelationships = async (id?: string) => {
    const { data: postCount } = await supabase.from('posts')
        .select('id')
        .eq('user_id', id)
    const { data: followersCount } = await supabase.from('followers')
        .select('id')
        .eq('follower_user_id', id)
    const { data: followingCount } = await supabase.from('followings')
        .select('id')
        .eq('following_user_id', id)

    return {
        postCount,
        followersCount,
        followingCount
    }
}

const LoadingProfileSettings = () => {
    const skeletonCards = 3

    return (<div className="h-full w-full" >
        <div className="avatar w-full">
            <div className="mx-auto rounded-full w-1/4 skeleton">
            </div>
        </div>
        <div className="flex items-start flex-col max-h-full gap-2">
            <h1 className="skeleton h-4 w-32"></h1>
            <p className="skeleton h-4 w-44" ></p>
        </div>
    </div>)
}

const useUserRelationshipInformation = () => {
    const { data: profileInfo } = useProfileInfo()
    const { data: userRelationship } = useQuery({ queryKey: ['profile-relationships'], queryFn: () => getUserRelationships(profileInfo?.id as string), enabled: !!profileInfo })

    return {
        userRelationship,
    }

}

const UserRelationshipInformation = () => {
    const { userRelationship } = useUserRelationshipInformation()

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


const useProfileInfo = () => {
    const { data, isSuccess, isFetching } = useQuery({ queryKey: ['profileInfo'], queryFn: getUser, })

    return {
        data,
        isSuccess,
        isFetching
    }
}
const ProfileInfo = () => {
    const { data, isSuccess, isFetching } = useProfileInfo()


    return (<>
        {isSuccess ? (<div className="max-w-full" >
            <div className="avatar w-full">
                <div className="rounded-full w-1/5 mx-auto">
                    <Avatar email={data?.email as string} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium tracking-wider">@{data?.user_metadata?.display_name}</h1>
                    <p className="text-sm !dark:text-primary" >{data?.email}</p>
                </div>
                <EditProfileButton />
            </div>
        </div>) : <>{isFetching && <LoadingProfileSettings />}</>}
    </>
    )
}

const ProfileSettingsDetails = () => {

    return (
        <QueryProvider>
            <>
                <ProfileInfo />
                <UserRelationshipInformation />
                <ReactQueryDevtools initialIsOpen={false} />
            </>
        </QueryProvider>
    )
}


export default ProfileSettingsDetails