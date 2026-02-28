import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional()
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id,role,name")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    const { data: profile, error } = await admin
      .from("profiles")
      .insert({
        id: user.id,
        name: user.user_metadata?.name ?? user.email ?? "Usuario",
        role: "user"
      })
      .select("id,role,name")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: profile.id,
      role: profile.role,
      name: profile.name ?? user.user_metadata?.name ?? "Usuario",
      email: user.email ?? ""
    });
  }

  return NextResponse.json({
    id: existingProfile.id,
    role: existingProfile.role,
    name: existingProfile.name ?? user.user_metadata?.name ?? "Usuario",
    email: user.email ?? ""
  });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const payload = parsed.data;

  if (payload.name) {
    const updateProfile = await admin.from("profiles").update({ name: payload.name.trim() }).eq("id", user.id);
    if (updateProfile.error) {
      return NextResponse.json({ error: updateProfile.error.message }, { status: 400 });
    }

    const updateUser = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, name: payload.name.trim() }
    });
    if (updateUser.error) {
      return NextResponse.json({ error: updateUser.error.message }, { status: 400 });
    }
  }

  if (payload.password) {
    const updatePassword = await admin.auth.admin.updateUserById(user.id, {
      password: payload.password
    });
    if (updatePassword.error) {
      return NextResponse.json({ error: updatePassword.error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ updated: true });
}
