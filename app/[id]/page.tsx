"use client"
import AddPostButtonForm from "@/components/libs/add-post";
import ManagePost from "@/components/libs/manage-post";
import EditPostButtonForm from "@/components/libs/manage-post";
import ProfileHandle from "@/components/libs/profile-handle";
import PostProvider from "@/components/providers/post-provider";
import QueryProvider from "@/components/providers/query-provider";
import { createClient } from "@/utils/supabase/client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";

type Posts = {
	id: string;
	created_at: string;
	email: string;
	display_name: string;
	post: string;
	postImageUrl: string;
	is_liked_user_id: string[]
	user_id: string;
}

const supabase = createClient()

const getProfileInfo = async () => {
	const { data: { user } } = await supabase.auth.getUser()

	return user
}

const getFollowerId = async (userId: string) => {
	try {
		const { data: followedUsers, error: followedUsersError } = await supabase
			.from('followings')
			.select('following_user_id')
			.eq('user_id', userId);

		if (followedUsersError) {
			throw new Error(followedUsersError.message);
		}
		return followedUsers.map(user => user.following_user_id);
	} catch (error) {
		throw error
	}
}


const getPostsFromAuthAndFollowedUsers = async ({ pageParam, userId, followedUserIds }: { pageParam: number; userId: string; followedUserIds?: string[] }) => {
	const { data: postsUsers, } = await supabase
		.from('posts')
		.select('*')
		.range(pageParam * 5, (pageParam + 1) * 5 - 1)
		.eq('user_id', userId)
		.order('created_at', { ascending: false });

	const { data: postsFollowedUsers } = await supabase
		.from('posts')
		.select('*')
		.range(pageParam * 5, (pageParam + 1) * 5 - 1)
		.in('user_id', followedUserIds || [])
		.order('created_at', { ascending: false });

	const { data: followedUsersProfiles } = await supabase.from('profiles').select('display_name,email').in('id', followedUserIds || [])
	const { data: userProfiles } = await supabase.from('profiles').select('display_name,email').eq('id', userId)


	if (postsUsers && postsFollowedUsers) {
		const allPosts = [
			...postsUsers.map(postUser => ({
				...postUser,
				...(userProfiles || {})
			})),
			...postsFollowedUsers.map(postFollowedUser => ({
				...postFollowedUser,
				...(followedUsersProfiles || {})
			}))
		]


		return allPosts
	}
}


const getUserEngagement = async (postId: string) => {
	const { data: existing } = await supabase
		.from('posts')
		.select('is_liked_user_id')
		.eq('id', postId)
		.single();


	return existing
}



const UserEngagement = ({ post }: {
	post: {
		id: string;
		isLikeByUserId: string
		likesByUsers: string[]

	}
}) => {
	const queryClient = useQueryClient()
	const { data: likedPostByUser } = useQuery({ queryKey: ['engagement'], queryFn: () => getUserEngagement(post.id) })
	const [isLiked, setIsLiked] = useState<boolean>(post.likesByUsers?.includes(post.isLikeByUserId))

	const mutationLikePost = useMutation({
		mutationFn: async (formData: { postId: string, userId: string }) => {


			const userIds = likedPostByUser?.is_liked_user_id ?? [];

			userIds.push(formData.userId);

			return await supabase
				.from('posts')
				.upsert([
					{
						id: formData.postId,
						is_liked_user_id: `{${userIds}}`
					}
				])
				.select();

		}
	});

	const mutationUnlikePost = useMutation({

		mutationFn: async (formData: { postId: string, userId: string }) => {
			const userIds = likedPostByUser?.is_liked_user_id || [];
			const updatedUserIds = userIds.filter((id: string) => id !== formData.userId);


			return await supabase
				.from('posts')
				.upsert([
					{
						id: formData.postId,
						is_liked_user_id: `{${updatedUserIds.join(',')}}`
					}
				]);

		}

	});


	const handleLikePost = () => {
		if (!isLiked) {
			mutationLikePost.mutate({ postId: post.id, userId: post?.isLikeByUserId }, {
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['engagement'] })
					setIsLiked(prevState => !prevState)
				}
			})
		} else {
			mutationUnlikePost.mutate({ postId: post.id, userId: post?.isLikeByUserId }, {
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['engagement'] })
					setIsLiked(prevState => !prevState)
				}
			})
		}
	}

	return (
		<div className="flex justify-between items-center join p-2">
			<label className="btn btn-circle btn-sm swap swap-rotate">
				<input type="checkbox" onChange={handleLikePost} defaultChecked={isLiked} />
				<i className="fi fi-rs-heart swap-off mt-1"></i>
				<i className="fi fi-ss-heart swap-on mt-1"></i>
			</label>
		</div>
	)
}

