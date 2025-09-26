import { cn } from "@/lib/utils/cn";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  heading,
  text,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-2", className)}>
      <div className="grid gap-1">
        <h1 className="font-bold text-3xl md:text-4xl text-contrast-aa">{heading}</h1>
        {text && <p className="text-lg text-gray-600 max-w-2xl">{text}</p>}
      </div>
      {children}
    </div>
  );
}