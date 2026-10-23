import type { ComponentProps } from "react";
import type { LucideIcon as LucideIconComponent } from "lucide-react";
import { lucideIcons, type LucideIconName } from "./lucide-icons";

type LucideIconProps = ComponentProps<LucideIconComponent> & {
  name: LucideIconName;
};

const LucideIcon = ({ name, ...props }: LucideIconProps) => {
  const Icon = lucideIcons[name];

  if (!Icon) return null;

  return <Icon aria-hidden="true" {...props} />;
};

export default LucideIcon;
