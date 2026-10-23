import { useState } from "react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import Modal from "../../../components/common/Modal";

type SideNavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

type StorageCard = {
  name: string;
  icon: string;
  bar: string;
  width: string;
  files: string;
  usage: string;
};

type RecentFile = {
  name: string;
  icon: string;
  iconBg: string;
  date: string;
  size: string;
};

type FileRow = {
  name: string;
  icon: string;
  size: string;
  type: string;
  modified: string;
  avatars: string[];
  extra?: string;
};

const sideNav: SideNavItem[] = [
  { label: "All Folder / Files", icon: "ph-duotone ph-folders", active: true },
  { label: "Drive", icon: "ph-duotone ph-cloud" },
  { label: "Dropbox", icon: "ph-duotone ph-cube" },
  { label: "Shared with Me", icon: "ph-duotone ph-share-network" },
  { label: "Document", icon: "ph-duotone ph-file-text" },
  { label: "Recent File", icon: "ph-duotone ph-clock-counter-clockwise" },
  { label: "Important", icon: "ph-duotone ph-star" },
  { label: "Media", icon: "ph-duotone ph-image" },
];

const storageCards: StorageCard[] = [
  {
    name: "Dropbox",
    icon: "ph-fill ph-cube c-cyan text-2xl",
    bar: "bg-danger",
    width: "9.3%",
    files: "1454 Files",
    usage: "28GB / 300GB",
  },
  {
    name: "Google Drive",
    icon: "ph-fill ph-google-logo c-green text-2xl",
    bar: "bg-pink",
    width: "37%",
    files: "200 Files",
    usage: "24GB / 65GB",
  },
  {
    name: "Cloud Storage",
    icon: "ph-fill ph-cloud text-default text-2xl",
    bar: "bg-[var(--surface)]",
    width: "90%",
    files: "144 Files",
    usage: "54GB / 60GB",
  },
];

const storageMenu: { label: string; icon: string; danger?: boolean }[] = [
  { label: "Preview", icon: "ph ph-eye" },
  { label: "Duplicate", icon: "ph ph-copy" },
  { label: "Move", icon: "ph ph-arrows-out-cardinal" },
  { label: "Invite", icon: "ph ph-user-plus" },
  { label: "Delete", icon: "ph ph-trash", danger: true },
];

const recentFiles: RecentFile[] = [
  {
    name: "Final Change.doc",
    icon: "ph-fill ph-file-doc c-cyan text-2xl",
    iconBg: "bg-info-transparent",
    date: "26 Jul 2025",
    size: "8MB",
  },
  {
    name: "Marklist_final.pdf",
    icon: "ph-fill ph-file-pdf c-red text-2xl",
    iconBg: "bg-danger-transparent",
    date: "25 Jul 2025",
    size: "6MB",
  },
  {
    name: "Nature_tree.png",
    icon: "ph-fill ph-image c-green text-2xl",
    iconBg: "bg-success-transparent",
    date: "24Jul 2025",
    size: "8MB",
  },
  {
    name: "Group Photos IV",
    icon: "ph-fill ph-folder c-orange text-2xl",
    iconBg: "bg-warning-transparent",
    date: "23 Jul 2025",
    size: "10MB",
  },
];

const fileRows: FileRow[] = [
  {
    name: "Secret",
    icon: "ph-fill ph-file-doc c-cyan",
    size: "7.6 MB",
    type: "Doc",
    modified: "17 Jun 2025, 09:00 AM",
    avatars: [
      "assets/img/avatars/avatar-03.jpg",
      "assets/img/avatars/avatar-04.jpg",
      "assets/img/avatars/avatar-05.jpg",
    ],
    extra: "+5",
  },
  {
    name: "Sophie Headrick",
    icon: "ph-fill ph-file-pdf c-red",
    size: "7.4 MB",
    type: "PDF",
    modified: "10 Jun 2025, 10:30 AM",
    avatars: ["assets/img/avatars/avatar-04.jpg", "assets/img/avatars/avatar-06.jpg"],
  },
  {
    name: "Gallery",
    icon: "ph-fill ph-image c-green",
    size: "6.1 MB",
    type: "Image",
    modified: "22 May 2025, 01:15 PM",
    avatars: [
      "assets/img/avatars/avatar-05.jpg",
      "assets/img/avatars/avatar-07.jpg",
      "assets/img/avatars/avatar-08.jpg",
    ],
  },
  {
    name: "Doris crowley",
    icon: "ph-fill ph-folder c-orange",
    size: "5.2 MB",
    type: "Folder",
    modified: "15 May 2025, 11:30 AM",
    avatars: ["assets/img/avatars/avatar-06.jpg"],
  },
  {
    name: "Cheat_codez",
    icon: "ph-fill ph-file-text c-green",
    size: "8 MB",
    type: "Xml",
    modified: "30 Apr 2025, 12:20 PM",
    avatars: [
      "assets/img/avatars/avatar-07.jpg",
      "assets/img/avatars/avatar-09.jpg",
      "assets/img/avatars/avatar-10.jpg",
    ],
  },
];

