import { NextRequest, NextResponse } from "next/server"
import { serialize } from "cookie"
import {supabase} from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const id = uuidv4()

    const { data: user, error } = await supabase
      .from("users")
      .insert([{ id, email, password, name }])
      .select("*")
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const cookie = serialize("user_id", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return new NextResponse(JSON.stringify({ user }), {
      status: 201,
      headers: {
        "Set-Cookie": cookie,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
