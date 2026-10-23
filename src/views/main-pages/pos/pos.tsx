import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Pause,
  Plus,
  Receipt,
  RotateCcw,
  ScanBarcode,
  Search,
  Zap,
  Calculator as CalculatorIcon,
} from "lucide-react";
import Toast from "../../../components/common/Toast";
import PosHeaderBar from "./posHeaderBar";
import PosSummary from "./posSummary";
import PosPlanShortcuts from "./posPlanShortcuts";
import PosMemberCard from "./posMemberCard";
import PosProductGrid from "./posProductGrid";
import PosSuggestions from "./posSuggestions";
import PosOrderPanel from "./posOrderPanel";
import PosCalculator from "./posCalculator";
import HScroll from "./hScroll";
import { spawnRipple } from "./ripple";
import usePosRegister from "./usePosRegister";
import { CASHIER, CATEGORY_CHIPS } from "./posData";
import { csvCell, download, money, rfTotals } from "./posUtils";
import type { DiscountType, ModalId, QuickActionId, Transaction } from "./types";

import ReceiptModal from "./modals/receiptModal";
import SaleCompleteModal from "./modals/saleCompleteModal";
import QuickAddModal from "./modals/quickAddModal";
import EditItemModal from "./modals/editItemModal";
import ConfirmModal from "./modals/confirmModal";
import PaymentModal from "./modals/paymentModal";
import DiscountModal from "./modals/discountModal";
import CouponModal from "./modals/couponModal";
import CustomerPickModal from "./modals/customerPickModal";
import ResumeModal from "./modals/resumeModal";
import RefundModal from "./modals/refundModal";
import RefundProcessModal from "./modals/refundProcessModal";
import SaveDraftModal from "./modals/saveDraftModal";
import QuickSearchModal from "./modals/quickSearchModal";
import SyncModal from "./modals/syncModal";
import CameraModal from "./modals/cameraModal";
import QuickActionsModal from "./modals/quickActionsModal";
import RecentTxModal from "./modals/recentTxModal";
import InvoiceModal from "./modals/invoiceModal";

/*
   Point of Sale — the register page.

   Ported from tailwind/src/pos.html + assets/js/pos.js. The template drove
   everything through one delegated click handler and a set of renderX()
   functions; here usePosRegister owns the state and each section re-renders
   from it.

   The register-specific header is rendered here rather than in PosLayout
   because it mirrors live cart state.
*/