const dropdownToggleClass =
  "hs-dropdown-toggle cursor-pointer btn-sm size-7 bg-[var(--card)] border border-[var(--border)] c-dim inline-flex items-center justify-center hover:bg-[var(--surface)] hover:border-light hover:c-text focus:bg-[var(--surface)] focus:border-light focus:c-text focus:outline-hidden";

const dropdownMenuClass =
  "hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] shadow rounded-md mt-2 z-1";

const dropdownItemClass =
  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm c-text hover:bg-[var(--surface)] hover:c-text focus:outline-hidden focus:bg-[var(--card)]";

const dropdownDangerClass =
  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm c-red hover:bg-[var(--surface)] hover:c-text focus:outline-hidden focus:bg-[var(--card)]";

const EditDeleteMenu = () => (
  <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
    <button
      type="button"
      className={dropdownToggleClass}
      aria-haspopup="menu"
      aria-expanded="false"
      aria-label="Dropdown"
    >
      <i className="icon-ellipsis-vertical font-normal" />
    </button>
    <div className={dropdownMenuClass} role="menu" aria-orientation="vertical" tabIndex={-1}>
      <div className="p-2 space-y-1">
        <a className={dropdownItemClass} href="#">
          <i className="icon-pencil-line" /> Edit
        </a>
        <a className={dropdownDangerClass} href="#">
          <i className="icon-trash-2" /> Delete
        </a>
      </div>
    </div>
  </div>
);

