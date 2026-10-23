import { QR_PATTERN } from "./posData";

/*
   Decorative QR block, ported from fillQR() in
   tailwind/src/assets/js/pos.js.

   A fixed 9×9 pattern rather than a real encoder: the receipt is a template
   preview, and .qr in style.css already lays the cells out as a grid.
*/
const PosQr = ({ id }: { id?: string }) => (
  <div className="qr" id={id} aria-hidden="true">
    {QR_PATTERN.map((on, i) => (
      <span key={i} className={on ? "" : "off"} />
    ))}
  </div>
);

export default PosQr;
