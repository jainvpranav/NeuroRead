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

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();
    console.log(type, data);
    if (type === "like") {
      if (data.like) {
        data.post_data.like += 1;
        console.log(data.post_data.like);
        const { data: result, error } = await supabase
          .from("posts")
          .update({ like: data.post_data.like })
          .eq("post_id", data.post_data.post_id)
          .select();
        if (error) {
          return NextResponse.json({ error: error }, { status: 501 });
        }
        if (result) {
          return NextResponse.json({ message: "Yay 204" }, { status: 204 });
        }
      } else {
        data.post_data.like -= 1;
        console.log(data.post_data.like);
        const { data: result, error } = await supabase
          .from("posts")
          .update({ like: data.post_data.like })
          .eq("post_id", data.post_data.post_id)
          .select();
        if (error) {
          NextResponse.json({ error: error }, { status: 501 });
        }
        if (result) {
          return NextResponse.json({ message: "Yay 204" }, { status: 204 });
        }
      }
    }
    return NextResponse.json({ error: "Some Error" }, { status: 501 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
