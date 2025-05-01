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
    //Supabase
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let studentName = formData.get("studentName") as string;
    studentName = studentName.trim().toLowerCase();
    const currentUserId = formData.get("currentUserId") as string;
    let studentDetail: any, uploadedStudentDetails: any;
    if (studentName) {
      const { data: studentDetails, error: studentDetailsError } =
        await supabase
          .from("students")
          .select("student_id")
          .eq("student_name", studentName);
      studentDetail = studentDetails;
      console.log("studentDetails", studentDetails);
      if (studentDetailsError && !studentDetails) {
        return NextResponse.json(
          { error: "Student not Found Error" },
          { status: 500 }
        );
      }
      if (studentDetails ? studentDetails.length === 0 : 0) {
        const {
          data: studentDetailsUploaded,
          error: studentDetailsUploadedError,
        } = await supabase
          .from("students")
          .insert({ student_name: studentName, fk_user_id: currentUserId })
          .select();
        if (studentDetailsUploadedError && !studentDetailsUploaded) {
          return NextResponse.json(
            { error: "Student Data Not Uploaded" },
            { status: 500 }
          );
        }
        uploadedStudentDetails = studentDetailsUploaded;
        console.log("uploadedStudentDetails", uploadedStudentDetails);
      }
    }

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadedImage, error: uploadError } = await supabase.storage
        .from("diagnosis-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });
      console.log("uploadedImage", uploadedImage);
      if (uploadError && !uploadedImage) {
        return NextResponse.json(
          { error: "Image not uploaded in Bucket" },
          { status: 500 }
        );
      } else {
        if (studentDetail ? studentDetail.length === 0 : 0) {
          const { data: diagnosis_uploaded, error: diagnosis_upload_error } =
            await supabase
              .from("diagnosis")
              .insert({
                // More Fields to be added
                // diagnosed_at: Date.now(),
                image_uploaded_link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/diagnosis-images//${uploadedImage.path}`,
                fk_student_id: uploadedStudentDetails.student_id,
              })
              .select();
          console.log("diagnosis_uploaded", diagnosis_uploaded);
          if (diagnosis_upload_error && !diagnosis_uploaded) {
            return NextResponse.json(
              { error: "Diagnosis not recorded" },
              { status: 500 }
            );
          }
          return NextResponse.json(
            { diagnosis: diagnosis_uploaded },
            { status: 200 }
          );
        } else {
          const { data: diagnosis_uploaded, error: diagnosis_upload_error } =
            await supabase
              .from("diagnosis")
              .insert({
                // More Fields to be added
                // diagnosed_at: Date.now(),
                image_uploaded_link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/diagnosis-images//${uploadedImage.path}`,
                fk_student_id: studentDetail.student_id,
              })
              .select();
          console.log("diagnosis_uploaded", diagnosis_uploaded);
          if (diagnosis_upload_error && !diagnosis_uploaded) {
            return NextResponse.json(
              { error: "Diagnosis not recorded" },
              { status: 500 }
            );
          }
          return NextResponse.json(
            { diagnosis: diagnosis_uploaded },
            { status: 200 }
          );
        }
      }
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

//E2E

// Example using AWS SDK for JavaScript
// const s3Client = new S3Client({
//   region: "your-region",
//   credentials: {
//     accessKeyId: "R2XF4YX5C9YAQGKZQLU4",
//     secretAccessKey: "GMCYHTQLWZT3HIJP5FIUO1E9CYWMW7UGUI16NYLA",
//   },
// });

// const uploadImage = async (file: any) => {
//   const uploadParams = {
//     Bucket: "handwriting-images",
//     Key: Date.now().toString(),
//     Body: file,
//     ContentType: file.type,
//   };

//   try {
//     const command = new PutObjectCommand(uploadParams);
//     const result = await s3Client.send(command);
//     console.log("Image uploaded successfully:", result);
//     return NextResponse.json({ status: 200 });
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// };
// uploadImage(file);
