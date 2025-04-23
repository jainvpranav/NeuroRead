import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { data: posts, error } = await supabase.from("posts").select("*");
    if (posts) {
      for (const post of posts) {
        const { data: userData } = await supabase
          .from("users")
          .select("name, profile_pic_link")
          .eq("user_id", post.fk_user_id)
          .single();

        post.username = userData?.name || null;
        post.profile_pic_link = userData?.profile_pic_link || null;
      }
    }

    if (error || !posts) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
