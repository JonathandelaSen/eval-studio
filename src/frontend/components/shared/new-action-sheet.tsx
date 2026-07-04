"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/frontend/components/ui/sheet";
import { cn } from "@/frontend/utils/cn";

export interface NewActionSheetProps {
  triggerLabel: string;
  triggerIcon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  triggerClassName?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewActionSheet({
  triggerLabel,
  triggerIcon: Icon,
  title,
  description,
  children,
  triggerClassName,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: NewActionSheetProps) {
  const [localOpen, setLocalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : localOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setLocalOpen;
  const close = React.useCallback(() => {
    if (setOpen) {
      setOpen(false);
    }
  }, [setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative flex items-center justify-center gap-2 rounded-lg border border-primary/45 bg-card px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/5 hover:border-primary active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:hover:bg-primary/10 dark:focus:ring-offset-slate-900 cursor-pointer select-none",
            triggerClassName
          )}
        >
          <Icon className="size-4 text-primary transition-all duration-200 group-hover:scale-105" />
          <span>{triggerLabel}</span>
        </button>
      </SheetTrigger>
      <SheetContent className={cn("flex w-full flex-col gap-4 overflow-y-auto sm:max-w-md", className)} aria-describedby={description ? "sheet-desc" : undefined}>
        <div className="flex flex-col gap-1 border-b pb-4">
          <SheetTitle className="text-lg font-bold text-foreground">
            {title}
          </SheetTitle>
          {description ? (
            <SheetDescription id="sheet-desc" className="text-xs">
              {description}
            </SheetDescription>
          ) : null}
        </div>
        <div className="flex-1">
          {typeof children === "function" ? children(close) : children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
