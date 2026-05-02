import { NextResponse } from "next/server"
import { adminClient } from "@/lib/db/supabase"

export const runtime = "nodejs"

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const sb = adminClient()
  const { data, error } = await sb
    .from("drafts")
    .update({ awaiting_approval: false, rejected_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, email_id")
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message ?? "draft not found" }, { status: 404 })
  await sb.from("emails").update({ status: "triaged" }).eq("id", data.email_id)
  return NextResponse.json({ ok: true })
}
