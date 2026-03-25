import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.OPENMETHYL_API_URL || "http://127.0.0.1:8901";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { detail: "Analysis service unavailable. Please try again later." },
      { status: 502 }
    );
  }
}
