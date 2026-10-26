// One label | value row in the Confirm summary and the Result receipt.
// Phones: label above value, so long values have the full width.

type SummaryRowProps = {
  label: string;
  children: React.ReactNode;
};

const SummaryRow = ({ label, children }: SummaryRowProps) => {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-baseline gap-1 @min-[540px]:grid-cols-[9rem_1fr] @min-[540px]:gap-4">
      <dt className="text-xl text-(--kiosk-muted)">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-3 text-lg font-semibold [overflow-wrap:anywhere] @min-[540px]:text-2xl">
        {children}
      </dd>
    </div>
  );
};

export default SummaryRow;
