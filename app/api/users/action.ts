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
    try {
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
        error
      ) {
        throw error;
      }

      if (
        profiles
      ) {
        return profiles.map(
          (
            profile: any
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
    } catch (error) {
      console.error(
        "Error fetching user profiles:",
        error
      );
      throw error;
    }
  };

export const getFollowings =
  async (
    userId: string
  ): Promise<
    string[]
  > => {
    try {
      const {
        data: followings,
        error
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

      if (
        error
      ) {
        throw error;
      }

      return followings
        ? followings.map(
            (
              following: any
            ) =>
              following.user_id
          )
        : [];
    } catch (error) {
      console.error(
        "Error fetching followings:",
        error
      );
      throw error;
    }
  };
