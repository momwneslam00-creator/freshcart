"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/useFetch";
import { Spinner, Stars } from "@/components/ui";
import type { Review } from "@/types";

function RatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
        >
          <Star className={`h-6 w-6 ${n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function Reviews({ productId }: { productId: string }) {
  const { userId, isLoggedIn } = useAuth();
  const { data, loading, error, reload } = useFetch(
    () => api.getProductReviews(productId),
    [productId],
  );

  const [editing, setEditing] = useState<Review | null>(null);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const reviews = data?.data ?? [];

  const startEdit = (r: Review) => {
    setEditing(r);
    setText(r.review);
    setRating(r.rating);
  };
  const cancel = () => {
    setEditing(null);
    setText("");
    setRating(5);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Write a few words about the product");
    setSaving(true);
    try {
      if (editing) {
        await api.updateReview(editing._id, { review: text.trim(), rating });
        toast.success("Review updated");
      } else {
        await api.createReview(productId, { review: text.trim(), rating });
        toast.success("Review added");
      }
      cancel();
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save review");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.deleteReview(id);
      toast.success("Review deleted");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete review");
    }
  };

  return (
    <section className="mt-14" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="text-2xl font-bold text-ink">
        Customer reviews
      </h2>

      {isLoggedIn ? (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-lg bg-surface p-4">
          <p className="text-sm font-medium text-slate-700">
            {editing ? "Edit your review" : "Write a review"}
          </p>
          <RatingInput value={rating} onChange={setRating} />
          <textarea
            className="input min-h-24"
            placeholder="Share your experience…"
            aria-label="Review"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {editing ? "Update review" : "Submit review"}
            </button>
            {editing && (
              <button type="button" className="btn-outline" onClick={cancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Log in to write a review.</p>
      )}

      <div className="mt-6 space-y-4">
        {loading && <Spinner className="h-6 w-6 text-brand" />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p className="text-sm text-slate-500">No reviews yet — be the first.</p>
        )}
        {reviews.map((r) => (
          <article key={r._id} className="rounded-lg border border-slate-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{r.user?.name ?? "Anonymous"}</p>
                <Stars value={r.rating} />
              </div>
              {userId && r.user?._id === userId && (
                <div className="flex gap-3 text-sm">
                  <button className="text-brand hover:underline" onClick={() => startEdit(r)}>
                    Edit
                  </button>
                  <button className="text-danger hover:underline" onClick={() => remove(r._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-700">{r.review}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
