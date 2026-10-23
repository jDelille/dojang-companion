import { Banknote, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import type { TxnMethod } from "../../types/sales";

/*
   Payment-method icons as components — the React counterpart of the `icon`
   field in METHOD (assets/js/payments.js), which named a lucide glyph for the
   template's icons() pass to swap in.
*/
export const METHOD_ICON: Record<TxnMethod, typeof Banknote> = {
  Cash: Banknote,
  Card: CreditCard,
  "Apple Pay": Smartphone,
  Wallet: Wallet,
  Bank: Landmark,
};

export default METHOD_ICON;
