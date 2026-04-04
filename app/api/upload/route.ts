import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);

        // Generate a unique filename
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const filename = `${session.user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || process.env.SUPABASE_BUCKET;

        if (!bucketName) {
             console.error("Missing SUPABASE_BUCKET environment variable.");
             return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filename, buffer, {
                contentType: file.type || "application/octet-stream",
                upsert: false
            });

        if (error) {
            console.error("Supabase storage error:", error);
            return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

        return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });

    } catch (error: any) {
        console.error("Upload API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
