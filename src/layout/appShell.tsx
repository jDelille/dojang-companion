"use client";

import CommonHeader from "../components/common-header/commonHeader";
import CommonSidebar from "../components/common-sidebar/commonSidebar";
import { DropdownProvider } from "../components/common/dropdown";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { closeDrawer } from "../redux/slices/layoutSlice";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const drawerOpen = useAppSelector((state) => state.layout.drawerOpen);

  return (
    <DropdownProvider>
      <CommonSidebar />

      <div id="main">
        <CommonHeader />
        <main className="flex-1 p-6 dash-main">{children}</main>
      </div>

      <div
        className={`sb-backdrop${drawerOpen ? " show" : ""}`}
        aria-hidden="true"
        onClick={() => dispatch(closeDrawer())}
      />
    </DropdownProvider>
  );
};

export default AppShell;
