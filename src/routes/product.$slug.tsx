import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { formatPrice, resolveImage } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Minus, Plus, ShoppingBag, ArrowLeft, Star, StarHalf } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [{ title: "Product — Pinewood Emporium" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      return await apiClient.get<any>(`/products/${slug}/`);
    },
  });

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review.");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(`/products/${slug}/reviews/`, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-md bg-card" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded bg-card" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-card" />
            <div className="h-24 animate-pulse rounded bg-card" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl text-cream">Product not found</h1>
        <p className="mt-3 text-muted-foreground">It may have been moved or sold out.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm uppercase tracking-wider text-primary-foreground hover:bg-pine-glow"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
    );
  }

  const imgs = Array.isArray(product.images) ? (product.images as string[]) : [];
  const firstImg = imgs[0] ?? null;
  const onSale = product.compare_at_cents && product.compare_at_cents > product.price_cents;
  const inStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Link to="/shop" className="mb-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-cream">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md bg-card">
            {firstImg ? (
              <img src={resolveImage(firstImg)} alt={product.title} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="aspect-[4/5] w-full bg-muted flex items-center justify-center text-muted-foreground">No image available</div>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {imgs.slice(1, 5).map((url, i) => (
                <img key={i} src={resolveImage(url)} alt="" className="aspect-square w-full rounded object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl text-cream sm:text-5xl">{product.title}</h1>

          {/* Rating Summary */}
          {product.rating_count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex text-pine-glow">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("h-4 w-4", s <= product.rating_avg ? "fill-pine-glow" : "text-muted")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.rating_count} reviews)</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl text-cream">{formatPrice(product.price_cents)}</span>
            {onSale && (
              <span className="text-base text-muted-foreground line-through decoration-pine-glow/70 decoration-2">
                {formatPrice(product.compare_at_cents!)}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
            {inStock ? `${product.stock} in stock` : "Currently sold out"}
          </p>

          {product.description && (
            <p className="mt-8 whitespace-pre-line leading-relaxed text-foreground/80">
              {product.description}
            </p>
          )}

          {inStock && (
            <div className="mt-10 flex items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex h-11 w-11 items-center justify-center text-cream hover:text-pine-glow" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm text-cream">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="inline-flex h-11 w-11 items-center justify-center text-cream hover:text-pine-glow" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  add(
                    {
                      productId: product.id,
                      slug: product.slug,
                      title: product.title,
                      image: firstImg ?? "",
                      priceCents: product.price_cents,
                    },
                    qty,
                  );
                  toast.success(`Added ${qty} × ${product.title} to cart`);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium uppercase tracking-wider text-primary-foreground shadow-elegant transition-all hover:bg-pine-glow"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to cart
              </button>
            </div>
          )}
          
          <div className="mt-10 grid gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground">
            <p>Shipped from Dhaka. Nationwide delivery in 2–5 business days.</p>
            <p>Pay with bKash, Nagad, Rocket, or cash on delivery.</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 border-t border-border/60 pt-16">
        <h2 className="font-display text-3xl text-cream mb-8">Customer Reviews</h2>
        
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-cream mb-4">Write a review</h3>
            {user ? (
              <form onSubmit={submitReview} className="space-y-4 bg-card p-6 rounded-lg border border-border">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setReviewRating(s)}
                        className="pw-icon-hover focus:outline-none"
                      >
                        <Star className={cn("h-6 w-6", s <= reviewRating ? "fill-pine-glow text-pine-glow" : "text-muted-foreground")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-cream focus:border-pine-glow focus:outline-none"
                    placeholder="Share your thoughts..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-pine-glow disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-card p-6 rounded-lg border border-border text-center">
                <p className="text-sm text-muted-foreground mb-4">Please sign in to leave a review.</p>
                <Link to="/login" className="inline-flex rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-pine-glow">
                  Sign in
                </Link>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review: any) => (
                <div key={review.id} className="bg-card/50 p-6 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-cream">{review.user_name}</div>
                    <div className="flex text-pine-glow">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-pine-glow" : "text-muted")} />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