const Pos = () => {
  const reg = usePosRegister();

  /*
     One active modal, matching the template's single openModal(id) model.
     The invoice is separate state because it stacks *over* order history.
  */
  const [modal, setModal] = useState<ModalId | null>(null);
  const [invoiceTx, setInvoiceTx] = useState<Transaction | null>(null);
  const [refundTx, setRefundTx] = useState<Transaction | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [calcOpen, setCalcOpen] = useState(false);
  const [calcMin, setCalcMin] = useState(false);

  /* Snapshot of the sale, captured before the cart is cleared. */
  const [lastSale, setLastSale] = useState({ amount: 0, method: "Cash", invoice: "" });

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((id: ModalId) => setModal(id), []);

  const toggleCalc = useCallback(() => {
    setCalcOpen((o) => !o);
    setCalcMin(false);
  }, []);

  const toggleSound = useCallback(() => {
    const nowMuted = reg.toggleMuted();
    reg.showToast(nowMuted ? "Sounds muted" : "Sounds on");
  }, [reg]);

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Esc closes the calculator only when no modal is up; each PosModal
        // handles its own Esc, so reaching here means nothing is open.
        if (!modal && !invoiceTx && !refundTx && !reg.confirmOpts && calcOpen) {
          setCalcOpen(false);
        }
        return;
      }
      // Never steal a function key from a field the cashier is typing in.
      const tag = document.activeElement?.tagName ?? "";
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

      if (e.key === "F2") {
        e.preventDefault();
        openModal("quick-search");
      } else if (e.key === "F4") {
        e.preventDefault();
        toggleCalc();
      } else if (e.key === "F8") {
        e.preventDefault();
        toggleSound();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal, invoiceTx, refundTx, reg.confirmOpts, calcOpen, openModal, toggleCalc, toggleSound]);

  /* ---------- sale completion ---------- */
  const completeSale = () => {
    if (!reg.cart.length) {
      reg.sfx("error");
      reg.showToast("Add items to cart first");
      return;
    }
    const ready = reg.paymentReady();
    if (!ready.ok) {
      reg.sfx("error");
      reg.showToast(ready.msg ?? "Check the payment details");
      return;
    }
    openModal("payment");
  };

  const confirmPayment = (tendered: number | null) => {
    if (tendered != null) {
      reg.patchPay("Cash", { received: String(tendered) });
      const change = tendered - reg.totals.total;
      if (change > 0.005) reg.showToast("Change due " + money(change));
    }
    setLastSale({
      amount: reg.totals.total,
      method: reg.payMethod,
      invoice: reg.invoiceId,
    });
    reg.finalizeSale();
    setModal("sale-complete");
  };

  /* ---------- quick actions ---------- */
  const runQuickAction = (action: QuickActionId) => {
    closeModal();
    switch (action) {
      case "suspend":
        reg.askConfirm({
          title: "Suspend Sale",
          msg: "Park this sale and free the register? You can resume it later.",
          confirmText: "Suspend",
          tone: "warn",
          icon: "pause-circle",
          onConfirm: () => {
            reg.holdBill();
            reg.showToast("Sale suspended");
          },
        });
        break;
      case "resume":
        openModal("resume");
        break;
      case "hold":
        reg.holdBill();
        break;
      case "new-sale":
        reg.newSale();
        break;
      case "save-draft":
        openModal("save-draft");
        break;
      case "order-history":
        openModal("recent-tx");
        break;
      case "refund":
        openModal("refund");
        break;
      case "discount":
        openModal("discount");
        break;
      case "coupon":
        openModal("coupon");
        break;
      case "cancel-order":
        reg.askConfirm({
          title: "Cancel Order",
          msg: "Discard the current order? All items will be removed.",
          confirmText: "Cancel Order",
          danger: true,
          icon: "x-octagon",
          onConfirm: () => {
            reg.clearCart();
            reg.showToast("Order cancelled");
          },
        });
        break;
      case "checkin":
        reg.showToast("Member checked in ✓");
        break;
      case "register":
        reg.showToast("Opening registration form");
        break;
    }
  };

  /* ---------- scanning ---------- */
  /* Simulated bench scanner: pick a random in-stock product. */
  const scanBarcode = () => {
    const pool = reg.products.filter((p) => p.stock > 0);
    const p = pool[Math.floor(Math.random() * pool.length)];
    if (!p) {
      reg.sfx("error");
      reg.showToast("Nothing in stock to scan");
      return;
    }
    reg.addToCart(p.id, "scan");
    reg.showToast("Scanned " + p.emoji + " " + p.name);
  };

  /* ---------- exports ---------- */
  const exportTx = (rows: Transaction[]) => {
    if (!rows.length) {
      reg.showToast("Nothing to export");
      return;
    }
    const csv = [
      ["Invoice", "Member", "Items", "Amount", "Method", "Cashier", "Date", "Status"].join(","),
    ]
      .concat(
        rows.map((t) =>
          [t.id, t.name, t.items, t.amt, t.method, t.cashier, t.date, t.status]
            .map(csvCell)
            .join(","),
        ),
      )
      .join("\r\n");
    /* BOM so Excel reads the UTF-8 names correctly. */
    download("pos-transactions.csv", "﻿" + csv, "text/csv;charset=utf-8;");
    reg.showToast(rows.length + " transactions exported");
  };

  const downloadReceipt = () => {
    if (!reg.cart.length) {
      reg.showToast("Cart is empty — nothing to download");
      return;
    }
    const t = reg.totals;
    const lines = [
      "Dreams GYM — Austin HQ",
      "EIN 47-1234567",
      "",
      "Invoice : " + reg.invoiceId,
      "Cashier : " + CASHIER,
      "Member  : " + reg.customer.name,
      "Payment : " + reg.payMethod,
      "",
    ];
    reg.cart.forEach((i) =>
      lines.push(i.qty + " x " + i.name + "  " + money(i.price * i.qty)),
    );
    lines.push(
      "",
      "Subtotal : " + money(t.sub),
      "Discount : -" + money(t.disc),
      // Label kept verbatim from the template, which prints 18% while
      // computing TAX_RATE. Changing it is a content decision, not a port.
      "Sales Tax 18%  : " + money(t.tax),
      "Total    : " + money(t.total),
      "",
      "Thank you for training with us!",
    );
    download(
      "receipt-" + reg.invoiceId.replace("#", "") + ".txt",
      lines.join("\r\n"),
      "text/plain;charset=utf-8;",
    );
    reg.showToast("Receipt downloaded");
  };

  const applyDiscountFromModal = (type: DiscountType, value: string) => {
    reg.setDiscountType(type);
    reg.setDiscountValue(value);
    reg.showToast("Discount applied");
  };

  const viewInvoice = (id: string) =>
    setInvoiceTx(reg.transactions.find((t) => t.id === id) ?? null);

  const reprint = (id: string) => {
    viewInvoice(id);
    reg.showToast("Reprinting " + id + " — use Print in the invoice");
  };

  const editingItem = useMemo(
    () => (editId == null ? undefined : reg.cart.find((c) => c.id === editId)),
    [editId, reg.cart],
  );

  return (
    <>
      <PosHeaderBar
        invoiceId={reg.invoiceId}
        itemCount={reg.count}
        total={reg.totals.total}
        syncStatus={reg.sync.status}
        syncPending={reg.sync.pendingCount}
        muted={reg.muted}
        onToggleSound={toggleSound}
        onToggleCalc={toggleCalc}
        onOpenModal={openModal}
      />

      <main className="flex-1 p-6 pos-main">
        <div className="section active-section">
          {/* Page header */}
          <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
            <div>
              <h2 className="text-xl font-black c-text">Point of Sale</h2>
              <p className="text-sm mt-0.5 t-muted">
                Create sales · Process payments · Manage cart
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-active text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Register Open
              </span>
              <button
                type="button"
                className="btn-gold ripple flex items-center gap-2 px-3.5 py-2 text-sm"
                onClick={(e) => {
                  spawnRipple(e);
                  reg.newSale();
                }}
              >
                <Plus className="ic-14" aria-hidden="true" />
                New Sale
              </button>
              <button
                type="button"
                className="btn-ghost ripple flex items-center gap-2 px-3.5 py-2 text-sm"
                onClick={(e) => {
                  spawnRipple(e);
                  reg.holdBill();
                }}
              >
                <Pause className="ic-14" aria-hidden="true" />
                Hold
              </button>
              <button
                type="button"
                className="btn-ghost ripple flex items-center gap-2 px-3.5 py-2 text-sm"
                onClick={(e) => {
                  spawnRipple(e);
                  openModal("resume");
                }}
              >
                <RotateCcw className="ic-14" aria-hidden="true" />
                Resume
              </button>
              <button
                type="button"
                className="btn-ghost ripple flex items-center gap-2 px-3.5 py-2 text-sm"
                onClick={(e) => {
                  spawnRipple(e);
                  openModal("quick-actions");
                }}
              >
                <Zap className="ic-14" aria-hidden="true" />
                Actions
              </button>
            </div>
          </div>

          <PosSummary />
          <PosPlanShortcuts onAdd={reg.addToCart} onAddNamed={reg.addNamed} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT: products */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <PosMemberCard onProfile={() => openModal("member")} />

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 ic-14 t-dim"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    className="fp-input pl-9 py-2.5 text-sm"
                    placeholder="Search products or scan barcode…"
                    value={reg.search}
                    onChange={(e) => reg.setSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-ghost ripple flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
                  onClick={(e) => {
                    spawnRipple(e);
                    openModal("quick-search");
                  }}
                >
                  <Search className="ic-14" aria-hidden="true" />
                  Quick Find
                </button>
                <button
                  type="button"
                  className="btn-ghost ripple flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
                  onClick={(e) => {
                    spawnRipple(e);
                    scanBarcode();
                  }}
                >
                  <ScanBarcode className="ic-14" aria-hidden="true" />
                  Scan
                </button>
                <button
                  type="button"
                  className="btn-ghost ripple flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
                  title="Scan with the device camera"
                  onClick={(e) => {
                    spawnRipple(e);
                    openModal("camera");
                  }}
                >
                  <Camera className="ic-14" aria-hidden="true" />
                  Camera
                </button>
                <button
                  type="button"
                  className="btn-ghost ripple flex items-center gap-2 px-4 py-2.5 text-sm shrink-0"
                  onClick={(e) => {
                    spawnRipple(e);
                    openModal("quick-add");
                  }}
                >
                  <Plus className="ic-14" aria-hidden="true" />
                  Custom
                </button>
              </div>

              <HScroll
                label="Product categories"
                role="tablist"
                trackClassName="gap-2 pb-1"
              >
                {CATEGORY_CHIPS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={reg.category === c.value ? "cat-btn active" : "cat-btn"}
                    role="tab"
                    aria-selected={reg.category === c.value}
                    onClick={() => reg.setCategory(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </HScroll>

              <PosProductGrid
                products={reg.visibleProducts}
                cart={reg.cart}
                onAdd={reg.addToCart}
              />

              <PosSuggestions
                cart={reg.cart}
                products={reg.products}
                onAdd={reg.addToCart}
              />
            </div>

            {/* RIGHT: current order */}
            <div className="lg:col-span-4">
              <PosOrderPanel
                reg={reg}
                onOpenModal={openModal}
                onEditItem={setEditId}
                onComplete={completeSale}
              />
            </div>
          </div>
        </div>
      </main>

      <PosCalculator
        open={calcOpen}
        minimized={calcMin}
        onToggleMin={() => setCalcMin((m) => !m)}
        onClose={() => setCalcOpen(false)}
      />

      {/* FABs */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-[1090]">
        <button
          type="button"
          className="fab fab-receipt"
          title="Receipt Preview"
          aria-label="Receipt preview"
          onClick={() => openModal("receipt")}
        >
          <Receipt className="ic-20" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="fab fab-calc gold-glow"
          title="Calculator"
          aria-label="Calculator"
          onClick={toggleCalc}
        >
          <CalculatorIcon className="ic-22" aria-hidden="true" />
        </button>
      </div>

      {/* ---------- modals ---------- */}
      <ReceiptModal
        open={modal === "receipt"}
        onClose={closeModal}
        cart={reg.cart}
        totals={reg.totals}
        invoiceId={reg.invoiceId}
        memberName={reg.customer.name}
        payMethod={reg.payMethod}
        onDownload={downloadReceipt}
      />
      <SaleCompleteModal
        open={modal === "sale-complete"}
        onClose={closeModal}
        amount={lastSale.amount}
        method={lastSale.method}
        invoiceId={lastSale.invoice}
      />
      <QuickAddModal
        key={`quick-add-${modal === "quick-add"}`}
        open={modal === "quick-add"}
        onClose={closeModal}
        onAdd={(name, price) => {
          reg.addCustomItem(name, price);
          reg.showToast(name + " added");
        }}
      />
      <EditItemModal
        key={`edit-${editId ?? "none"}`}
        open={editId != null}
        item={editingItem}
        onClose={() => setEditId(null)}
        onSave={(id, name, price, qty) => {
          reg.saveEdit(id, name, price, qty);
          reg.showToast("Item updated");
        }}
        onInvalid={() => reg.showToast("Check the item details")}
      />
      <ConfirmModal
        opts={reg.confirmOpts}
        onConfirm={reg.runConfirm}
        onClose={reg.closeConfirm}
      />
      <PaymentModal
        key={`payment-${modal === "payment"}`}
        open={modal === "payment"}
        onClose={closeModal}
        totals={reg.totals}
        payMethod={reg.payMethod}
        payLabel={reg.payLabel}
        onConfirm={confirmPayment}
        onError={(msg) => {
          reg.sfx("error");
          reg.showToast(msg);
        }}
      />
      <DiscountModal
        key={`discount-${modal === "discount"}`}
        open={modal === "discount"}
        onClose={closeModal}
        onApply={applyDiscountFromModal}
      />
      <CouponModal
        key={`coupon-${modal === "coupon"}`}
        open={modal === "coupon"}
        onClose={closeModal}
        onApply={(code) => {
          reg.setDiscountType("coupon");
          reg.setDiscountValue(code);
          reg.showToast("Coupon " + code + " applied — 20% off");
        }}
      />
      <CustomerPickModal
        key={`customer-${modal === "customer"}`}
        open={modal === "customer"}
        onClose={closeModal}
        onPick={reg.pickCustomer}
        selectedName={reg.customer.name}
      />
      <CustomerPickModal
        key={`member-${modal === "member"}`}
        open={modal === "member"}
        onClose={closeModal}
        onPick={reg.pickCustomer}
        selectedName={reg.customer.name}
        membersOnly
      />
      <ResumeModal
        open={modal === "resume"}
        onClose={closeModal}
        heldOrders={reg.heldOrders}
        onResume={reg.resumeOrder}
      />
      <RefundModal
        key={`refund-${modal === "refund"}`}
        open={modal === "refund"}
        onClose={closeModal}
        transactions={reg.transactions}
        onPick={(tx) => {
          closeModal();
          setRefundTx(tx);
        }}
      />
      <RefundProcessModal
        key={`refund-process-${refundTx?.id ?? "none"}`}
        tx={refundTx}
        onClose={() => setRefundTx(null)}
        onStep={(delta) => reg.sfx(delta > 0 ? "qty-up" : "qty-down")}
        onError={(msg) => {
          reg.sfx("error");
          reg.showToast(msg);
        }}
        onProcess={(tx, qty, opts) => {
          reg.askConfirm({
            title: "Refund " + tx.id,
            msg:
              "Refund " +
              // Same figure the modal's own totals show — rfTotals applies the
              // rates actually charged on that sale, not a flat tax add-on.
              money(rfTotals(tx, qty).total) +
              " to " +
              tx.name +
              " via " +
              opts.to +
              "?",
            confirmText: "Refund",
            danger: true,
            icon: "undo-2",
            onConfirm: () => {
              reg.processRefund(tx, qty, opts);
              setRefundTx(null);
            },
          });
        }}
      />
      <SaveDraftModal
        key={`save-draft-${modal === "save-draft"}`}
        open={modal === "save-draft"}
        onClose={closeModal}
        onSave={reg.saveDraft}
      />
      <QuickSearchModal
        key={`quick-search-${modal === "quick-search"}`}
        open={modal === "quick-search"}
        onClose={closeModal}
        products={reg.products}
        onAdd={reg.addToCart}
      />
      <SyncModal open={modal === "sync"} onClose={closeModal} sync={reg.sync} />
      <CameraModal
        key={`camera-${modal === "camera"}`}
        open={modal === "camera"}
        onClose={closeModal}
        onAdd={(id) => reg.addToCart(id, "scan")}
        onError={() => reg.sfx("error")}
        onToast={reg.showToast}
      />
      <QuickActionsModal
        open={modal === "quick-actions"}
        onClose={closeModal}
        onRun={runQuickAction}
      />
      <RecentTxModal
        key={`recent-tx-${modal === "recent-tx"}`}
        open={modal === "recent-tx"}
        onClose={closeModal}
        transactions={reg.transactions}
        onView={viewInvoice}
        onReprint={reprint}
        onExport={exportTx}
      />
      <InvoiceModal
        tx={invoiceTx}
        onClose={() => setInvoiceTx(null)}
        onToast={reg.showToast}
      />

      <Toast message={reg.toastMessage} visible={reg.toastVisible} />
    </>
  );
};

export default Pos;
