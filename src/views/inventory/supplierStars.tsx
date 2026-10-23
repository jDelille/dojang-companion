import { Star } from "lucide-react";

/*
   Supplier rating row — ported from stars() in tailwind/src/assets/js/suppliers.js,
   which emitted five lucide stars, colouring and filling the first `n` gold and
   leaving the rest at the track colour.
*/

type SupplierStarsProps = {
  /** How many stars are filled, 1–5. */
  rating: number;
  /** Extra classes appended to the wrapper (the view modal adds "mt-1"). */
  className?: string;
};

const SupplierStars = ({ rating, className }: SupplierStarsProps) => (
  <span
    className={`star-row inline-flex items-center gap-0.5${className ? " " + className : ""}`}
  >
    {[1, 2, 3, 4, 5].map((position) => {
      const on = position <= rating;
      return (
        <Star
          key={position}
          className="shrink-0"
          style={on ? { color: "#D4AF37", fill: "#D4AF37" } : { color: "#2E2E34" }}
          aria-hidden="true"
        />
      );
    })}
  </span>
);

export default SupplierStars;
