import { ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import { ProductCard } from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function NextArrow({ onClick }) {
  return (
    <button onClick={onClick} className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#0a0a0a]/90 border border-[#d4a59a]/20 text-[#d4a59a] hover:bg-[#d4a59a] hover:text-[#0a0a0a] transition-all opacity-0 group-hover:opacity-100 hidden sm:flex">
      <ChevronRight size={18} strokeWidth={1.5} />
    </button>
  );
}

function PrevArrow({ onClick }) {
  return (
    <button onClick={onClick} className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-[#0a0a0a]/90 border border-[#d4a59a]/20 text-[#d4a59a] hover:bg-[#d4a59a] hover:text-[#0a0a0a] transition-all opacity-0 group-hover:opacity-100 hidden sm:flex">
      <ChevronLeft size={18} strokeWidth={1.5} />
    </button>
  );
}

export function ProductSlider({ products = [], wishlistedIds = [], onWishlistChange }) {
  const settings = {
    dots: false,
    infinite: products.length > 2,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2, arrows: false, dots: true } }
    ],
  };

  return (
    <div className="relative group px-1 sm:px-4">
      <Slider {...settings}>
        {products.map((product, i) => (
          <div key={product.id} className="px-1.5 sm:px-3">
            <ProductCard product={product} wishlistedIds={wishlistedIds} onWishlistChange={onWishlistChange} index={i} />
          </div>
        ))}
      </Slider>
    </div>
  );
}