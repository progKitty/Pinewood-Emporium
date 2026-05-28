import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminDeleteCategory,
  adminListCategories,
  adminUpsertCategory,
} from "@/lib/categories.functions";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Admin · Categories — Pinewood Emporium" }] }),
  component: AdminCategoriesPage,
});

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: string;
};

const empty: FormState = { name: "", slug: "", description: "", image_url: "", sort_order: "0" };

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCategories);
  const upsertFn = useServerFn(adminUpsertCategory);
  const deleteFn = useServerFn(adminDeleteCategory);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => listFn(),
  });

  const [editing, setEditing] = useState<FormState | null>(null);

  const upsert = useMutation({
    mutationFn: (input: { id?: string; values: any }) => upsertFn({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Admin</p>
          <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">Categories</h1>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
        >
          <Plus className="h-4 w-4" /> New category
        </button>
      </header>

      <div className="overflow-x-auto rounded-md border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {data && data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
            )}
            {data?.map((c) => (
              <tr key={c.id} className="bg-background/50 hover:bg-card/40">
                <td className="px-4 py-3 text-cream">{c.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3 text-cream">{c.sort_order}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => setEditing({
                        id: c.id, name: c.name, slug: c.slug,
                        description: c.description ?? "", image_url: c.image_url ?? "",
                        sort_order: String(c.sort_order ?? 0),
                      })}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-cream"
                      aria-label="Edit"
                    ><Pencil className="h-4 w-4" /></button>
                    <button
                      onClick={() => { if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      aria-label="Delete"
                    ><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Editor
          state={editing}
          setState={setEditing}
          onClose={() => setEditing(null)}
          onSave={(values) => upsert.mutate({ id: editing.id, values })}
          saving={upsert.isPending}
        />
      )}
    </div>
  );
}

function Editor({
  state, setState, onClose, onSave, saving,
}: {
  state: FormState;
  setState: (s: FormState | null) => void;
  onClose: () => void;
  onSave: (values: any) => void;
  saving: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setState({ ...state, [k]: v });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = parseInt(state.sort_order, 10);
    onSave({
      name: state.name.trim(),
      slug: state.slug.trim() || null,
      description: state.description.trim() || null,
      image_url: state.image_url.trim() || null,
      sort_order: isFinite(order) ? order : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="my-10 w-full max-w-xl rounded-lg border border-border bg-card p-6 shadow-elegant sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-cream">{state.id ? "Edit category" : "New category"}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-cream"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Name"><input required value={state.name} onChange={(e) => update("name", e.target.value)} className={inputCls} /></Field>
          <Field label="Slug (optional)"><input value={state.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto" className={inputCls} /></Field>
          <Field label="Description"><textarea rows={3} value={state.description} onChange={(e) => update("description", e.target.value)} className={inputCls} /></Field>
          <Field label="Image URL"><input value={state.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="/src/assets/cat-leather.jpg" className={inputCls} /></Field>
          <Field label="Sort order"><input type="number" min="0" value={state.sort_order} onChange={(e) => update("sort_order", e.target.value)} className={inputCls} /></Field>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60">
            {saving ? "Saving…" : state.id ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream focus:border-pine-glow focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
