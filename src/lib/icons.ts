import {
  Box, Building2, Car, Cog, Factory, Gift, Maximize, Megaphone, MonitorSmartphone, PenTool, Printer,
  Ruler, Scissors, Shirt, Signpost, Sofa, Sparkles, Store, Zap, Layers, Palette, Lightbulb, Brush, Package,
  type LucideIcon,
} from 'lucide-react';

/** Icons selectable for categories/services in the admin dashboard. */
export const ICONS: Record<string, LucideIcon> = {
  PenTool, MonitorSmartphone, Box, Sparkles, Sofa, Building2, Ruler, Printer, Maximize, Cog, Zap,
  Scissors, Signpost, Store, Gift, Shirt, Car, Megaphone, Factory, Layers, Palette, Lightbulb, Brush, Package,
};

export const iconFor = (name: string | undefined): LucideIcon => (name && ICONS[name]) || Layers;
