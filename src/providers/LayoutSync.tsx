"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { closeDrawer, setSidebarOpen } from "../redux/slices/layoutSlice";
import { useIsMobile } from "../hooks/useMediaQuery";
import type { LayoutVariant } from "../redux/slices/layoutSlice";

const VARIANT_CLASS: Record<LayoutVariant, string | null> = {
  default: null,
  mini: "lay-mini",
  hoverview: "lay-hoverview",
  hidden: "lay-hidden",
  fullwidth: "lay-fullwidth",
  rtl: "lay-rtl",
};

const ALL_VARIANT_CLASSES = Object.values(VARIANT_CLASS).filter(
  (name): name is string => name !== null,
);

const HEADER_CLASSES = ["hd-auto", "hd-solid", "hd-transparent", "hd-bordered"];

const LayoutSync = () => {
  const dispatch = useAppDispatch();
  const { header, variant, sidebarCollapsed, sidebarOpen, drawerOpen } = useAppSelector(
    (state) => state.layout,
  );
  const isMobile = useIsMobile();
  const usesOpenClass = variant === "mini" || variant === "hidden";

  useEffect(() => {
    const { classList } = document.documentElement;
    classList.remove(...HEADER_CLASSES);
    if (header !== "glass") classList.add(`hd-${header}`);
  }, [header]);

  useEffect(() => {
    const html = document.documentElement;
    const next = VARIANT_CLASS[variant];

    html.classList.remove(...ALL_VARIANT_CLASSES);
    if (next) html.classList.add(next);

    if (variant === "rtl") html.setAttribute("dir", "rtl");
    else html.removeAttribute("dir");
  }, [variant]);

  /*
     Mini and hidden key their CSS off #sidebar.open (see the :root.lay-mini /
     :root.lay-hidden rules in style.css); every other variant uses the
     .collapsed/.expanded pair. Mirrors toggleSidebar() in script.js.
  */
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");
    if (!sidebar || !main) return;

    if (usesOpenClass) {
      sidebar.classList.remove("collapsed");
      main.classList.remove("expanded");
      sidebar.classList.toggle("open", sidebarOpen && !isMobile);
    } else {
      sidebar.classList.remove("open");
      const collapsed = sidebarCollapsed && !isMobile;
      sidebar.classList.toggle("collapsed", collapsed);
      main.classList.toggle("expanded", collapsed);
    }
  }, [sidebarCollapsed, sidebarOpen, usesOpenClass, isMobile, variant]);

  /* lay-mini closes on an outside click, matching script.js's document listener. */
  useEffect(() => {
    if (variant !== "mini" || !sidebarOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const toggleBtn = document.querySelector("[data-toggle-sidebar]");
      const target = event.target as Node;
      if (sidebar?.contains(target) || toggleBtn?.contains(target)) return;
      dispatch(setSidebarOpen(false));
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [variant, sidebarOpen, dispatch]);

  /* Escape closes the open mini/hidden rail, matching script.js's keydown handler. */
  useEffect(() => {
    if (!usesOpenClass || !sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch(setSidebarOpen(false));
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [usesOpenClass, sidebarOpen, dispatch]);

  useEffect(() => {
    document.body.classList.toggle("sb-locked", drawerOpen);
    return () => document.body.classList.remove("sb-locked");
  }, [drawerOpen]);

  useEffect(() => {
    if (!isMobile && drawerOpen) dispatch(closeDrawer());
  }, [isMobile, drawerOpen, dispatch]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch(closeDrawer());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, dispatch]);

  return null;
};

export default LayoutSync;
