
import Link from "next/link";
import { all_routes } from "../../../routes/all_routes";

type Tab = {
  label: string;
  to: string;
};

const tabs: Tab[] = [
  { label: "Workflow", to: all_routes.workflowApprovals },
  { label: "Approval Levels", to: all_routes.workflowApprovalLevels },
  { label: "Requests", to: all_routes.workflowRequests },
  { label: "Actions / Audit", to: all_routes.workflowActions },
];

type WorkflowTabsProps = {
  /** Label of the tab to mark active. */
  active: string;
};

const WorkflowTabs = ({ active }: WorkflowTabsProps) => {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          href={tab.to}
          className={tab.label === active ? "ord-tab active" : "ord-tab"}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
};

export default WorkflowTabs;
