"use server";
import { createClient } from "@/utils/supabase/server";
type SignUpFormData =
  {
    email: string;
    password: string;
    displayName: string;
  };

export const submitSignupForm =
  async (
    formData: SignUpFormData
  ) => {
    const supabase =
      createClient();
    const {
      data,
      error
    } =
      await supabase.auth.signUp(
        {
          email:
            formData?.email,
          password:
            formData?.password,
          options:
            {
              data: {
                displayName:
                  formData?.displayName
              }
            }
        }
      );

    if (
      error
    ) {
      return error.message;
    }

    return data
      ?.user
      ?.email;
  };
