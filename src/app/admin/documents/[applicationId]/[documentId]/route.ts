import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  downloadStorageObjectSupabase,
  getDocumentDescriptor,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    applicationId: string;
    documentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return new NextResponse("Authentification requise.", { status: 401 });
  }

  const { applicationId, documentId } = await context.params;
  const descriptor = await getDocumentDescriptor(applicationId, documentId);

  if (!descriptor) {
    return new NextResponse("Document introuvable.", { status: 404 });
  }

  if (descriptor.source === "supabase") {
    const file = await downloadStorageObjectSupabase(descriptor.storagePath);

    return new NextResponse(file.buffer, {
      headers: {
        "Content-Type": descriptor.document.mimeType || file.mimeType,
        "Content-Disposition": `attachment; filename="${descriptor.document.originalName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const file = await readFile(descriptor.filePath);

  return new NextResponse(file, {
    headers: {
      "Content-Type": descriptor.document.mimeType,
      "Content-Disposition": `attachment; filename="${descriptor.document.originalName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
