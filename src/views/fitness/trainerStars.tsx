/*
   Trainer star row — ported from stars() in tailwind/src/assets/js/trainers.js,
   which emitted five "★" glyphs and wrapped the unfilled tail in <span class="off">.
   This is deliberately glyph-based, not the lucide `Stars` used by Feedback.
*/

type TrainerStarsProps = {
  /** Rating 0–5; rounded to the nearest whole star. */
  rating: number;
};

const TrainerStars = ({ rating }: TrainerStarsProps) => {
  const full = Math.round(rating);
  return (
    <>
      {"★★★★★".slice(0, full)}
      <span className="off">{"★★★★★".slice(full)}</span>
    </>
  );
};

export default TrainerStars;
