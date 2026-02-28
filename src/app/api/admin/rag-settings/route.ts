import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureAdmin } from "@/lib/auth/adminGuard";

const updateSchema = z.object({
  searchLevel: z.enum(["baixo", "medio", "alto"]),
  useLegacyFallback: z.boolean()
});

export async function GET() {
  const auth = await ensureAdmin();
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabase
    .from("rag_settings")
    .select("search_level,use_legacy_fallback")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    searchLevel: data?.search_level ?? "medio",
    useLegacyFallback: data?.use_legacy_fallback ?? true
  });
}

export async function PATCH(request: Request) {
  const auth = await ensureAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("rag_settings").upsert({
    id: true,
    search_level: parsed.data.searchLevel,
    use_legacy_fallback: parsed.data.useLegacyFallback,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ updated: true });
}
