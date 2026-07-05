import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/service";

const REMINDER_THRESHOLD_DAYS = 3;
const TOKEN_TTL_DAYS = 365;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const threshold = new Date(
    Date.now() - REMINDER_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: projects, error } = await service
    .from("projects")
    .select("id, client_name, client_email, stage_updated_at, last_reminder_sent_at")
    .eq("stage", "Review")
    .lte("stage_updated_at", threshold);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = (projects ?? []).filter(
    (p) => !p.last_reminder_sent_at || p.last_reminder_sent_at <= threshold,
  );

  let sent = 0;

  for (const project of due) {
    const { data: tokens } = await service
      .from("client_access_tokens")
      .select("token")
      .eq("project_id", project.id)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    let token = tokens?.[0]?.token as string | undefined;

    if (!token) {
      token = randomBytes(24).toString("base64url");
      const expiresAt = new Date(
        Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();
      await service.from("client_access_tokens").insert({
        project_id: project.id,
        token,
        expires_at: expiresAt,
      });
    }

    const portalUrl = `${process.env.SITE_URL}/portal/${token}`;

    const { error: sendError } = await resend.emails.send({
      from: "Portway <onboarding@resend.dev>",
      to: project.client_email,
      subject: `Your review is waiting on ${project.client_name}'s project`,
      html: `<p>Hi ${project.client_name},</p><p>Your project is ready for review. Take a look and let us know if it's approved or needs changes:</p><p><a href="${portalUrl}">${portalUrl}</a></p>`,
    });

    if (sendError) {
      continue;
    }

    await service
      .from("projects")
      .update({ last_reminder_sent_at: new Date().toISOString() })
      .eq("id", project.id);

    sent++;
  }

  return NextResponse.json({ checked: due.length, sent });
}
