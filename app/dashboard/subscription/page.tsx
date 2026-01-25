import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export default async function SubscriptionPage() {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  // Redirect to settings page with subscription tab
  redirect("/dashboard/settings?tab=subscription");
}


