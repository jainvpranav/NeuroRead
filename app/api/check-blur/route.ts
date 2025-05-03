// import { NextRequest, NextResponse } from "next/server";
// import { Readable } from "stream";
// import formidable from "formidable";
// import cv from "opencv4nodejs";
// import fs from "fs";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
//   runtime: "nodejs",
// };

// // Helper to parse multipart/form-data
// function parseForm(req: any): Promise<{ files: formidable.Files }> {
//   const form = formidable({ keepExtensions: true });
//   return new Promise((resolve, reject) => {
//     form.parse(req, (err, _fields, files) => {
//       if (err) reject(err);
//       else resolve({ files });
//     });
//   });
// }

// // For converting Web ReadableStream into Node.js-compatible stream
// class NodeRequest extends Readable {
//   headers: any;

//   constructor(stream: ReadableStream, headers: Headers) {
//     super();
//     this.headers = Object.fromEntries(headers.entries());

//     (async () => {
//       const reader = stream.getReader();
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//           this.push(null);
//           break;
//         }
//         this.push(value);
//       }
//     })();
//   }

//   _read() {}
// }

// export async function POST(req: NextRequest) {
//   try {
//     const readable = req.body as any;
//     const fakeReq: any = new NodeRequest(readable, req.headers);

//     const { files } = await parseForm(fakeReq);
//     const file = files.file; // 'file' is the field name

//     if (!file || Array.isArray(file)) {
//       return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
//     }

//     const filePath = file.filepath;
//     const mat = cv.imread(filePath);
//     const gray = mat.bgrToGray();

//     // Apply Laplacian and calculate variance
//     const laplacian = gray.laplacian(cv.CV_64F);
//     const mean = laplacian.mean().w;
//     const stdDev = laplacian.stdDev().w;
//     const variance = stdDev * stdDev;

//     return NextResponse.json({
//       blurScore: variance,
//       blurry: variance < 100, // Adjust threshold as needed
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
//   }
// }
