import type { ElementType, ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Card<T extends ElementType = "div">({
  as,
  children,
  className,
  ...props
}: CardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/95 p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
