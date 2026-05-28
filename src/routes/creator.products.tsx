import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { uploadCreatorFile } from "@/lib/upload";
import {
  creatorDeleteProduct,
  creatorListMyProducts,
  creatorUpsertProduct,
} from "@/lib/creators.functions";
import { formatPrice, resolveImage } from "@/lib/format";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Upload, Film, Loader2 } from "lucide-react";

export const Route = createFileRoute("/creator/products")({
  head: () => ({ meta: [{ title: "My products — Creator dashboard" }] }),
  component: CreatorProductsPage,
});

type Category = { id: string; name: string };

type FormState = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  priceTk: string;
  stock: string;
  active: boolean;
  category_id: string;
  images: string[];
  video_url: string;
};

const empty: FormState = {
  title: "",
  slug: "",
  description: "",
  priceTk: "",
  stock: "1",
  active: true,
  category_id: "",
  images: [],
  video_url: "",
};

function CreatorProductsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(creatorListMyProducts);
  const upsertFn = useServerFn(creatorUpsertProduct);
  const deleteFn = useServerFn(creatorDeleteProduct);

  const { data: products, isLoading } = useQuery({
    queryKey: ["creator", "my-products"],
    queryFn: () => listFn(),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const [editing, setEditing] = useState<FormState | null>(null);

  const upsert = useMutation({
    mutationFn: (input: { id?: string; values: any }) => upsertFn({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["creator", "my-products"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
      qc.invalidateQueries({ queryKey: ["best-sellers"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["creator", "my-products"] });
      qc.invalidateQueries({ queryKey: ["shop"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-cream">My products</h2>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
        >
          <Plus className="h-4 w-4" /> New listing
        </button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {products && products.length === 0 && (
        <div className="rounded-md border border-dashed border-border/60 bg-card/30 p-10 text-center">
          <p className="text-muted-foreground">You haven't listed anything yet.</p>
          <button
            onClick={() => setEditing({ ...empty })}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
          >
            <Plus className="h-4 w-4" /> List your first piece
          </button>
        </div>
      )}

      {products && products.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const imgs = Array.isArray(p.images) ? (p.images as unknown[]) : [];
            const first = typeof imgs[0] === "string" ? (imgs[0] as string) : null;
            return (
              <li key={p.id} className="overflow-hidden rounded-md border border-border/60 bg-card/40">
                <div className="relative aspect-[4/5] bg-background">
                  <img src={resolveImage(first)} alt={p.title} className="h-full w-full object-cover" />
                  {p.video_url && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-pine-glow backdrop-blur">
                      <Film className="h-3 w-3" /> Video
                    </span>
                  )}
                  {!p.active && (
                    <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg text-cream">{p.title}</h3>
                    <span className="text-sm text-cream">{formatPrice(p.price_cents)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.stock} in stock</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const imgs = Array.isArray(p.images) ? (p.images as unknown[]).filter((s) => typeof s === "string") as string[] : [];
                        setEditing({
                          id: p.id,
                          title: p.title,
                          slug: p.slug,
                          description: p.description ?? "",
                          priceTk: (p.price_cents / 100).toString(),
                          stock: p.stock.toString(),
                          active: p.active,
                          category_id: p.category_id ?? "",
                          images: imgs,
                          video_url: p.video_url ?? "",
                        });
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs text-cream hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }}
                      className="inline-flex items-center justify-center rounded-full border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
  const { user } = useAuth();
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleImages = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploadingImg(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name} is over 8MB`);
          continue;
        }
        const url = await uploadCreatorFile(String(user.id), file, "images");
        uploaded.push(url);
      }
      if (uploaded.length > 0) {
        const next = [...state.images, ...uploaded].slice(0, 10);
        setState({ ...state, images: next });
        toast.success(`${uploaded.length} image(s) uploaded`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleVideo = async (file: File | null) => {
    if (!file || !user) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error("Video must be under 30MB");
      return;
    }
    setUploadingVid(true);
    try {
      const url = await uploadCreatorFile(String(user.id), file, "videos");
      setState({ ...state, video_url: url });
      toast.success("Video uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Video upload failed");
    } finally {
      setUploadingVid(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceTk = parseFloat(state.priceTk);
    if (!isFinite(priceTk) || priceTk < 0) return toast.error("Invalid price");
    const stock = parseInt(state.stock, 10);
    if (!isFinite(stock) || stock < 0) return toast.error("Invalid stock");
    if (state.images.length === 0) return toast.error("Please add at least one image");

    onSave({
      title: state.title.trim(),
      slug: state.slug.trim() || null,
      description: state.description.trim() || null,
      price_cents: Math.round(priceTk * 100),
      stock,
      active: state.active,
      category_id: state.category_id || null,
      images: state.images,
      video_url: state.video_url || null,
    });
  };

  const removeImage = (idx: number) =>
    setState({ ...state, images: state.images.filter((_, i) => i !== idx) });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="my-10 w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-elegant sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-cream">{state.id ? "Edit listing" : "New listing"}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-cream">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Images */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Photos *</label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {state.images.map((url, idx) => (
              <div key={idx} className="group relative aspect-square overflow-hidden rounded border border-border bg-background">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove">
                  <X className="h-3 w-3 text-cream" />
                </button>
              </div>
            ))}
            {state.images.length < 10 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-border bg-background/40 text-xs text-muted-foreground hover:bg-accent hover:text-cream">
                {uploadingImg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>Add</span>
                <input type="file" accept="image/*" multiple onChange={(e) => handleImages(e.target.files)} className="hidden" />
              </label>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">JPG or PNG, up to 8MB each. First image is the cover.</p>
        </div>

        {/* Video */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Short video (optional)</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {state.video_url ? (
              <video src={state.video_url} controls className="h-24 rounded border border-border bg-background" />
            ) : null}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-cream hover:bg-accent">
              {uploadingVid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
              {state.video_url ? "Replace video" : "Upload video"}
              <input type="file" accept="video/*" onChange={(e) => handleVideo(e.target.files?.[0] ?? null)} className="hidden" />
            </label>
            {state.video_url && (
              <button type="button" onClick={() => setState({ ...state, video_url: "" })} className="text-xs text-muted-foreground hover:text-destructive">
                Remove
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">MP4 or MOV, up to 30MB. Keep it under 30 seconds.</p>
        </div>

        {/* Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title *" className="sm:col-span-2">
            <input required value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Slug (auto from title)" className="sm:col-span-2">
            <input value={state.slug} onChange={(e) => setState({ ...state, slug: e.target.value })} placeholder="auto" className={inputCls} />
          </Field>
          <Field label="Price (BDT) *">
            <input required type="number" min="0" step="0.01" value={state.priceTk} onChange={(e) => setState({ ...state, priceTk: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Stock *">
            <input required type="number" min="0" step="1" value={state.stock} onChange={(e) => setState({ ...state, stock: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Category" className="sm:col-span-2">
            <select value={state.category_id} onChange={(e) => setState({ ...state, category_id: e.target.value })} className={inputCls}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={4} value={state.description} onChange={(e) => setState({ ...state, description: e.target.value })} className={inputCls} placeholder="What is it? What's it made of? How was it made?" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-cream sm:col-span-2">
            <input type="checkbox" checked={state.active} onChange={(e) => setState({ ...state, active: e.target.checked })} className="h-4 w-4 accent-[var(--pine-glow)]" />
            Visible in shop
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploadingImg || uploadingVid}
            className="rounded-full bg-primary px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
          >
            {saving ? "Saving…" : state.id ? "Save changes" : "Publish listing"}
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
