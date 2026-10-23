// index.tsx
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { DatatableProps } from "../../core/data/interface";
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { FixedSizeList as List } from 'react-window';
import {
  BADGE_COUNT,
  BORDER,
  BTN_GHOST,
  BTN_PRIMARY,
  CHECKBOX_BOX,
  CHECK_INPUT,
  ICON_BTN,
  MENU_ITEM,
  MENU_ITEM_ACTIVE,
  MENU_LABEL,
  MENU_PANEL,
  RADIUS,
  SKELETON,
  SURFACE,
  TABLE_BODY_CELL,
  TABLE_BODY_ROW,
  TABLE_HEADER_CELL,
  TABLE_ROOT,
  TABLE_TABLE,
  TABLE_WRAPPER,
} from "../common/tokens";

type TableRecord = Record<string, unknown>;

const getDataIndex = (column: DatatableProps["columns"][number]): string | undefined =>
  column.dataIndex;

const dataTablePt = {
  root: { className: TABLE_ROOT },
  wrapper: { className: TABLE_WRAPPER },
  table: { className: TABLE_TABLE },
  headerRow: { className: "" },
  bodyRow: { className: TABLE_BODY_ROW },
  emptyMessage: { className: "text-center" },
};

const columnPt = {
  headerCell: { className: TABLE_HEADER_CELL },
  bodyCell: { className: TABLE_BODY_CELL },
  headerCheckbox: { box: { className: CHECKBOX_BOX } },
  rowCheckbox: { box: { className: CHECKBOX_BOX } },
};

type SortMode = "az" | "za" | "newest" | "oldest";

const getColumnTitle = (columns: DatatableProps["columns"], dataIndex: string) => {
  const column = columns.find((col) => (col as { dataIndex?: string }).dataIndex === dataIndex);
  const title = column?.title;
  return typeof title === "string" ? title : dataIndex;
};

const getColumnKey = (column: DatatableProps["columns"][number], index: number) => {
  const withKeys = column as { key?: React.Key; dataIndex?: string };
  return String(withKeys.key ?? withKeys.dataIndex ?? index);
};

/**
 * Loading placeholder for the table body only. Mirrors the live column count so
 * the surrounding layout keeps its width and does not jump when rows arrive.
 * Colours come from the shared tokens, which resolve against the active theme.
 */
