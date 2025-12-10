import { cn } from "@/lib/utils";

type Status = "Present" | "Absent" | "Approved" | "Denied" | "Pending";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  Present: "bg-success/10 text-success border-success/20",
  Absent: "bg-destructive/10 text-destructive border-destructive/20",
  Approved: "bg-success/10 text-success border-success/20",
  Denied: "bg-destructive/10 text-destructive border-destructive/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
