"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAuthenticatedUser } from "@/lib/auth";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;

export async function updateBranding(formData: FormData) {
  const businessName = formData.get("business_name") as string;
  const accentColor = formData.get("accent_color") as string;

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("freelancers")
    .update({ business_name: businessName, accent_color: accentColor })
    .eq("id", user.id);

  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard/settings");
}

export async function uploadLogo(formData: FormData) {
  const file = formData.get("logo") as File;

  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  if (!file || file.size === 0) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("Choose an image first")}`);
  }

  if (file.size > MAX_LOGO_BYTES) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("Image is too large (5MB max)")}`);
  }

  const service = createServiceClient();
  const path = `${user.id}/${randomBytes(16).toString("hex")}`;

  const { error: uploadError } = await service.storage.from("brand-assets").upload(path, file);

  if (uploadError) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(uploadError.message)}`);
  }

  const {
    data: { publicUrl },
  } = service.storage.from("brand-assets").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("freelancers")
    .update({ logo_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(updateError.message)}`);
  }

  redirect("/dashboard/settings");
}
