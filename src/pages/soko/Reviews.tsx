import { Star, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import WealthPageShell from "@/components/wealth/WealthPageShell";
import { ReviewService } from "@/lib/services";

const Reviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => { ReviewService.myAll().then(setReviews); }, []);
  return (
    <WealthPageShell title="Reviews & Ratings" subtitle="What buyers are saying" Icon={MessageSquare} back="/dashboard/sokoplace">
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">{r.title || "Review"}</p>
              <div className="flex">{[...Array(5)].map((_, n) => <Star key={n} className={`w-3 h-3 ${n < r.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />)}</div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{r.body}</p>
            {r.verified_purchase && <p className="text-[10px] text-primary">✓ Verified purchase</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-center text-xs text-muted-foreground py-8">No reviews yet</p>}
      </div>
    </WealthPageShell>
  );
};
export default Reviews;
