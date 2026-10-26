"use client";

import LucideIcon from "../common/LucideIcon";
import Dropdown from "../common/dropdown";
import SidebarMenu from "./sidebarMenuItem";
import { sidebarMenu } from "../../utils/json/sidebarMenu";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { closeDrawer } from "../../redux/slices/layoutSlice";
import { useIsMobile } from "../../hooks/useMediaQuery";

const CommonSidebar = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const drawerOpen = useAppSelector((state) => state.layout.drawerOpen);

  const handleNavigate = (event: React.MouseEvent<HTMLElement>) => {
    if (isMobile && (event.target as HTMLElement).closest("a[href]")) {
      dispatch(closeDrawer());
    }
  };

  return (
    <aside
      id="sidebar"
      className={drawerOpen ? "open" : undefined}
      onClick={handleNavigate}
    >
      <div className="flex items-center gap-3 px-4 py-3 sidebar-head">
        {/* Dojang mark: the black square "D" from Companion's sidebar */}
        <div
          aria-hidden="true"
          className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 bg-black border border-[#2a2a35] text-white font-black text-[18px]"
        >
          D
        </div>
        <div className="sidebar-logo-text flex items-center gap-2 overflow-hidden">
          <div>
            <div className="font-black c-text text-[16px] leading-none tracking-tight">
              Dojang
            </div>
            <div className="text-[9px] font-bold tracking-[0.16em] mt-1 c-dim">
              STAFF COMPANION
            </div>
          </div>
        </div>
      </div>
      <nav
        className="nav-scroll flex-1 overflow-y-auto py-2"
        aria-label="Primary navigation"
      >
        <SidebarMenu sections={sidebarMenu} />
      </nav>
      <Dropdown
        id="side-profile-menu"
        variant="up"
        className="p-3 sidebar-foot"
      >
        <Dropdown.Trigger
          className="side-profile flex items-center gap-3 p-2 rounded-xl cursor-pointer w-full text-left"
          aria-label="Account menu"
        >
          {/* No staff sign-in yet (it will be the Odoo login through the Hub) */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#17171d] border border-[#2a2a35] c-dim">
              <LucideIcon name="user" className="w-4 h-4" />
            </div>
          </div>
          <div className="user-info flex-1 overflow-hidden">
            <div className="text-sm font-semibold c-text leading-none">
              Staff
            </div>
            <div className="text-[10px] mt-1 font-semibold c-dim">
              Not signed in · Development
            </div>
          </div>
          <LucideIcon
            name="chevrons-up-down"
            className="user-info nav-icon c-dim2 shrink-0"
          />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <div className="px-3 py-2">
            <div className="text-sm font-bold c-text">Not signed in</div>
            <div className="text-[11px] c-dim">
              Staff sign-in isn&apos;t connected yet. Pages show development sample data.
            </div>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </aside>
  );
};

export default CommonSidebar;
