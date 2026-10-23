"use client";

import Link from "next/link";
import ImageWithBasePath from "../image-with-base-path";
import LucideIcon from "../common/LucideIcon";
import Dropdown from "../common/dropdown";
import SidebarMenu from "./sidebarMenuItem";
import { all_routes } from "../../routes/all_routes";
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
        <div className="logo-badge w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0 p-1">
          <ImageWithBasePath src="assets/img/logo.svg" alt="logo" />
        </div>
        <div className="sidebar-logo-text flex items-center gap-2 overflow-hidden">
          <div>
            <div className="font-black c-text text-[16px] leading-none tracking-tight">
              Dreams <span className="gt">GYM</span>
            </div>
            <div className="text-[9px] font-bold tracking-[0.16em] mt-1 c-gold">
              ELITE MANAGEMENT
            </div>
          </div>
          <span className="brand-pro text-[8px] font-black px-1.5 py-0.5 rounded-md self-start mt-0.5">
            PRO
          </span>
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
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm avatar-gold overflow-hidden">
              <ImageWithBasePath src="assets/img/avatars/avatar-19.jpg" alt="" />
            </div>
            <div className="notif-dot pulse-gold" />
          </div>
          <div className="user-info flex-1 overflow-hidden">
            <div className="text-sm font-semibold c-text leading-none">
              Nathan Reeves
            </div>
            <div className="text-[10px] mt-1 font-semibold flex items-center gap-1 c-gold">
              <LucideIcon name="shield-check" className="w-[10px] h-[10px]" />
              Super Admin
            </div>
          </div>
          <LucideIcon
            name="chevrons-up-down"
            className="user-info nav-icon c-dim2 shrink-0"
          />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <div className="px-3 py-2 mb-1 bd-b">
            <div className="text-sm font-bold c-text">Nathan Reeves</div>
            <div className="text-[11px] c-dim">nathan@example.com</div>
          </div>
          <Link href={all_routes.settings} className="dropdown-item">
            <LucideIcon name="user" className="w-[13px] h-[13px]" />
            My Profile
          </Link>
          <Link href={all_routes.settings} className="dropdown-item">
            <LucideIcon name="settings" className="w-[13px] h-[13px]" />
            Account Settings
          </Link>
          <div className="dd-divider" />
          <Link href={all_routes.login} className="dropdown-item c-red">
            <LucideIcon name="log-out" className="w-[13px] h-[13px] c-red" />
            Sign Out
          </Link>
        </Dropdown.Menu>
      </Dropdown>
    </aside>
  );
};

export default CommonSidebar;
