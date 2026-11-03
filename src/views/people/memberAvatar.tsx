import type { Member } from "@/domain/member";
import { memberInitials } from "@/domain/member-presentation";
import Image from 'next/image';

// The initials circle from Jodi's mockup: large in the Member 360 header,
// small in the People pane.
const SIZES = {
  small: "size-9 text-[10px]",
  large: "size-12 text-[11px]",
};

export default function MemberAvatar({
  member,
  size = "large",
}: {
  member: Member;
  size?: keyof typeof SIZES;
}) {
  return (
    <div
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border border-(--crm-line) bg-(--crm-canvas) font-(family-name:--crm-font-label) font-bold text-(--crm-text) ${SIZES[size]}`}
    >
      {member.photo ? <Image src={member.photo} alt="" width={size === 'small' ? 36 : 48} height={size === 'small' ? 36 : 48} unoptimized className="size-full rounded-full object-cover" /> : memberInitials(member)}
    </div>
  );
}
