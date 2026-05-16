import { NextRequest, NextResponse } from "next/server";
import { analyzeClaim } from "@/lib/ai/analyzeClaim";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const claim = (body.claim ?? "").trim();

    if (!claim) {
      return NextResponse.json({ error: "Se requiere una afirmación." }, { status: 400 });
    }
    if (claim.length > 2000) {
      return NextResponse.json(
        { error: "La afirmación no puede superar 2.000 caracteres." },
        { status: 400 }
      );
    }

    const result = await analyzeClaim(claim);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/analyze]", err);
    return NextResponse.json(
      { error: "El análisis falló. Por favor intente de nuevo." },
      { status: 500 }
    );
  }
}
