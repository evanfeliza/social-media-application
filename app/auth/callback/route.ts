import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request
) {
  const supabase =
    createClient();
  const requestUrl =
    new URL(
      request.url
    );
  const code =
    requestUrl.searchParams.get(
      "code"
    );
  const origin =
    requestUrl.origin;
  const {
    data: {
      user
    }
  } =
    await supabase.auth.getUser();

  if (
    code
  ) {
    await supabase.auth.exchangeCodeForSession(
      code
    );
  }

  if (
    user
  ) {
    return NextResponse.redirect(
      `${origin}/${user.id}`
    );
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(
    `${origin}/login`
  );
}
