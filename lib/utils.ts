// Standard shadcn class combiner. Vendored remocn components import this via
// the "@/lib/utils" alias (see components.json); app code is free to use it too.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
