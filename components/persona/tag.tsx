import Link from "next/link";
import { PersonaAvatar } from "@/components/persona/avatar";

// A compact "who this speaks to" pill: mini avatar + persona name. Server-safe
// (no hooks). Pass an href to make it a link — but not inside another <a>
// (e.g. a card that is itself a Link), where it must stay a plain span.

export function PersonaTag({
  name,
  avatar,
  href,
  title,
  className = "",
}: {
  name: string;
  avatar?: string | null;
  href?: string;
  title?: string;
  className?: string;
}) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-full bg-subtle py-0.5 pr-2.5 pl-0.5 text-caption text-t2";
  const inner = (
    <>
      <PersonaAvatar name={name} src={avatar} size={18} />
      {name}
    </>
  );
  if (href) {
    return (
      <Link href={href} title={title} className={`${cls} transition-colors hover:bg-subtle-hover ${className}`}>
        {inner}
      </Link>
    );
  }
  return (
    <span title={title} className={`${cls} ${className}`}>
      {inner}
    </span>
  );
}
