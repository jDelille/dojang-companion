"use client";

import React, { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getRouteMeta } from "../../routes/routeMeta";
import { all_routes } from "../../routes/all_routes";

export type BreadcrumbItem = {
  label: string;
  /** Omit to render as plain text. The last item is never linked. */
  href?: string;
};

export type BreadcrumbSlots = {
  root: string;
  list: string;
  item: string;
  link: string;
  separator: string;
  current: string;
  ellipsis: string;
};

/*
   Default look, built from the classes the stylesheet actually defines
   (.crumb-brand / .crumb-sep / .crumb-label). Every slot is overridable via
   the `classes` prop so another project can restyle without forking.
*/
const defaultClasses: BreadcrumbSlots = {
  root: "flex items-center gap-2 text-sm",
  list: "flex items-center gap-2 m-0 p-0 list-none",
  item: "flex items-center gap-2",
  link: "font-bold crumb-brand hover:underline",
  separator: "crumb-sep shrink-0",
  current: "font-medium crumb-label",
  ellipsis: "font-medium crumb-label select-none",
};

export type BreadcrumbProps = {
  /** Omit to derive the trail from the current route. */
  items?: BreadcrumbItem[];
  /** Leading crumb. Pass `null` to drop it entirely. */
  home?: BreadcrumbItem | null;
  separator?: ReactNode;
  classes?: Partial<BreadcrumbSlots>;
  /** Collapse the middle of longer trails to this many crumbs. */
  maxItems?: number;
  className?: string;
};

const ELLIPSIS = "…";

/*
   Keeps the first and last crumbs and elides the middle, so a deep trail stays
   on one line without hiding where you are or how to get back to the top.
*/
function collapse(items: BreadcrumbItem[], maxItems?: number): BreadcrumbItem[] {
  if (!maxItems || maxItems < 2 || items.length <= maxItems) return items;
  const tail = items.slice(items.length - (maxItems - 1));
  return [items[0], { label: ELLIPSIS }, ...tail];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  home = { label: "Home", href: all_routes.dashboard },
  separator,
  classes,
  maxItems,
  className,
}) => {
  const pathname = usePathname();

  /*
     Derived crumbs are labels only: the sidebar groups them ("Members",
     "Base UI") are headings, not pages, so linking them would 404.
  */
  const derived = getRouteMeta(pathname).trail.map((label) => ({ label }));
  const trail = collapse(items ?? derived, maxItems);

  const slots = { ...defaultClasses, ...classes };
  const sep = separator ?? (
    <ChevronRight className={slots.separator} aria-hidden="true" />
  );

  const crumbs = home ? [home, ...trail] : trail;
  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={className ? `${slots.root} ${className}` : slots.root}
    >
      <ol className={slots.list}>
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1;
          const isEllipsis = item.label === ELLIPSIS;

          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className={slots.item} aria-current={isLast ? "page" : undefined}>
                {isEllipsis ? (
                  <span className={slots.ellipsis}>{ELLIPSIS}</span>
                ) : isLast || !item.href ? (
                  <span className={isLast ? slots.current : slots.link}>
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className={slots.link}>
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && sep}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default React.memo(Breadcrumb);
