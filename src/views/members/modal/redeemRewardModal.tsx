import { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { LoyaltyMember, Reward } from "../../../types/rewards";
import { number } from "../../../utils/formatUtils";
import { CATEGORY_ICON } from "../rewardIcons";

/*
   Redeem Reward — ported from #modal-redeem in tailwind/src/rewards.html and
   openRedeem()/updateBalance()/confirmRedeem() in assets/js/rewards.js.

   The balance line and the confirm button both react to the selected member:
   too few points disables the button, matching updateBalance().
*/

type RedeemRewardModalProps = {
  reward: Reward | null;
  members: LoyaltyMember[];
  onClose: () => void;
  onRedeem: (reward: Reward, member: LoyaltyMember) => void;
};

const RedeemRewardModal = ({
  reward,
  members,
  onClose,
  onRedeem,
}: RedeemRewardModalProps) => {
  const [name, setName] = useState(members[0]?.name ?? "");

  const member = members.find((item) => item.name === name);
  const affordable = !!reward && !!member && member.pts >= reward.cost;
  const Icon = reward ? CATEGORY_ICON[reward.cat] : CATEGORY_ICON.Membership;

  const options = members.map((item) => ({
    value: item.name,
    label: `${item.name} (${number(item.pts)} pts)`,
  }));

  return (
    <Modal
      open={reward !== null}
      onClose={onClose}
      title="Redeem Reward"
      boxClassName="glass"
      titleClassName="text-base"
    >
      <div className="gold-border-card p-4 mb-4 flex items-center gap-3">
        <div className="tier-ic ic-gold rd-ic-lg">
          <Icon className="w-[20px] h-[20px] c-gold shrink-0" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-black c-text">{reward?.name ?? "—"}</div>
          <div className="text-[11px] c-dim">{reward?.desc ?? "—"}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black gt leading-none">
            {number(reward?.cost ?? 0)}
          </div>
          <div className="text-[10px] c-dim2 font-bold">POINTS</div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-bold mb-1.5 c-text2">Select member</label>
        <CommonSelect
          fieldClassName="py-2.5 text-sm"
          ariaLabel="Select member"
          options={options}
          value={name}
          onChange={(option) => setName(option?.value ?? members[0]?.name ?? "")}
        />
        <div className="text-[11px] mt-1.5 c-dim">
          Balance:{" "}
          <b className={affordable ? "c-green" : "c-red"}>
            {number(member?.pts ?? 0)} pts
          </b>
          {affordable && reward
            ? ` · ${number((member?.pts ?? 0) - reward.cost)} after`
            : " · not enough points"}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          disabled={!affordable}
          onClick={() => reward && member && onRedeem(reward, member)}
        >
          <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Confirm Redemption
        </button>
      </div>
    </Modal>
  );
};

export default RedeemRewardModal;
