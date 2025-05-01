import { NextRequest, NextResponse } from "next/server";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { data: diagnosis, error: diagnosis_error } = await supabase
      .from("diagnosis")
      .select("*");
    if (diagnosis_error && !diagnosis) {
      return NextResponse.json(
        { error: "No Diagnosis present" },
        { status: 500 }
      );
    }
    for (const data of diagnosis) {
      const { data: userData } = await supabase
        .from("students")
        .select("student_name")
        .eq("student_id", data.fk_student_id)
        .single();
      data.studentName = userData?.student_name || null;
    }
    return NextResponse.json({ diagnosis: diagnosis }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
