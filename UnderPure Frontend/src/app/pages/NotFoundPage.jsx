import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-['Cormorant_Garamond'] text-[120px] md:text-[180px] font-light text-[#d4a59a]/10 leading-none mb-0">
          404
        </p>
        <p className="text-[#d4a59a] text-xs tracking-[0.35em] uppercase font-['Montserrat'] -mt-6 mb-4">
          Page Not Found
        </p>
        <p className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f5f0ee]/60 mb-10">
          This page seems to have slipped away
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-xs tracking-[0.25em] uppercase font-['Montserrat'] text-[#d4a59a] border border-[#d4a59a]/30 px-8 py-4 hover:bg-[#d4a59a]/10 transition-colors"
        >
          <ArrowLeft size={13} />
          Return Home
        </Link>
      </div>
    </div>
  );
}