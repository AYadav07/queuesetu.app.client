"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, GitBranch, Loader2 } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { accountApi, type BranchRequest } from "@/lib/api/account";
import { useAuthStore } from "@/store/use-auth-store";

type Field = {
  id: keyof Omit<BranchRequest, "tenantId">;
  label: string;
  placeholder: string;
  required: boolean;
  type?: string;
};

const fields: Field[] = [
  { id: "name", label: "Branch name", placeholder: "e.g. Main Campus", required: true },
  { id: "address", label: "Address", placeholder: "e.g. 12 MG Road", required: true },
  { id: "city", label: "City", placeholder: "e.g. Bengaluru", required: true },
  { id: "pinCode", label: "PIN code", placeholder: "e.g. 560001", required: true },
  { id: "phoneCode", label: "Phone / contact", placeholder: "e.g. +91-9876543210", required: false },
];

type Props = {
  tenantId: string;
  branchId?: string;          // present in edit mode
  initialValues?: Partial<BranchRequest>;
};

export default function BranchFormClient({ tenantId, branchId, initialValues }: Props) {
  const router = useRouter();
  const isEdit = !!branchId;

  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [formData, setFormData] = useState<Omit<BranchRequest, "tenantId">>({
    name: initialValues?.name ?? "",
    address: initialValues?.address ?? "",
    city: initialValues?.city ?? "",
    pinCode: initialValues?.pinCode ?? "",
    phoneCode: initialValues?.phoneCode ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && (!user || !accessToken)) router.replace("/login");
  }, [hydrated, user, accessToken, router]);

  if (!hydrated || !user || !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  const onChange = (id: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const isValid =
    formData.name.trim() &&
    formData.address.trim() &&
    formData.city.trim() &&
    formData.pinCode.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    const body: BranchRequest = { tenantId, ...formData };
    try {
      if (isEdit) {
        await accountApi.updateBranch(branchId!, body, accessToken);
      } else {
        await accountApi.createBranch(body, accessToken);
      }
      router.push(`/tenants/${tenantId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="py-10 sm:py-16 lg:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-xl"
          >
            {/* Back */}
            <button
              type="button"
              onClick={() => router.push(`/tenants/${tenantId}`)}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Tenant
            </button>

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
                <GitBranch className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span className="text-xs font-medium text-slate-600">Branch</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">
                {isEdit ? "Edit Branch" : "Add a Branch"}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {isEdit
                  ? "Update the branch details."
                  : "A branch is a physical or logical location under your tenant."}
              </p>
            </div>

            <Card className="rounded-2xl border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>Branch details</CardTitle>
                <CardDescription>Fill in the location and contact information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label
                        htmlFor={field.id}
                        className="text-sm font-medium text-slate-700"
                      >
                        {field.label}
                        {field.required && (
                          <span className="ml-0.5 text-destructive" aria-hidden="true">
                            {" "}*
                          </span>
                        )}
                      </label>
                      <input
                        id={field.id}
                        type={field.type ?? "text"}
                        required={field.required}
                        autoFocus={field.id === "name"}
                        value={formData[field.id] ?? ""}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}

                  {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/tenants/${tenantId}`)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !isValid}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : null}
                      {isEdit ? "Save Changes" : "Add Branch"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
