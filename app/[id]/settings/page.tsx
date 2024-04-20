"use client"
import { createClient } from "@/utils/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import EditProfileButton from "@/components/libs/edit-profile"
import Avatar from "@/components/libs/avatar"
import QueryProvider from "@/components/providers/query-provider"


const supabase = createClient()
const getProfileInfo = async () => {

    const { data: { user } } = await supabase.auth.getUser()


    return user
}

const getUserRelationships = async ({ id }: { id: string }) => {
    const { data: postCount } = await supabase.from('post')
        .select('user_id')
        .eq('user_id', id)

    return {
        postCount
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
        <div className="grid grid-cols-12 gap-2 mt-4 ">
            {[...Array(skeletonCards)].map((_, id) => <div key={id} className="card card-compact col-span-4 rounded-lg skeleton h-16">
            </div>)}
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

const UserRelationshipLists = () => {
    return <div className="bg-base-100 rounded-xl px-6 py-4 mt-2 max-h-full">
        <div role="alert" className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Feature is not available at the moment.</span>
        </div>
    </div>
}


const ProfileInfo = () => {
    const { data, isSuccess, isFetching } = useQuery({ queryKey: ['profileInfo'], queryFn: getProfileInfo, })


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
            <div className="h-full w-full rounded-xl bg-base-200 px-4 py-6">
                <ProfileInfo />
                <UserRelationshipInformation />
                <UserRelationshipLists />
                <ReactQueryDevtools initialIsOpen={false} />
            </div >
        </QueryProvider>
    )
}


export default ProfileSettingsDetails