const FileManager = () => {
  const [addFilesOpen, setAddFilesOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
          <h1 className="c-text text-xl max-lg:text-lg font-bold mb-0">File Manager</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 w-full">
          {/* Sidebar */}
          <div className="xl:col-span-3">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4 mb-3">
              <div className="flex items-center gap-2 pb-4 border-b border-[var(--border)] mb-4">
                <ImageWithBasePath
                  src="assets/img/avatars/avatar-03.jpg"
                  className="size-10 rounded-full border border-[var(--border)] shrink-0"
                  alt="user"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-title truncate mb-0">James Hong</p>
                  <p className="text-[11px] text-default truncate mb-0">james@example.com</p>
                </div>
              </div>
              <button
                type="button"
                className="btn w-full bg-primary text-white border border-primary inline-flex items-center justify-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer mb-4"
                onClick={() => setAddFilesOpen(true)}
              >
                <i className="ph-duotone ph-plus-circle" /> Create Event
              </button>
              <div className="space-y-1">
                {sideNav.map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className={
                      item.active
                        ? "flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--card2)] c-gold text-sm font-semibold border border-[var(--border)]"
                        : "flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
                    }
                  >
                    <i className={item.icon} /> {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Upgrade card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4 text-center">
              <div className="size-32 mx-auto mb-3 rounded-md bg-gradient-to-br from-info-transparent to-purple-transparent flex items-center justify-center">
                <i className="ph-duotone ph-rocket-launch c-cyan text-6xl" />
              </div>
              <p className="text-sm font-semibold text-title mb-1">Upgrade To PRO</p>
              <p className="text-[11px] text-default mb-0">
                Unlock Pro for faster transfers, stronger security, and unlimited storage.
              </p>
            </div>
          </div>

          <div className="xl:col-span-9 space-y-3">
            {/* Quick Access */}
            <div>
              <h2 className="text-sm font-semibold text-title mb-3">Quick Access</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {storageCards.map((card) => (
                  <div
                    key={card.name}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <i className={card.icon} />
                        <p className="text-sm font-semibold text-title mb-0">{card.name}</p>
                      </div>
                      <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
                        <button
                          type="button"
                          className={dropdownToggleClass}
                          aria-haspopup="menu"
                          aria-expanded="false"
                          aria-label="Dropdown"
                        >
                          <i className="icon-ellipsis-vertical font-normal" />
                        </button>
                        <div
                          className={dropdownMenuClass}
                          role="menu"
                          aria-orientation="vertical"
                          tabIndex={-1}
                        >
                          <div className="p-2 space-y-1">
                            {storageMenu.map((item) => (
                              <a
                                key={item.label}
                                className={item.danger ? dropdownDangerClass : dropdownItemClass}
                                href="#"
                              >
                                <i className={item.icon} /> {item.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-1 bg-[var(--card2)] rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full ${card.bar} rounded-full`}
                        style={{ width: card.width }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-default">{card.files}</span>
                      <span className="text-default">{card.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Files */}
            <div>
              <h2 className="text-sm font-semibold text-title mb-3">Recent Files</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recentFiles.map((file) => (
                  <div
                    key={file.name}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`size-10 rounded ${file.iconBg} flex items-center justify-center`}>
                        <i className={file.icon} />
                      </div>
                      <EditDeleteMenu />
                    </div>
                    <p className="text-sm font-semibold text-title mb-1">{file.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-default">
                      <span>{file.date}</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Files */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4 pb-1.5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-title mb-0">Files</p>
                <a
                  href="#"
                  className="btn-sm bg-[var(--card)] border border-[var(--border)] c-text inline-flex items-center gap-1 hover:bg-primary hover:text-white"
                >
                  View All
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-sm text-default border-b border-[var(--border)]">
                      <th className="text-left py-2 px-2 font-semibold c-text">Name</th>
                      <th className="text-left py-2 px-2 font-semibold c-text">Size</th>
                      <th className="text-left py-2 px-2 font-semibold c-text">Type</th>
                      <th className="text-left py-2 px-2 font-semibold c-text">Modified</th>
                      <th className="text-left py-2 px-2 font-semibold c-text">Share</th>
                      <th className="text-left py-2 px-2 font-semibold c-text" />
                    </tr>
                  </thead>
                  <tbody>
                    {fileRows.map((row) => (
                      <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <i className={row.icon} />
                            <span className="text-sm font-semibold text-title">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-sm text-default">{row.size}</td>
                        <td className="py-2.5 px-2 text-sm text-default">{row.type}</td>
                        <td className="py-2.5 px-2 text-sm text-default">{row.modified}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center -space-x-2">
                            {row.avatars.map((avatar) => (
                              <ImageWithBasePath
                                key={avatar}
                                src={avatar}
                                className="size-6 rounded-full border-2 border-[var(--border)]"
                                alt="user"
                              />
                            ))}
                            {row.extra && (
                              <span className="size-6 rounded-full bg-[var(--surface)] text-white text-[9px] flex items-center justify-center border-2 border-[var(--border)]">
                                {row.extra}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="size-7 rounded inline-flex items-center justify-center text-default hover:bg-[var(--surface)] cursor-pointer fav-icon"
                            >
                              <i className="ph ph-star" />
                            </button>
                            <EditDeleteMenu />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload modal */}
      <Modal open={addFilesOpen} onClose={() => setAddFilesOpen(false)} title="Add Files" boxClassName="glass modal-w-560">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition"
            onClick={() => {
              setAddFilesOpen(false);
              setCreateFolderOpen(true);
            }}
          >
            <div className="size-12 rounded-md bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
              <i className="ph-duotone ph-folder-plus text-2xl c-text" />
            </div>
            <p className="text-sm font-semibold text-title mb-0">Create New Folder</p>
          </button>
          <button
            type="button"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-md p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition"
          >
            <div className="size-12 rounded-md bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
              <i className="ph-duotone ph-upload-simple text-2xl c-text" />
            </div>
            <p className="text-sm font-semibold text-title mb-0">Upload File</p>
          </button>
        </div>
      </Modal>

      {/* Create Folder modal */}
      <Modal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        title="Create Folder"
        boxClassName="glass modal-w-420"
        footer={
          <>
            <button
              type="button"
              className="btn-sm bg-[var(--card)] border border-[var(--border)] c-text hover:bg-[var(--surface)] cursor-pointer"
              onClick={() => setCreateFolderOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-sm bg-[var(--surface)] text-white border border-dark hover:bg-primary-hover hover:border-primary-hover cursor-pointer"
            >
              Create New
            </button>
          </>
        }
      >
        <form>
          <label htmlFor="fm-folder-name" className="text-sm font-semibold c-text mb-1 inline-block">
            Folder Name <span className="c-red">*</span>
          </label>
          <input
            id="fm-folder-name"
            type="text"
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--card)] focus:outline-none focus:ring-0"
          />
        </form>
      </Modal>
    </>
  );
};

export default FileManager;
