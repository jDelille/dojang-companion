import {
  AlertOctagon,
  Contrast,
  Crown,
  Eye,
  FileJson,
  FileSpreadsheet,
  GitMerge,
  Layers,
  Monitor,
  Moon,
  PanelTop,
  Palette,
  Replace,
  RotateCcw,
  Square,
  Sun,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

/*
   Settings icon map — ported from the lucide icon names used across
   tailwind/src/assets/js/settings.js (PLANS, EX_FORMATS, IMPORT_MODES, MODES,
   SIDEBARS, HEADERS and the reset-scope option cards). SETTINGS_ICON_FALLBACK
   covers any name not present in the map.
*/

export const SETTINGS_ICON: Record<string, LucideIcon> = {
  zap: Zap,
  "trending-up": TrendingUp,
  crown: Crown,
  "file-json": FileJson,
  "file-spreadsheet": FileSpreadsheet,
  "git-merge": GitMerge,
  replace: Replace,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  contrast: Contrast,
  palette: Palette,
  layers: Layers,
  square: Square,
  eye: Eye,
  "panel-top": PanelTop,
  "rotate-ccw": RotateCcw,
  "alert-octagon": AlertOctagon,
};

export const SETTINGS_ICON_FALLBACK: LucideIcon = Square;
