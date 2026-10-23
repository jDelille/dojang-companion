import { Edit2, Gift } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { Reward } from "../../../types/rewards";
import { CATEGORY_THEME, UNLIMITED_STOCK } from "../../../utils/json/rewardsData";
import { number } from "../../../utils/formatUtils";
import { CATEGORY_ICON } from "../rewardIcons";

/*
   Reward Details — ported from #modal-view in tailwind/src/rewards.html and
   openView() in assets/js/rewards.js.
*/

type RewardViewModalProps = {
  reward: Reward | null;
  onClose: () => void;
  onEdit: (reward: Reward) => void;
  onRedeem: (reward: Reward) => void;
};

const RewardViewModal = ({ reward, onClose, onEdit, onRedeem }: RewardViewModalProps) => {
  const theme = reward ? CATEGORY_THEME[reward.cat] : CATEGORY_THEME.Membership;
  const Icon = reward ? CATEGORY_ICON[reward.cat] : CATEGORY_ICON.Membership;

  return (
    <Modal
      open={reward !== null}
      onClose={onClose}
      title="Reward Details"
      boxClassName="glass modal-w-420"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className={`reward-hero rounded-2xl mb-4 ${theme.hero}`}>
        <Icon className="w-8 h-8 hero-ink shrink-0" aria-hidden="true" />
      </div>
      <div className="text-lg font-black c-text">{reward?.name ?? "—"}</div>
      <div className="text-[12px] c-dim mb-3">{reward?.desc ?? "—"}</div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="amount-box block! text-center">
          <div className="text-lg font-black gt">{number(reward?.cost ?? 0)}</div>
          <div className="text-[10px] c-dim2">Points</div>
        </div>
        <div className="amount-box block! text-center">
          <div className="text-sm font-black c-text">{reward?.cat ?? "—"}</div>
          <div className="text-[10px] c-dim2">Category</div>
        </div>
        <div className="amount-box block! text-center">
          <div className="text-sm font-black c-text">
            {/* Anything above the cap reads as unlimited. */}
            {reward ? (reward.stock > UNLIMITED_STOCK ? "∞" : reward.stock) : "—"}
          </div>
          <div className="text-[10px] c-dim2">Stock</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => reward && onEdit(reward)}
        >
          <Edit2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => reward && onRedeem(reward)}
        >
          <Gift className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Redeem
        </button>
      </div>
    </Modal>
  );
};

export default RewardViewModal;
