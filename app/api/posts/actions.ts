"use server";

import { createClient } from "@/utils/supabase/server";

const supabase =
  createClient();

export const getPostsFromAuthAndFollowedUsers =
  async ({
    pageParam,
    userId,
    followedUserIds
  }: {
    pageParam: number;
    userId: string;
    followedUserIds?: string[];
  }) => {
    const {
      data: userPosts
    } =
      await supabase
        .from(
          "posts"
        )
        .select(
          "*"
        )
        .range(
          pageParam *
            5,
          (pageParam +
            1) *
            5 -
            1
        )
        .eq(
          "user_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );

    const {
      data: userProfile
    } =
      await supabase
        .from(
          "profiles"
        )
        .select(
          "display_name,email"
        )
        .eq(
          "id",
          userId
        );

    const {
      data: followedUsersPosts
    } =
      await supabase
        .from(
          "posts"
        )
        .select(
          "*"
        )
        .range(
          pageParam *
            5,
          (pageParam +
            1) *
            5 -
            1
        )
        .in(
          "user_id",
          followedUserIds ||
            []
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );

    const {
      data: followedUsersProfiles
    } =
      await supabase
        .from(
          "profiles"
        )
        .select(
          "id,display_name,email"
        )
        .range(
          pageParam *
            5,
          (pageParam +
            1) *
            5 -
            1
        )
        .in(
          "id",
          followedUserIds ||
            []
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );

    const userPostsList =
      userPosts
        ?.flatMap(
          (
            usersPost
          ) =>
            userProfile?.map(
              (
                profile
              ) => ({
                ...usersPost,
                ...profile
              })
            )
        )
        .map(
          (
            userPost
          ) => {
            const {
              "0": user,
              postId:
                id,
              ...rest
            } = userPost;
            return {
              id,
              ...rest
            };
          }
        ) ??
      [];

    const followedUsersProfilesList =
      followedUsersProfiles?.map(
        (
          followedUsersProfile
        ) => ({
          ...followedUsersProfile
        })
      );

    const followedUsersPostsLists =
      followedUsersPosts?.map(
        (
          followedUserPost
        ) => {
          const matchedProfile =
            followedUsersProfilesList?.find(
              (
                profile
              ) =>
                profile.id ===
                followedUserPost.user_id
            );
          if (
            matchedProfile
          ) {
            const {
              email,
              display_name
            } =
              matchedProfile;
            return {
              ...followedUserPost,
              email:
                email,
              display_name:
                display_name
            };
          }
        }
      );

    return [
      ...userPostsList,
      followedUsersPostsLists
    ];
  };
