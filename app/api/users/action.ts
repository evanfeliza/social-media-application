"use server";
import { createClient } from "@/utils/supabase/server";

type UserProfile =
  {
    id: string;
    email: string;
    display_name: string;
  };

const supabase =
  createClient();

export const getUsers =
  async (
    userId: string
  ): Promise<
    UserProfile[]
  > => {
    const {
      data: profiles,
      error
    } =
      await supabase
        .from(
          "profiles"
        )
        .select()
        .neq(
          "id",
          userId
        );

    if (
      profiles
    ) {
      return profiles.map(
        (
          profile
        ) => ({
          id: profile.id,
          email:
            profile.email,
          display_name:
            profile.display_name
        })
      );
    } else {
      return [];
    }
  };
export const getFollowings =
  async (
    userId: string
  ): Promise<
    string[]
  > => {
    const {
      data: followings
    } =
      await supabase
        .from(
          "followings"
        )
        .select(
          "user_id"
        )
        .eq(
          "following_user_id",
          userId
        );

    return followings
      ? followings.map(
          (
            following
          ) =>
            following.user_id
        )
      : [];
  };

export const getFollowing =
  async (
    userId: string
  ): Promise<
    string[]
  > => {
    const {
      data: followings
    } =
      await supabase
        .from(
          "followings"
        )
        .select(
          "user_id"
        )
        .eq(
          "user_id",
          userId
        );

    return followings
      ? followings.map(
          (
            following
          ) =>
            following.user_id
        )
      : [];
  };

