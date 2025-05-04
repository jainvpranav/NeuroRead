import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, mobile } = await req.json();

    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    function getRandom1to5(): number {
      return Math.floor(Math.random() * 5) + 1;
    }

    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          name: name,
          email: email,
          passcode: password,
          role: role,
          profile_pic_link: `${
            process.env.NEXT_PUBLIC_SUPABASE_URL
          }/storage/v1/object/public/userprofiles//default_image_${getRandom1to5()}.png`,
          mobile: mobile,
        },
      ])
      .select();

    console.log(user);

    if (error || !user) {
      if (error) {
        console.log(error);
      }
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const cookie = serialize("user_id", "someIssue", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return new NextResponse(JSON.stringify({ user }), {
      status: 201,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
