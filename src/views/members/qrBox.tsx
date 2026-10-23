import { qrCells } from "./useDayPasses";

/*
   Decorative QR block for a pass ticket.

   Ported from renderQR() in tailwind/src/assets/js/day-passes.js, which
   emitted 25 <i> cells and marked the blank ones with `.off`.
*/

type QrBoxProps = {
  /** Seed string — the pass code, so each ticket has a stable pattern. */
  seed: string;
  id?: string;
};

const QrBox = ({ seed, id }: QrBoxProps) => (
  <div className="qr-box" id={id} aria-hidden="true">
    {qrCells(seed).map((on, index) => (
      <i key={index} className={on ? undefined : "off"} />
    ))}
  </div>
);

export default QrBox;
