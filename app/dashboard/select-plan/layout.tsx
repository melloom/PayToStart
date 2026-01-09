// Separate layout for select-plan page to bypass plan selection check
// This allows users to access the plan selection page even if they haven't selected a plan yet

import { getCurrentContractor } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SelectPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  // No plan check here - allow access to plan selection page
  return <>{children}</>;
}

