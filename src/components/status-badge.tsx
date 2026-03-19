type StatusBadgeProps = {
  label: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className="status-badge" data-tone={tone}>
      {label}
    </span>
  );
}
