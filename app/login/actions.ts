"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

type LoginInFormData =
  {
    email: string;
    password: string;
  };

export const submitForm =
  async (
    formData: LoginInFormData
  ) => {
    const supabase =
      createClient();
    const {
      error:
        authError
    } =
      await supabase.auth.signInWithPassword(
        {
          email:
            formData?.email,
          password:
            formData?.password
        }
      );
    const {
      data,
      error:
        userError
    } =
      await supabase.auth.getUser();

    if (
      authError ||
      userError
    ) {
      return (
        authError ||
        userError
      );
    }
    return redirect(
      `/${data?.user?.id}`
    );
  };
