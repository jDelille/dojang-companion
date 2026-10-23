import { Star } from "lucide-react";

/*
   Star row used by the feedback summary, cards and detail modal.

   Ported from stars() in tailwind/src/assets/js/feedback.js, which emitted
   five glyphs and toggled `star-on` / `star-off` per position.
*/

type StarsProps = {
  /** How many stars are filled, 0–5. */
  value: number;
  /** Pixel size for each glyph. */
  size: number;
};

const Stars = ({ value, size }: StarsProps) => (
  <>
    {[1, 2, 3, 4, 5].map((position) => (
      <Star
        key={position}
        className={`shrink-0 ${position <= value ? "star-on" : "star-off"}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      />
    ))}
  </>
);

export default Stars;
