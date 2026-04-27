import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ThumbsUp, ChevronDown } from "lucide-react";

function generateReviews(product) {
  const pool = [
    {
      id: "r1",
      author: "Isabelle M.",
      location: "London, UK",
      rating: 5,
      title: "Absolutely exquisite",
      body: `I've never owned anything quite like this. The fabric feels like a second skin. Worth every penny.`,
      date: "2026-03-14",
      helpful: 24,
      verified: true,
    },
    {
      id: "r2",
      author: "Camille D.",
      location: "Paris, France",
      rating: 5,
      title: "The quality is unreal",
      body: "I bought this as a gift for myself and I have zero regrets. Velour's packaging alone makes you feel like royalty.",
      date: "2026-02-28",
      helpful: 18,
      verified: true,
    },
    {
      id: "r3",
      author: "Sophie K.",
      location: "New York, US",
      rating: 4,
      title: "Stunning piece",
      body: `Gorgeous piece — the construction feels very premium. I'd recommend sizing up if you're between sizes.`,
      date: "2026-01-20",
      helpful: 31,
      verified: true,
    }
  ];
  return pool;
}

function StarRow({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < rating ? "text-[#d4a59a] fill-[#d4a59a]" : "text-[#3a3a3a]"}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, percent }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-['Montserrat'] text-[#9a8f8c] w-4">{label}</span>
      <div className="flex-1 h-1 bg-[#1a1a1a] overflow-hidden">
        <div className="h-full bg-[#d4a59a]" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-[9px] font-['Montserrat'] text-[#9a8f8c] w-6 text-right">{percent}%</span>
    </div>
  );
}

export function ReviewsSection({ product }) {
  const reviews = generateReviews(product);
  const [helpfulIds, setHelpfulIds] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  const markHelpful = (id) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section className="border-t border-[#d4a59a]/10 pt-12 sm:pt-16 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-12">
        <div className="bg-[#0d0d0d] p-6 border border-[#d4a59a]/5 rounded-sm">
          <h2 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#f5f0ee] mb-6">Reviews</h2>
          <div className="mb-6">
            <p className="font-['Cormorant_Garamond'] text-5xl sm:text-6xl font-light text-[#f5f0ee] leading-none mb-2">
              {product.rating ? product.rating.toFixed(1) : "0.0"}
            </p>
            <StarRow rating={Math.round(product.rating || 0)} />
            <p className="text-[10px] text-[#9a8f8c] font-['Montserrat'] mt-3 uppercase tracking-wider">
              Based on {product.reviewCount || 0} reviews
            </p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar key={star} label={`${star}★`} percent={star === 5 ? 85 : star === 4 ? 10 : 5} />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {displayedReviews.map((review, i) => (
            <div key={review.id} className="border-b border-[#d4a59a]/10 pb-8 last:border-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <StarRow rating={review.rating} />
                    {review.verified && (
                      <span className="text-[8px] tracking-[0.1em] uppercase font-['Montserrat'] text-green-400/70 border border-green-400/20 px-1.5 py-0.5">Verified</span>
                    )}
                  </div>
                  <p className="font-['Cormorant_Garamond'] text-lg font-medium text-[#f5f0ee]">{review.title}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-semibold font-['Montserrat'] text-[#f5f0ee]">{review.author}</p>
                  <p className="text-[9px] font-['Montserrat'] text-[#9a8f8c]">{review.location} · {review.date}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#9a8f8c] font-['Montserrat'] leading-relaxed mb-5">{review.body}</p>
              <button
                onClick={() => markHelpful(review.id)}
                className={`flex items-center gap-1.5 text-[9px] tracking-[0.1em] uppercase font-['Montserrat'] transition-colors ${helpfulIds.has(review.id) ? "text-[#d4a59a]" : "text-[#9a8f8c] hover:text-[#f5f0ee]"}`}
              >
                <ThumbsUp size={11} /> Helpful ({review.helpful + (helpfulIds.has(review.id) ? 1 : 0)})
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}