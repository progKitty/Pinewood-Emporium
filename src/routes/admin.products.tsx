import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api-client";
import { uploadCreatorFile } from "@/lib/upload";
import {
  adminDeleteProduct,
  adminListProducts,
  adminUpsertProduct,
} from "@/lib/products.functions";
import { formatPrice, resolveImage } from "@/lib/format";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Admin · Products — Pinewood Emporium" }] }),
  component: AdminProductsPage,
});

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  active: boolean;
  category_id: string | null;
  images: unknown;
};

type Category = { id: string; name: string };

type FormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  priceTk: string;
  compareAtTk: string;
  stock: string;
  active: boolean;
  category_id: string;
  imagesText: string;
};

const empty: FormState = {
  title: "",
  slug: "",
  description: "",
  priceTk: "",
  compareAtTk: "",
  stock: "0",
  active: true,
  category_id: "",
  imagesText: "",
};

function AdminProductsPage() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminListProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const data = await fetchApi("/shop/categories/");
      return data as Category[];
    },
  });

  const [editing, setEditing] = useState<FormState | null>(null);

  const upsert = useMutation({
    mutationFn: (input: { id?: string; values: any }) => adminUpsertProduct({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminDeleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => setEditing({ ...empty });
  const openEdit = (p: ProductRow) => {
    const imgs = Array.isArray(p.images) ? (p.images as unknown[]).filter((s) => typeof s === "string") : [];
    setEditing({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description ?? "",
      priceTk: (p.price_cents / 100).toString(),
      compareAtTk: p.compare_at_cents ? (p.compare_at_cents / 100).toString() : "",
      stock: p.stock.toString(),
      active: p.active,
      category_id: p.category_id ?? "",
      imagesText: imgs.join("\n"),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-pine-glow">Admin</p>
          <h1 className="mt-2 font-display text-4xl text-cream sm:text-5xl">Products</h1>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
        >
          <Plus className="h-4 w-4" />
          New product
        </button>
      </header>

      <div className="overflow-x-auto rounded-md border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-card/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {products && products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No products yet.</td></tr>
            )}
            {products?.map((p) => {
              const imgs = Array.isArray(p.images) ? (p.images as unknown[]) : [];
              const first = typeof imgs[0] === "string" ? (imgs[0] as string) : null;
              return (
                <tr key={p.id} className="bg-background/50 hover:bg-card/40">
                  <td className="px-4 py-3">
                    <img src={resolveImage(first)} alt="" className="h-12 w-12 rounded object-cover" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-cream">{p.title}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-cream">{formatPrice(p.price_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock === 0 ? "text-destructive" : "text-cream"}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${p.active ? "bg-pine/30 text-pine-glow" : "bg-muted text-muted-foreground"}`}>
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEdit(p as ProductRow)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-cream"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Editor
          state={editing}
          setState={setEditing}
          categories={categories ?? []}
          onClose={() => setEditing(null)}
          onSave={(values) => upsert.mutate({ id: editing.id, values })}
          saving={upsert.isPending}
        />
      )}
    </div>
  );
}

function Editor({
  state,
  setState,
  categories,
  onClose,
  onSave,
  saving,
}: {
  state: FormState;
  setState: (s: FormState | null) => void;
  categories: Category[];
  onClose: () => void;
  onSave: (values: any) => void;
  saving: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState({ ...state, [k]: v });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceTk = parseFloat(state.priceTk);
    if (!isFinite(priceTk) || priceTk < 0) return toast.error("Invalid price");
    const stock = parseInt(state.stock, 10);
    if (!isFinite(stock) || stock < 0) return toast.error("Invalid stock");
    const compareAtTk = state.compareAtTk.trim() ? parseFloat(state.compareAtTk) : null;
    if (compareAtTk !== null && (!isFinite(compareAtTk) || compareAtTk < 0)) return toast.error("Invalid compare-at price");

    const images = state.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      title: state.title.trim(),
      slug: state.slug.trim() || null,
      description: state.description.trim() || null,
      price_cents: Math.round(priceTk * 100),
      compare_at_cents: compareAtTk !== null ? Math.round(compareAtTk * 100) : null,
      stock,
      active: state.active,
      category_id: state.category_id || null,
      images,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="my-10 w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-elegant sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-cream">
            {state.id ? "Edit product" : "New product"}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-cream">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <input required value={state.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug (optional — auto from title)" className="sm:col-span-2">
            <input value={state.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto" className={inputCls} />
          </Field>
          <Field label="Price (BDT)">
            <input required type="number" min="0" step="0.01" value={state.priceTk} onChange={(e) => update("priceTk", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Compare-at (BDT)">
            <input type="number" min="0" step="0.01" value={state.compareAtTk} onChange={(e) => update("compareAtTk", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Stock">
            <input required type="number" min="0" step="1" value={state.stock} onChange={(e) => update("stock", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={state.category_id} onChange={(e) => update("category_id", e.target.value)} className={inputCls}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={5} value={state.description} onChange={(e) => update("description", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Images" className="sm:col-span-2">
            <ImageManager
              imagesText={state.imagesText}
              onChange={(v) => update("imagesText", v)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-cream sm:col-span-2">
            <input type="checkbox" checked={state.active} onChange={(e) => update("active", e.target.checked)} className="h-4 w-4 accent-[var(--pine-glow)]" />
            Visible in shop
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
          >
            {saving ? "Saving…" : state.id ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream focus:border-pine-glow focus:outline-none";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ImageManager({ imagesText, onChange }: { imagesText: string; onChange: (v: string) => void }) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const images = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);

  const setImages = (next: string[]) => onChange(next.join("\n"));

  const remove = (idx: number) => setImages(images.filter((_, i) => i !== idx));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) { toast.error("Please sign in"); return; }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) { toast.error(`${file.name} is not an image`); continue; }
        if (file.size > 8 * 1024 * 1024) { toast.error(`${file.name} exceeds 8MB`); continue; }
        const url = await uploadCreatorFile(String(user.id), file, "images");
        uploaded.push(url);
      }
      if (uploaded.length > 0) setImages([...images, ...uploaded]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-background/50">
              <img src={resolveImage(src)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-background/90 text-destructive group-hover:flex"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-wider text-cream hover:border-pine-glow disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload images"}
        </button>
        <span className="text-xs text-muted-foreground">or paste URLs below (one per line)</span>
      </div>
      <textarea
        rows={3}
        value={imagesText}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… or /src/assets/cat-leather.jpg"
        className={inputCls}
      />
    </div>
  );
}
