import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";

const schema = z.object({
  ids: z.array(z.string()).min(1),
  taxStatus: z.enum(["NON_RENSEIGNE", "IMPOSE", "EXONERE", "IMPAYE"])
});

// POST /api/address/bulk-tax-status — action groupée, réservée à fiscal:edit.
// Chaque adresse modifiée reçoit une entrée d'historique individuelle, comme pour
// une modification unitaire, afin de conserver une traçabilité complète.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;
  const userId = (session?.user as any)?.id as string | undefined;

  if (!hasPermission(role, "fiscal:edit")) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ids, taxStatus } = parsed.data;

  const existing: { id: string; taxStatus: string }[] = await prisma.address.findMany({
    where: { id: { in: ids } },
    select: { id: true, taxStatus: true }
  });

  const toUpdate = existing.filter((a: { id: string; taxStatus: string }) => a.taxStatus !== taxStatus);

  await prisma.$transaction(
    toUpdate.flatMap((a: { id: string; taxStatus: string }) => [
      prisma.address.update({ where: { id: a.id }, data: { taxStatus, updatedById: userId ?? null } }),
      prisma.addressHistory.create({
        data: {
          addressId: a.id,
          userId: userId ?? null,
          action: "MODIFICATION_TAXSTATUS",
          oldValue: a.taxStatus,
          newValue: taxStatus
        }
      })
    ])
  );

  return NextResponse.json({ updated: toUpdate.length, skipped: existing.length - toUpdate.length });
}
