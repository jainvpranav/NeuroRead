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
    const formData = await req.formData();
    const type = formData.get("type") as string;
    if (type === "like") {
      const post_likes_s = formData.get("post_likes") as string;
      const post_id_s = formData.get("post_id") as string;
      const post_id = Number(post_id_s);
      const post_likes = Number(post_likes_s) + 1;
      const { data: result, error } = await supabase
        .from("posts")
        .update({ likes: post_likes })
        .eq("post_id", post_id)
        .select();
      if (error || !result) {
        return NextResponse.json({ error: error }, { status: 501 });
      }
      return NextResponse.json({ status: 204 });
    } else if (type === "post") {
      const description = formData.get("description") as string;
      const userDetails = JSON.parse(formData.get("userDetails") as string);
      const file = formData.get("file") as File | null;
      if (!description || !userDetails) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadedImage, error: uploadError } =
          await supabase.storage.from("posts").upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) {
          console.error(uploadError);
          return NextResponse.json(
            { error: "Error uploading file" },
            { status: 500 }
          );
        }
        const { data: post_uploaded, error: post_not_uploaded } = await supabase
          .from("posts")
          .insert([
            {
              description: description,
              fk_user_id: userDetails.user_id,
              likes: 0,
              image_link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posts//${uploadedImage.path}`,
            },
          ]);
        if (post_not_uploaded) {
          return NextResponse.json(
            { error: post_not_uploaded },
            { status: 501 }
          );
        }
      }
      return NextResponse.json({ status: 200 });
    }
    return NextResponse.json({ error: "Some Error" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
