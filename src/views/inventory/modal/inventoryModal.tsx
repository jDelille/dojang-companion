const InventoryModal = () => {
  return (
    <>
      {/* ══════════════ ADD / EDIT ITEM MODAL ══════════════ */}
      <div id="modal-item-form" className="modal-overlay">
        <div className="modal-box glass modal-w-540">
          <div className="flex items-center justify-between mb-5">
            <h3 id="if-title" className="text-base font-black c-text">
              Add Inventory Item
            </h3>
            <button
              type="button"
              className="hbtn"
              data-modal-close=""
              aria-label="Close"
            >
              <i data-lucide="x" className="w-[15px] h-[15px]" />
            </button>
          </div>
          <form id="item-form" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="f-label">Item name</label>
                <input
                  type="text"
                  id="if-name"
                  className="fp-input py-2.5 text-sm"
                  placeholder="e.g. Whey Protein 2 lb"
                  required
                />
              </div>
              <div>
                <label className="f-label">SKU</label>
                <input
                  type="text"
                  id="if-sku"
                  className="fp-input py-2.5 text-sm"
                  placeholder="SKU-000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="f-label">Category</label>
                <select id="if-category" className="fp-input py-2.5 text-sm" />
              </div>
              <div>
                <label className="f-label">Unit price ($)</label>
                <input
                  id="if-price"
                  type="number"
                  min={0}
                  className="fp-input py-2.5 text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="f-label">On hand</label>
                <input
                  id="if-onhand"
                  type="number"
                  min={0}
                  className="fp-input py-2.5 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="f-label">Reorder at</label>
                <input
                  id="if-reorder"
                  type="number"
                  min={0}
                  className="fp-input py-2.5 text-sm"
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                className="btn-ghost flex-1 py-2.5 text-sm"
                data-modal-close=""
              >
                Cancel
              </button>
              <button
                type="submit"
                id="if-submit"
                className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <i data-lucide="check" className="w-[13px] h-[13px]" />
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* ══════════════ VIEW ITEM MODAL ══════════════ */}
      <div id="modal-view" className="modal-overlay">
        <div className="modal-box glass modal-w-460">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black c-text">Item Details</h3>
            <button
              type="button"
              className="hbtn"
              data-modal-close=""
              aria-label="Close"
            >
              <i data-lucide="x" className="w-[15px] h-[15px]" />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card2">
            <div id="iv-ic" className="inv-ic size-px-44">
              <i data-lucide="package" className="size-px-24 c-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <div id="iv-name" className="text-sm font-black c-text truncate">
                Item
              </div>
              <div
                id="iv-category"
                className="text-[11px] c-gold font-semibold uppercase tracking-wider"
              >
                Category
              </div>
            </div>
            <span id="iv-status" className="badge badge-present">
              Healthy
            </span>
          </div>
          <div className="mb-5">
            <div className="detail-row">
              <span className="k">SKU</span>
              <span id="iv-sku" className="v font-mono">
                —
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Unit price</span>
              <span id="iv-price" className="v gt">
                —
              </span>
            </div>
            <div className="detail-row">
              <span className="k">On hand</span>
              <span id="iv-onhand" className="v">
                —
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Reorder at</span>
              <span id="iv-reorder" className="v">
                —
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Incoming</span>
              <span id="iv-incoming" className="v">
                —
              </span>
            </div>
            <div className="detail-row">
              <span className="k">Stock value</span>
              <span id="iv-value" className="v">
                —
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              data-action="v-transfer"
            >
              <i data-lucide="truck" className="w-[13px] h-[13px]" />
              Transfer
            </button>
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              data-action="v-adjust"
            >
              <i
                data-lucide="sliders-horizontal"
                className="w-[13px] h-[13px]"
              />
              Adjust
            </button>
            <button
              type="button"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              data-action="v-edit"
            >
              <i data-lucide="pencil" className="w-[13px] h-[13px]" />
              Edit
            </button>
          </div>
        </div>
      </div>
      {/* ══════════════ STOCK ADJUSTMENT MODAL ══════════════ */}
      <div id="modal-adjust" className="modal-overlay">
        <div className="modal-box glass modal-w-380">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black c-text">Stock Adjustment</h3>
            <button
              type="button"
              className="hbtn"
              data-modal-close=""
              aria-label="Close"
            >
              <i data-lucide="x" className="w-[15px] h-[15px]" />
            </button>
          </div>
          <div id="adj-context" className="ctx-box mb-3">
            Item
          </div>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="c-dim">Current on hand</span>
            <span className="font-bold c-text">
              <span id="adj-current">0</span> units
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="f-label">Adjustment</label>
              <select id="adj-type" className="fp-input py-2.5 text-sm" />
            </div>
            <div>
              <label className="f-label">Quantity</label>
              <input
                id="adj-qty"
                type="number"
                min={0}
                className="fp-input py-2.5 text-sm"
                placeholder="0"
              />
            </div>
          </div>
          <label className="f-label">Reason</label>
          <select id="adj-reason" className="fp-input py-2.5 text-sm mb-1" />
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              data-modal-close=""
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-gold flex-1 py-2.5 text-sm"
              data-action="confirm-adjust"
            >
              Apply Adjustment
            </button>
          </div>
        </div>
      </div>
      {/* ══════════════ TRANSFER STOCK MODAL ══════════════ */}
      <div id="modal-transfer" className="modal-overlay">
        <div className="modal-box glass modal-w-460">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black c-text">Transfer Stock</h3>
            <button
              type="button"
              className="hbtn"
              data-modal-close=""
              aria-label="Close"
            >
              <i data-lucide="x" className="w-[15px] h-[15px]" />
            </button>
          </div>
          <div id="tr-context" className="ctx-box mb-4">
            Item
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">From</label>
              <input
                type="text"
                className="fp-input py-2.5 text-sm"
                defaultValue="Austin HQ"
                readOnly
              />
            </div>
            <div>
              <label className="f-label">To location</label>
              <select id="tr-to" className="fp-input py-2.5 text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="f-label">Quantity to transfer</label>
            <input
              id="tr-qty"
              type="number"
              min={1}
              className="fp-input py-2.5 text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              data-modal-close=""
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              data-action="confirm-transfer"
            >
              <i data-lucide="truck" className="w-[13px] h-[13px]" />
              Transfer
            </button>
          </div>
        </div>
      </div>
      {/* ══════════════ IMPORT MODAL ══════════════ */}
      <div id="modal-import" className="modal-overlay">
        <div className="modal-box glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black c-text">Import Inventory</h3>
            <button
              type="button"
              className="hbtn"
              data-modal-close=""
              aria-label="Close"
            >
              <i data-lucide="x" className="w-[15px] h-[15px]" />
            </button>
          </div>
          <label className="dropzone block mb-4">
            <i data-lucide="upload-cloud" />
            <div className="text-sm font-semibold c-text">
              Drop a CSV file here or click to browse
            </div>
            <div className="text-xs mt-1 c-dim">
              Columns: name, sku, category, price, onHand, reorder
            </div>
            <input type="file" accept=".csv" className="hidden" />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              data-modal-close=""
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-gold flex-1 py-2.5 text-sm"
              data-action="confirm-import"
            >
              Import Inventory
            </button>
          </div>
        </div>
      </div>
      {/* ══════════════ MOVEMENTS LOG MODAL ══════════════ */}
      <div id="modal-movements" className="modal-overlay">
        <div className="modal-box glass modal-w-540">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black c-text">Stock Movements</h3>
            <button
              type="button"
              className="hbtn"
              data-modal-close=""
              aria-label="Close"
            >
              <i data-lucide="x" className="w-[15px] h-[15px]" />
            </button>
          </div>
          <div id="mvlog-list" className="mv-scroll space-y-3 mb-5" />
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              data-modal-close=""
            >
              Close
            </button>
            <button
              type="button"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              data-action="export"
            >
              <i data-lucide="download" className="w-[13px] h-[13px]" />
              Export Log
            </button>
          </div>
        </div>
      </div>
      {/* ══════════════ DELETE MODAL ══════════════ */}
      <div id="modal-delete" className="modal-overlay">
        <div className="modal-box glass modal-w-380">
          <div className="confirm-ic danger">
            <i data-lucide="trash-2" className="w-6 h-6 c-red" />
          </div>
          <h3 className="text-base font-black c-text text-center mb-1">
            Delete Item?
          </h3>
          <p className="text-sm text-center mb-5 c-dim">
            Permanently remove{" "}
            <span id="del-name" className="font-semibold c-text">
              this item
            </span>{" "}
            from inventory? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-ghost flex-1 py-2.5 text-sm"
              data-modal-close=""
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger flex-1 py-2.5 text-sm"
              data-action="confirm-delete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryModal;
