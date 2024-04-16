"use server";
import { createClient } from "@/utils/supabase/server";


type LoginInFormData =
  {
    email: string;
    password: string;
  };

export const submitSignInForm =
  async (params: {
    formData: LoginInFormData;
  }) => {
    const supabase =
      createClient();
    const res =
      await supabase.auth.signInWithPassword(
        {
          email:
            params
              .formData
              ?.email,
          password:
            params
              .formData
              ?.password
        }
      );

    return {
      data: res
        ?.data
        .user
        ?.id,
      error:
        res
          ?.error
          ?.message
    };
  };
