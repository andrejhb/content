import type { ComponentType } from "react";
import {
  House,
  Buildings,
  Bed,
  Broom,
  CalendarCheck,
  ChatCircle,
  Key,
  CurrencyGbp,
  Sparkle,
  Sliders,
  Bell,
  ShieldCheck,
  Plugs,
  Users,
  Wrench,
  ChartLine,
  Star,
  MapPin,
  Lightning,
  ArrowsClockwise,
  ClipboardText,
  Camera,
  Lock,
  Gear,
  Storefront,
  HandWaving,
  ThumbsUp,
  Clock,
} from "@phosphor-icons/react/dist/ssr";
import { Mono } from "@/components/site/kit";

// Icons come from @phosphor-icons/react — the icon library the design system is
// built on (used internally by Checkbox, Chip, Tabs, etc.).
const ICONS: { name: string; Icon: ComponentType<{ className?: string }> }[] = [
  { name: "House", Icon: House },
  { name: "Buildings", Icon: Buildings },
  { name: "Bed", Icon: Bed },
  { name: "Broom", Icon: Broom },
  { name: "CalendarCheck", Icon: CalendarCheck },
  { name: "ChatCircle", Icon: ChatCircle },
  { name: "Key", Icon: Key },
  { name: "CurrencyGbp", Icon: CurrencyGbp },
  { name: "Sparkle", Icon: Sparkle },
  { name: "Sliders", Icon: Sliders },
  { name: "Bell", Icon: Bell },
  { name: "ShieldCheck", Icon: ShieldCheck },
  { name: "Plugs", Icon: Plugs },
  { name: "Users", Icon: Users },
  { name: "Wrench", Icon: Wrench },
  { name: "ChartLine", Icon: ChartLine },
  { name: "Star", Icon: Star },
  { name: "MapPin", Icon: MapPin },
  { name: "Lightning", Icon: Lightning },
  { name: "ArrowsClockwise", Icon: ArrowsClockwise },
  { name: "ClipboardText", Icon: ClipboardText },
  { name: "Camera", Icon: Camera },
  { name: "Lock", Icon: Lock },
  { name: "Gear", Icon: Gear },
  { name: "Storefront", Icon: Storefront },
  { name: "HandWaving", Icon: HandWaving },
  { name: "ThumbsUp", Icon: ThumbsUp },
  { name: "Clock", Icon: Clock },
];

export function Icons() {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-2xl bg-surface sm:grid-cols-4 lg:grid-cols-6">
      {ICONS.map(({ name, Icon }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 px-3 py-5 text-center"
        >
          <Icon className="size-6 text-t1" />
          <Mono className="truncate text-dim">{name}</Mono>
        </div>
      ))}
    </div>
  );
}
