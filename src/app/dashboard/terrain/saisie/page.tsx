import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FieldAgentWizard } from "@/components/agent/FieldAgentWizard";

export const dynamic = "force-dynamic";

export default async function FieldAgentCapturePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "AGENT") redirect("/dashboard");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, commune: { select: { name: true } } }
  });
  return <FieldAgentWizard agentName={profile?.name ?? session.user?.name ?? "Agent ADRESSA"} zone={profile?.commune?.name ?? "Zone à affecter"} />;
}
