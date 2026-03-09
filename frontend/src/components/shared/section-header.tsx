import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/70">{eyebrow}</p> : null}
        {title ? <h1 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">{title}</h1> : null}
        {description ? <p className="max-w-2xl text-sm text-zinc-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
