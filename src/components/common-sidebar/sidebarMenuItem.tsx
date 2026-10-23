"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LucideIcon from "../common/LucideIcon";
import { all_routes } from "../../routes/all_routes";
import { stripBase } from "../../routes/routeMeta";
import { useAppSelector } from "../../redux/hooks";
import type { LucideIconName } from "../common/lucide-icons";
import type {
  SidebarLeaf,
  SidebarSection,
  SidebarSubmenu,
} from "../../utils/json/sidebarMenu";

const isLeaf = (item: SidebarLeaf | SidebarSubmenu): item is SidebarLeaf =>
  !("children" in item);

const isLeafActive = (item: SidebarLeaf, pathname: string): boolean =>
  (!!item.routeKey && all_routes[item.routeKey] === pathname) ||
  !!item.activeRouteKeys?.some((key) => all_routes[key] === pathname);

const containsActive = (
  item: SidebarLeaf | SidebarSubmenu,
  pathname: string,
): boolean =>
  isLeaf(item)
    ? isLeafActive(item, pathname)
    : item.children.some((child) => containsActive(child, pathname));

function findActiveBranch(
  items: (SidebarLeaf | SidebarSubmenu)[],
  pathname: string,
  prefix = "",
): string {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (isLeaf(item) || !containsActive(item, pathname)) continue;
    const path = prefix ? `${prefix}.${i}` : `${i}`;
    return findActiveBranch(item.children, pathname, path) || path;
  }
  return "";
}

const isOnOpenBranch = (path: string, openPath: string) =>
  openPath === path || openPath.startsWith(`${path}.`);

type ItemProps = {
  item: SidebarLeaf | SidebarSubmenu;
  path: string;
  openPath: string;
  onToggle: (path: string) => void;
  hoverDriven: boolean;
  depth: number;
};

const SidebarMenuItem = ({
  item,
  path,
  openPath,
  onToggle,
  hoverDriven,
  depth,
}: ItemProps) => {
  const pathname = usePathname();

  if (isLeaf(item)) {
    const content = (
      <>
       
        {item.icon && depth === 0 && (
          <LucideIcon name={item.icon as LucideIconName} className="nav-icon" />
        )}
        <span className="nav-label">{item.label}</span>
        {item.badge && (
          <span className={item.badgeClass ?? "nav-badge"}>{item.badge}</span>
        )}
      </>
    );

    if (item.externalUrl) {
      return (
        <a
          href={item.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="nav-item"
        >
          {content}
        </a>
      );
    }

    const active = isLeafActive(item, stripBase(pathname));

    return (
      <Link
        href={item.routeKey ? all_routes[item.routeKey] : "#"}
        className={active ? "nav-item active" : "nav-item"}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  const open = isOnOpenBranch(path, openPath);

  return (
    <>
      <button
        type="button"
        className={open ? "nav-collapse open" : "nav-collapse"}
        aria-expanded={open}
        onClick={() => onToggle(path)}
      >
        {item.icon && depth === 0 && (
          <LucideIcon name={item.icon as LucideIconName} className="nav-icon" />
        )}
        <span className="nav-label">{item.label}</span>
        <LucideIcon name="chevron-right" className="nav-arrow" />
      </button>
      <div className={!hoverDriven && open ? "nav-sub open" : "nav-sub"}>
        {item.children.map((child, i) => (
          <SidebarMenuItem
            key={i}
            item={child}
            path={`${path}.${i}`}
            openPath={openPath}
            onToggle={onToggle}
            hoverDriven={hoverDriven}
            depth={depth + 1}
          />
        ))}
      </div>
    </>
  );
};

const SidebarMenu = ({ sections }: { sections: SidebarSection[] }) => {
  const pathname = usePathname();
  const { sidebarCollapsed, variant } = useAppSelector((state) => state.layout);
  const hoverDriven = sidebarCollapsed || variant === "hoverview";

  const activeBranch = findActiveBranch(
    sections.flatMap((section) => section.items),
    stripBase(pathname),
  );
  const [openPath, setOpenPath] = useState(activeBranch);
  const [trackedBranch, setTrackedBranch] = useState(activeBranch);

  if (activeBranch !== trackedBranch) {
    setTrackedBranch(activeBranch);
    if (activeBranch) setOpenPath(activeBranch);
  }

  const handleToggle = (path: string) =>
    setOpenPath((prev) =>
      isOnOpenBranch(path, prev)
        ? path.split(".").slice(0, -1).join(".")
        : path,
    );

  let index = 0;

  return (
    <>
      {sections.map((section) => (
        <Fragment key={section.title}>
          <div className="nav-group-label">{section.title}</div>
          {section.items.map((item) => (
            <SidebarMenuItem
              key={index}
              item={item}
              path={String(index++)}
              openPath={openPath}
              onToggle={handleToggle}
              hoverDriven={hoverDriven}
              depth={0}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default SidebarMenu;
