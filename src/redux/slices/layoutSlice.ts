import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type HeaderStyle = "auto" | "glass" | "solid" | "transparent" | "bordered";

export const DEFAULT_HEADER: HeaderStyle = "auto";

export type LayoutVariant =
  | "default"
  | "mini"
  | "hoverview"
  | "hidden"
  | "fullwidth"
  | "rtl";

type LayoutState = {
  header: HeaderStyle;
  variant: LayoutVariant;
  sidebarCollapsed: boolean;
  /**
   * Drives #sidebar.open — the mini and hidden variants key their CSS off
   * this class instead of .collapsed/.expanded (see script.js's
   * toggleSidebar(): `lay-mini` toggles .open and returns early; every other
   * variant falls through to .collapsed/.expanded). Mini starts closed (the
   * 66px icon rail), matching layout-mini.html — it expands on hover/click,
   * not by default.
   */
  sidebarOpen: boolean;
  drawerOpen: boolean;
};

const initialState: LayoutState = {
  header: DEFAULT_HEADER,
  variant: "default",
  sidebarCollapsed: false,
  sidebarOpen: false,
  drawerOpen: false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setHeader: (state, action: PayloadAction<HeaderStyle>) => {
      state.header = action.payload;
    },
    setVariant: (state, action: PayloadAction<LayoutVariant>) => {
      state.variant = action.payload;
      state.sidebarCollapsed = false;
      /* Mini starts as the collapsed rail (expands on hover/click); hidden starts off-canvas. */
      state.sidebarOpen = false;
      state.drawerOpen = false;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarOpen: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openDrawer: (state) => {
      state.drawerOpen = true;
    },
    closeDrawer: (state) => {
      state.drawerOpen = false;
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen;
    },
  },
});

export const {
  setHeader,
  setVariant,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  setSidebarOpen,
  toggleSidebarOpen,
  openDrawer,
  closeDrawer,
  toggleDrawer,
} = layoutSlice.actions;

export default layoutSlice.reducer;
