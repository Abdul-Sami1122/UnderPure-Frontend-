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
    <section className="border-t border-[#d4a59a]/10 pt-12 sm:pt-16 mt-12 sm:mt-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <p className="text-[#d4a59a] text-[8px] sm:text-[9px] tracking-[0.3em] uppercase font-['Montserrat'] mb-2">
            You May Also Love
          </p>
          <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-light text-[#f5f0ee]">
            Complete Your Collection
          </h2>
        </div>
        <Link
          to={`/shop?category=${category}`}
          className="flex items-center gap-1.5 text-[10px] sm:text-xs tracking-[0.15em] uppercase font-['Montserrat'] text-[#9a8f8c] hover:text-[#d4a59a] transition-colors"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[#141414] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {related.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}