const usePostList = () => {
	const { data: userData } = useQuery({ queryKey: ['profileInfo'], queryFn: getProfileInfo })
	const { data: followerId, } = useQuery({
		queryKey: ['followingId'], queryFn: () => getFollowerId(userData?.id as string),
		enabled: !!userData
	})


	const {
		data: postsData,
		fetchNextPage,
		hasNextPage,
		isFetching,
	} = useInfiniteQuery({
		queryKey: ['posts'],
		queryFn: async ({ pageParam = 1 }) => await getPostsFromAuthAndFollowedUsers({ pageParam, userId: userData?.id as string, followedUserIds: followerId }),
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage && lastPage.length < 5) {
				return null;
			}
			return allPages.length + 1;
		},
		initialPageParam: 0,
		enabled: !!followerId && !!userData?.id
	});
	return {
		userData,
		postsData,
		fetchNextPage, hasNextPage,
		isFetching,
	}
}

const PostList = () => {
	const { userData, postsData, fetchNextPage, hasNextPage, isFetching } = usePostList()
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const listRef = useRef<HTMLUListElement>(null);


	const handleIntersection = (entries: IntersectionObserverEntry[]) => {
		if (entries[0].isIntersecting && hasNextPage && !isFetching && !isLoadingMore) {
			setIsLoadingMore(true);
			fetchNextPage();
		}
	};

	const observer = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		observer.current = new IntersectionObserver(handleIntersection, { threshold: 0.1 });

		if (listRef.current) {
			observer.current.observe(listRef.current);
		}

		return () => {
			if (listRef.current && observer.current) {
				observer.current.unobserve(listRef.current);
			}
		};
	}, []);


	const posts = postsData?.pages?.flatMap(page => page).map(post => {
		const { "0": user, postId: id, ...rest } = post;
		return { ...user, id, ...rest };
	});

	const sortedPosts = posts?.sort((a, b) => {
		const dateA = new Date(a.created_at);
		const dateB = new Date(b.created_at);
		return dateB.getTime() - dateA.getTime();
	});

	return <>
		<ul ref={listRef} className="grid gap-3 grid-auto-col w-full max-w-full">
			{!isFetching && sortedPosts?.map((post: Posts) =>
				sortedPosts ? <PostProvider post={post}>
					<li key={post.id} className="card  bg-base-100 shadow-m mx-auto w-full max-w-full">
						<div className="flex justify-between items-center p-2">
							<ProfileHandle email={post?.email} displayName={post?.display_name} />
							<div className="flex flex-col justify-end items-end">
								{userData?.id === post.user_id && <ManagePost />}
								<span className=" block text-xs font-light mt-1">{moment(post?.created_at).fromNow()}</span>
							</div>
						</div>
						<div className="card-body !px-4 !py-2 max-w-full break-all">
							<p>{post.post}</p>
						</div>
						{/* <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure> */}
						<UserEngagement post={{ id: post.id, isLikeByUserId: userData?.id as string, likesByUsers: post?.is_liked_user_id }} />
					</li>
				</PostProvider> : null
			)}
			{isFetching ? <span className=" mx-auto loading loading-dots loading-lg text-secondary"></span> : isLoadingMore ? <span className=" mx-auto loading loading-dots loading-lg text-secondary"></span> : null}
		</ul>
	</>
}


export default function NewsFeedPage() {


	return (<QueryProvider>
		<Toaster position="bottom-right" richColors />
		<div className="h-full w-full max-w-full rounded-box px-6 py-4 bg-base-200 space-y-4">
			<AddPostButtonForm />
			<PostList />
		</div>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryProvider>

	);
}