const TableBodySkeleton: React.FC<{ columnCount: number; rowCount: number }> = ({
  columnCount,
  rowCount,
}) => {
  const columns = Math.max(columnCount, 1);
  return (
    <div className={`border ${BORDER} ${RADIUS} overflow-hidden mb-4`}>
      <div className={`flex gap-4 p-3 ${SURFACE}`}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className={`h-4 flex-1 ${SKELETON}`} />
        ))}
      </div>
      {Array.from({ length: rowCount }).map((_, row) => (
        <div key={row} className={`flex gap-4 p-3 border-t ${BORDER}`}>
          {Array.from({ length: columns }).map((_, col) => (
            <div key={col} className={`h-4 flex-1 ${SKELETON}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

const Datatable: React.FC<DatatableProps> = ({
  columns,
  dataSource,
  Selection,
  searchText,
  isLoading = false,
  filterColumns = [],
  sortColumn,
  dateColumn,
  onRefresh,
  toolbarLeft,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<TableRecord[]>([]);
  const Selections = Boolean(Selection);

  const listHeight = 600;
  const rowHeight = 60;

  const debouncedSearchText = useDebouncedValue(searchText, 300);

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [draftFilters, setDraftFilters] = useState<Record<string, string[]>>({});
  const [sortMode, setSortMode] = useState<SortMode | null>(null);
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const busy = isLoading || refreshing;

  const toggleColumnVisibility = useCallback((key: string) => {
    setHiddenColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column, index) => !hiddenColumnKeys.includes(getColumnKey(column, index))),
    [columns, hiddenColumnKeys]
  );
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    filterColumns.forEach((key) => {
      const values = new Set<string>();
      dataSource.forEach((record) => {
        const value = record[key];
        if (value !== undefined && value !== null && value !== "") {
          values.add(String(value));
        }
      });
      options[key] = Array.from(values).sort();
    });
    return options;
  }, [filterColumns, dataSource]);

  const openFilterDropdown = useCallback(() => {
    setDraftFilters(activeFilters);
  }, [activeFilters]);

  const toggleDraftFilter = useCallback((key: string, value: string) => {
    setDraftFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const applyFilters = useCallback(() => {
    setActiveFilters(draftFilters);
  }, [draftFilters]);

  const clearFilters = useCallback(() => {
    setDraftFilters({});
    setActiveFilters({});
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(activeFilters).reduce((sum, values) => sum + values.length, 0),
    [activeFilters]
  );

  const MIN_REFRESH_MS = 400;
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleRefresh = useCallback(async () => {
    setActiveFilters({});
    setDraftFilters({});
    setSortMode(null);
    setHiddenColumnKeys([]);
    setRefreshing(true);
    try {
      await Promise.all([
        Promise.resolve(onRefresh?.()),
        new Promise((resolve) => setTimeout(resolve, MIN_REFRESH_MS)),
      ]);
    } finally {
      if (isMounted.current) setRefreshing(false);
    }
  }, [onRefresh]);

  const filteredDataSource = useMemo(() => {
    let result = dataSource;

    if (debouncedSearchText) {
      result = result.filter((record) =>
        Object.values(record).some((field) =>
          String(field).toLowerCase().includes(debouncedSearchText.toLowerCase())
        )
      );
    }

    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        result = result.filter((record) => values.includes(String(record[key])));
      }
    });

    return result;
  }, [debouncedSearchText, dataSource, activeFilters]);

  const sortedDataSource = useMemo(() => {
    if (!sortMode) return filteredDataSource;

    const sorted = [...filteredDataSource];
    if ((sortMode === "az" || sortMode === "za") && sortColumn) {
      sorted.sort((a, b) => String(a[sortColumn]).localeCompare(String(b[sortColumn])));
      if (sortMode === "za") sorted.reverse();
    } else if ((sortMode === "newest" || sortMode === "oldest") && dateColumn) {
      sorted.sort((a, b) => new Date(a[dateColumn]).getTime() - new Date(b[dateColumn]).getTime());
      if (sortMode === "newest") sorted.reverse();
    }
    return sorted;
  }, [filteredDataSource, sortMode, sortColumn, dateColumn]);

  const onSelectChange = useCallback((newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  }, []);

  const paginatedData = sortedDataSource;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const record = paginatedData[index];
    if (!record) return null;

    return (
      <div style={style} className="virtual-row flex">
        {Selections && (
          <div style={{ width: '50px', padding: '8px', flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={selectedRowKeys.includes(record.key || index)}
              onChange={(e) => {
                const newKeys = e.target.checked
                  ? [...selectedRowKeys, record.key || index]
                  : selectedRowKeys.filter(key => key !== (record.key || index));
                onSelectChange(newKeys);
              }}
            />
          </div>
        )}
        {visibleColumns.map((column, colIndex) => {
          const dataIndex = getDataIndex(column);
          const value = dataIndex ? record[dataIndex] : undefined;
          return (
            <div key={colIndex} style={{ padding: '8px', flex: 1 }}>
              {column.render
                ? (column.render(value, record, index) as React.ReactNode)
                : value
              }
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">{toolbarLeft}</div>
        <div className="flex items-center gap-2 flex-wrap">
          {filterColumns.length > 0 && (
            <div className="hs-dropdown [--placement:bottom-left] [--auto-close:inside] relative inline-flex">
              <button
                type="button"
                onClick={openFilterDropdown}
                className={`hs-dropdown-toggle ${BTN_GHOST}`}
                aria-haspopup="menu"
                aria-expanded="false"
                aria-label="Filter"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="icon-funnel font-normal" /> Filter
                  {activeFilterCount > 0 && (
                    <span className={BADGE_COUNT}>{activeFilterCount}</span>
                  )}
                </span>
                <i className="icon-chevron-down -ms-1" />
              </button>
              <div
                className={`hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-56 mt-2 z-1 ${MENU_PANEL}`}
                role="menu"
                aria-orientation="vertical"
                tabIndex={-1}
              >
                <div className="p-2 space-y-3 max-h-72 overflow-auto">
                  {filterColumns.map((key) => (
                    <div key={key}>
                      <p className={MENU_LABEL}>{getColumnTitle(columns, key)}</p>
                      <div className="space-y-1">
                        {(filterOptions[key] ?? []).map((value) => (
                          <label
                            key={value}
                            className={MENU_ITEM}
                          >
                            <input
                              type="checkbox"
                              checked={(draftFilters[key] ?? []).includes(value)}
                              onChange={() => toggleDraftFilter(key, value)}
                              className={CHECK_INPUT}
                            />
                            {value}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={`${BTN_GHOST} w-full justify-center`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className={`${BTN_PRIMARY} w-full justify-center`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {(sortColumn || dateColumn) && (
          <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
            <button
              type="button"
              className={`hs-dropdown-toggle ${BTN_GHOST}`}
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="Sort By"
            >
              <span className="inline-flex items-center gap-2">
                <i className="icon-arrow-up-down font-normal" /> Sort By
              </span>
              <i className="icon-chevron-down -ms-1" />
            </button>
            <div
              className={`hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-40 mt-2 z-1 ${MENU_PANEL}`}
              role="menu"
              aria-orientation="vertical"
              tabIndex={-1}
            >
              <div className="p-2 space-y-1">
                {sortColumn && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSortMode("az")}
                      className={`${MENU_ITEM} ${sortMode === "az" ? MENU_ITEM_ACTIVE : ""}`}
                    >
                      A - Z
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortMode("za")}
                      className={`${MENU_ITEM} ${sortMode === "za" ? MENU_ITEM_ACTIVE : ""}`}
                    >
                      Z - A
                    </button>
                  </>
                )}
                {dateColumn && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSortMode("newest")}
                      className={`${MENU_ITEM} ${sortMode === "newest" ? MENU_ITEM_ACTIVE : ""}`}
                    >
                      Newest
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortMode("oldest")}
                      className={`${MENU_ITEM} ${sortMode === "oldest" ? MENU_ITEM_ACTIVE : ""}`}
                    >
                      Oldest
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
          <button
            type="button"
            className={`hs-dropdown-toggle ${ICON_BTN}`}
            aria-haspopup="menu"
            aria-expanded="false"
            aria-label="Columns"
          >
            <i className="ph-duotone ph-columns" />
          </button>
          <div
            className={`hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-48 mt-2 z-1 ${MENU_PANEL}`}
            role="menu"
            aria-orientation="vertical"
            tabIndex={-1}
          >
            <div className="p-2 space-y-1 max-h-72 overflow-auto">
              {columns.map((column, index) => {
                const key = getColumnKey(column, index);
                const title = typeof column.title === "string" ? column.title : key;
                return (
                  <label
                    key={key}
                    className={MENU_ITEM}
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenColumnKeys.includes(key)}
                      onChange={() => toggleColumnVisibility(key)}
                      className={CHECK_INPUT}
                    />
                    {title}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={busy}
          className={ICON_BTN}
          aria-label="Refresh"
        >
          <i className={`ph ph-arrow-clockwise ${refreshing ? "animate-spin" : ""}`} />
        </button>
        </div>
      </div>

      {/* Table */}
      <div aria-busy={busy}>
        {busy ? (
          <TableBodySkeleton
            columnCount={visibleColumns.length + (Selections ? 1 : 0)}
            rowCount={8}
          />
        ) : (() => {
          const visibleCount = Math.floor(listHeight / rowHeight);
          const shouldVirtualize = paginatedData.length > visibleCount * 2;
          return shouldVirtualize ? (
            <div className="table-responsive">
              <div className="table table-nowrap mb-3" style={{ width: '100%' }}>
                {/* Header */}
                <div className={`flex ${SURFACE} border-b ${BORDER}`} style={{ height: rowHeight }}>
                  {Selections && <div style={{ width: '50px', padding: '8px', flexShrink: 0 }}>Select</div>}
                  {visibleColumns.map((column, index) => (
                    <div key={index} style={{ padding: '8px', flex: 1, fontWeight: 'bold' }}>
                      {typeof column.title === "function" ? null : (column.title as React.ReactNode)}
                    </div>
                  ))}
                </div>
                {/* Virtual scrolling body */}
                <List
                  height={listHeight}
                  itemCount={paginatedData.length}
                  itemSize={rowHeight}
                  width="100%"
                >
                  {Row}
                </List>
              </div>
            </div>
          ) : (
           
            (() => {
              const body = (
                <>
                  {Selections && (
                    <Column
                      selectionMode="multiple"
                      headerStyle={{ width: "3rem" }}
                      pt={columnPt}
                    />
                  )}
                  {visibleColumns.map((column, index) => (
                    <Column
                      key={getColumnKey(column, index)}
                      field={getDataIndex(column)}
                      header={
                        typeof column.title === "function"
                          ? null
                          : (column.title as React.ReactNode)
                      }
                      style={column.width ? { width: column.width } : undefined}
                      pt={columnPt}
                      body={
                        column.render
                          ? (record: TableRecord, options: { rowIndex: number }) => {
                              const dataIndex = getDataIndex(column);
                              const value = dataIndex
                                ? record[dataIndex]
                                : undefined;
                              return column.render!(
                                value,
                                record,
                                options.rowIndex,
                              );
                            }
                          : undefined
                      }
                    />
                  ))}
                </>
              );

              const shared = {
                unstyled: true,
                pt: dataTablePt,
                className: "mb-4",
                value: paginatedData,
                dataKey: "key",
                emptyMessage: "No records found",
              };

              return Selections ? (
                <DataTable
                  {...shared}
                  selectionMode="checkbox"
                  selection={selectedRows}
                  onSelectionChange={(event) => {
                    const rows = (event.value as TableRecord[]) ?? [];
                    setSelectedRows(rows);
                    onSelectChange(
                      rows.map((row, index) => (row.key as React.Key) ?? index),
                    );
                  }}
                >
                  {body}
                </DataTable>
              ) : (
                <DataTable {...shared}>{body}</DataTable>
              );
            })()
          );
        })()}
      </div>
    </div>
  );
};

export default React.memo(Datatable);
