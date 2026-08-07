import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

type Period = "1d" | "7d" | "30d" | "all";

function parsePeriod(value: string | null): Period {
  if (value === "1d" || value === "7d" || value === "30d") return value;
  return "all";
}

function periodStart(period: Period): Date | null {
  if (period === "all") return null;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (period === "1d") return new Date(now - day);
  if (period === "7d") return new Date(now - 7 * day);
  return new Date(now - 30 * day);
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(req: Request) {
  await requireRole("admin");

  const url = new URL(req.url);
  const period = parsePeriod(url.searchParams.get("period"));
  const start = periodStart(period);

  const snapshot = await getAdminDb().collection("assistant_interactions").get();
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<
    Record<string, unknown> & { id: string }
  >;

  const filtered = docs
    .filter((doc) => {
      if (!start) return true;
      const raw = typeof doc.createdAt === "string" ? doc.createdAt : "";
      const date = new Date(raw);
      return !Number.isNaN(date.getTime()) && date >= start;
    })
    .sort((a, b) => {
      const aDate = typeof a.createdAt === "string" ? a.createdAt : "";
      const bDate = typeof b.createdAt === "string" ? b.createdAt : "";
      return bDate.localeCompare(aDate);
    });

  const headers = [
    "id",
    "eventType",
    "intent",
    "message",
    "understood",
    "replyHasCtas",
    "ctasCount",
    "interactionId",
    "ctaLabel",
    "ctaHref",
    "channel",
    "createdAt",
  ];

  const rows = filtered.map((doc) =>
    [
      doc.id,
      doc.eventType,
      doc.intent,
      doc.message,
      doc.understood,
      doc.replyHasCtas,
      doc.ctasCount,
      doc.interactionId,
      doc.ctaLabel,
      doc.ctaHref,
      doc.channel,
      doc.createdAt,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="assistant-interactions-${period}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
