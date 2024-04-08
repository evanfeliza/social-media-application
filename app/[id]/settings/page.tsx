"use client"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import EditProfileButton from "@/components/libs/edit-profile-button"
import Avatar from "@/components/libs/avatar"



const getProfileInfo = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return user
}

const LoadingProfileSettings = () => {
    return (<div className="h-full w-full" >
        <div className="avatar w-full">
            <div className="mx-auto rounded-full w-1/4 skeleton">
            </div>
        </div>
        <div className="flex items-center flex-col max-h-full gap-2">
            <h1 className="skeleton h-4 w-32"></h1>
            <p className="skeleton h-4 w-44" ></p>
        </div>
    </div>)
}

const UserRelationshipInformation = () => {
    return <div className="grid grid-cols-12 gap-2 mt-4 ">
        <div className="card card-compact col-span-4 rounded-lg bg-base-100 drop-shadow-sm">
            <div className="flex px-6 py-3 gap-2 items-center justify-between h-full">
                <div className="my-auto"><i className="fi fi-rr-thumbtack"></i></div>
                <div className="w-full">
                    <p className="text-md tracking-wide font-bold">Post</p>
                    <p className="text-xs font-bold">14</p>
                </div>

            </div>
        </div>
        <div className="card card-compact col-span-4 rounded-lg bg-base-100 drop-shadow-sm">
            <div className="flex px-6 py-3 gap-2 items-center justify-between h-full">
                <div className="my-auto"><i className="fi fi-rr-followcollection"></i></div>
                <div className="w-full">
                    <p className="text-md tracking-wide font-bold">Followers</p>
                    <p className="text-xs font-bold">14</p>
                </div>

            </div>
        </div>
        <div className="card card-compact col-span-4 rounded-lg bg-base-100 drop-shadow-sm">
            <div className="flex px-6 py-3 gap-2 items-center justify-between h-full">
                <div className="my-auto"><i className="fi fi-rr-following"></i></div>
                <div className="w-full">
                    <p className="text-md tracking-wide font-bold">Following</p>
                    <p className="text-xs font-bold">14</p>
                </div>

            </div>
        </div>

    </div>
}


const ProfileInfo = () => {
    const { data, isSuccess, isFetching } = useQuery({ queryKey: ['profileInfo'], queryFn: getProfileInfo, })

    return (<>
        {isSuccess ? (<div className="w-full" >
            <div className="avatar w-full ">
                <div className="mx-auto rounded-full w-1/4">
                    <Avatar email={data?.email as string} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-medium tracking-wider">@{data?.user_metadata?.displayName}</h1>
                    <p className="text-sm !dark:text-primary" >{data?.email}</p>
                </div>
                <EditProfileButton />
            </div>
        </div>) : <>{isFetching && <LoadingProfileSettings />}</>}
    </>
    )
}

const ProfileSettingsDetails = () => {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <div className="h-full w-full rounded-xl bg-base-200 px-4 py-6">
                <ProfileInfo />
                <UserRelationshipInformation />
            </div >
        </QueryClientProvider>
    )
}


export default ProfileSettingsDetails