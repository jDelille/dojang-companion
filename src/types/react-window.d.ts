/*
   Minimal ambient types for `react-window`, which ships no bundled types and
   has no @types package installed. Only FixedSizeList is used, in
   components/data-table/index.tsx.
*/

declare module "react-window" {
  import { Component } from "react";
  import type { ComponentType, CSSProperties, ReactNode, Ref } from "react";

  export type ListChildComponentProps<T = unknown> = {
    index: number;
    style: CSSProperties;
    data: T;
    isScrolling?: boolean;
  };

  export type FixedSizeListProps<T = unknown> = {
    children: ComponentType<ListChildComponentProps<T>>;
    height: number | string;
    width: number | string;
    itemCount: number;
    itemSize: number;
    itemData?: T;
    itemKey?: (index: number, data: T) => string | number;
    className?: string;
    style?: CSSProperties;
    overscanCount?: number;
    layout?: "vertical" | "horizontal";
    innerRef?: Ref<HTMLElement>;
    outerRef?: Ref<HTMLElement>;
    innerElementType?: ComponentType<{ children?: ReactNode; style?: CSSProperties }> | string;
    outerElementType?: ComponentType<{ children?: ReactNode; style?: CSSProperties }> | string;
    onScroll?: (props: {
      scrollDirection: "forward" | "backward";
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }) => void;
    onItemsRendered?: (props: {
      overscanStartIndex: number;
      overscanStopIndex: number;
      visibleStartIndex: number;
      visibleStopIndex: number;
    }) => void;
  };

  export class FixedSizeList<T = unknown> extends Component<FixedSizeListProps<T>> {
    scrollTo(offset: number): void;
    scrollToItem(index: number, align?: "auto" | "smart" | "center" | "end" | "start"): void;
  }
}
