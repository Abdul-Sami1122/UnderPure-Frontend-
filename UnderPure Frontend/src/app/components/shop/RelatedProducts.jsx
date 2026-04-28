import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { fetchProducts } from "../../lib/api";
import { ProductCard } from "./ProductCard";
import { MOCK_PRODUCTS } from "../../lib/mockData";

export function RelatedProducts({ currentProductId, category }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ category })
      .then((products) => {
        const filtered = products
          .filter((p) => p.id !== currentProductId)
          .slice(0, 4);
        setRelated(filtered);
      })
      .catch(() => {
        const filtered = MOCK_PRODUCTS
          .filter((p) => p.category === category && p.id !== currentProductId)
          .slice(0, 4);
        setRelated(filtered);
      })
      .finally(() => setLoading(false));
  }, [currentProductId, category]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="border-t border-[#d4a59a]/15 pt-16 md:pt-20 mt-16 md:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 md:mb-12 gap-5 text-center sm:text-left">
        <div>
          <p className="text-[#d4a59a] text-[10px] md:text-[10px] tracking-[0.3em] uppercase font-['Montserrat'] font-bold md:font-semibold mb-3">
            You May Also Love
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-4xl font-medium md:font-light text-[#f5f0ee]">
            Complete Your Collection
          </h2>
        </div>
        <Link
          to={`/shop?category=${category}`}
          className="flex items-center justify-center gap-2 text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-['Montserrat'] font-bold text-[#9a8f8c] hover:text-[#d4a59a] transition-colors border border-[#9a8f8c]/20 sm:border-none py-3 sm:py-0 px-6 sm:px-0 rounded-sm sm:rounded-none bg-[#111] sm:bg-transparent"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {related.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}