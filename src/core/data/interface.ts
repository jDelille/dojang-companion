import type { ReactNode } from "react";

/*
   A table row. The table is generic over arbitrary page data, so values are
   deliberately `any` — each column's `render` narrows its own value. This
   mirrors the antd `ColumnsType` shape these types replaced, keeping existing
   call sites working after the move to PrimeReact.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
export type DatatableRecord = Record<string, any>;

/** Column definition — the subset of antd's `ColumnType` the app actually used. */
export interface DatatableColumn {
  title?: ReactNode;
  dataIndex?: string;
  key?: string | number;
  render?: (value: any, record: DatatableRecord, index: number) => ReactNode;
  /** Fixed column width, e.g. "120px". */
  width?: string | number;
  sorter?: unknown;
  className?: string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type DatatableColumns = DatatableColumn[];

export interface DatatableProps {
  columns: DatatableColumns;
  dataSource: DatatableRecord[];
  Selection?: boolean;
  searchText?: string;
  isLoading?: boolean;
  /** dataIndex keys to build "Filter" checkbox options from (unique values per column) */
  filterColumns?: string[];
  /** dataIndex key used for A-Z / Z-A sorting */
  sortColumn?: string;
  /** dataIndex key (date value) used for Newest / Oldest sorting */
  dateColumn?: string;
  /** Called when the user clicks Refresh; falls back to resetting internal filter/sort state */
  onRefresh?: () => void;
  /** Left side of the toolbar row (e.g. search input, date range picker) */
  toolbarLeft?: ReactNode;
}
