import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const diagnosis_id = data.get("diagnosis_id");
    console.log(data, "diagnosis", diagnosis_id);
    const { data: result, error: resultError } = await supabase
      .from("diagnosis")
      .select("*")
      .eq("diagnose_id", diagnosis_id);
    console.log("result", result);
    if (resultError || !result) {
      return NextResponse.json({ error: "No Result Found" }, { status: 401 });
    }
    if (result) {
      const { data: studentName, error: studentNameError } = await supabase
        .from("students")
        .select("student_name")
        .eq("student_id", result[0].fk_student_id);
      console.log("studentName", studentName);
      if (studentNameError && !studentName) {
        return NextResponse.json(
          { error: "No Student Name Found" },
          { status: 401 }
        );
      }
      result[0].studentName = studentName[0].student_name;
      result[0].results = {};
      result[0].results.motorVariability = 0;
      result[0].results.orthographicIrregularity = 0;
      result[0].results.writingDynamics = 0;
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
