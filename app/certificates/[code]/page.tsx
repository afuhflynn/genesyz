import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PrintCertificateButton } from "@/components/school/print-certificate-button";

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await db.certificate.findUnique({
    where: { verificationCode: code },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
  });
  if (!certificate) notFound();

  const active = certificate.status === "ACTIVE";
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-12">
      <section className="mx-auto max-w-3xl border-8 border-primary/20 bg-background p-10 text-center shadow-xl print:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Genesyz Learning</p>
        <h1 className="mt-8 text-4xl font-bold">Certificate of Completion</h1>
        <p className="mt-8 text-muted-foreground">This certifies that</p>
        <p className="mt-2 text-3xl font-semibold">{certificate.user.name}</p>
        <p className="mt-8 text-muted-foreground">has successfully completed</p>
        <p className="mt-2 text-2xl font-semibold">{certificate.course.title}</p>
        <p className={`mt-8 font-semibold ${active ? "text-emerald-600" : "text-destructive"}`}>
          {active ? "Verified certificate" : "Revoked certificate"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Verification code: {certificate.verificationCode}</p>
        <p className="mt-1 text-sm text-muted-foreground">Issued {certificate.issuedAt.toLocaleDateString()}</p>
        <div className="mt-8 flex justify-center print:hidden"><PrintCertificateButton /></div>
      </section>
    </main>
  );
}
