"use server";
import { createClient } from "@/utils/supabase/server";

type SignUpFormData =
  {
    email: string;
    password: string;
    displayName: string;
  };

export const submitSignUpForm =
  async (
    formData: SignUpFormData
  ) => {
    const supabase =
      createClient();
    const res =
      await supabase.auth.signUp(
        {
          email:
            formData?.email,
          password:
            formData?.password,
          options:
            {
              data: {
                display_name:
                  formData?.displayName
              }
            }
        }
      );

    return {
      data: res
        .data
        .user
        ?.id,
      error:
        res
          .error
          ?.message
    };
  };
