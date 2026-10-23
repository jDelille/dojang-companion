
import { all_routes } from "../../../routes/all_routes"
import CommonSelect from "../../../components/common-select/commonSelect"
import Link from "next/link"

const fromOptions = [{ label: "jamie.anderson@example.com", value: "jamie.anderson@example.com" }]

const toOptions = ["Sarah Johnson", "Mike Chen", "Anna Smith"].map((v) => ({
  label: v,
  value: v,
}))

const bccOptions = [{ label: "team@example.com", value: "team@example.com" }]

const EmailCompose = () => {
  return (
    <main>
  <div className="p-3 lg:py-6 lg:px-0">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="c-text text-xl max-lg:text-lg font-bold mb-0">
        Email Compose
      </h1>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 w-full">
      {/* Sidebar */}
      <div className="xl:col-span-3">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-md p-4">
          <Link
            href={all_routes.emailCompose}
            className="btn w-full bg-primary text-white border border-primary inline-flex items-center justify-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer mb-4"
          >
            <i className="ph-duotone ph-diamond" /> Compose New
          </Link>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-title mb-0">Mail</p>
              <button
                type="button"
                className="text-default hover:c-gold cursor-pointer"
              >
                <i className="ph ph-caret-down" />
              </button>
            </div>
            <div className="space-y-1">
              <Link
                href={all_routes.email}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="ph-duotone ph-tray" /> Inbox
                </span>
                <span className="size-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center">
                  6
                </span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-star" /> Starred
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-alarm" /> Snoozed
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-paper-plane-right" /> Sent
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-note-pencil" /> Drafts
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-flag" /> Important
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-chat-circle" /> Chats
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-clock" /> Scheduled
              </Link>
            </div>
          </div>
          <div className="mb-4 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-title mb-0">Others</p>
              <button
                type="button"
                className="text-default hover:c-gold cursor-pointer"
              >
                <i className="ph ph-caret-down" />
              </button>
            </div>
            <div className="space-y-1">
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-envelope" /> All Emails
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-warning-octagon" /> Spam
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <i className="ph-duotone ph-trash" /> Trash
              </Link>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-title mb-0">Labels</p>
              <button
                type="button"
                className="text-default hover:c-gold cursor-pointer"
              >
                <i className="ph ph-caret-down" />
              </button>
            </div>
            <div className="space-y-1">
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <span className="size-2 rounded-full bg-success" /> Personal
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <span className="size-2 rounded-full bg-orange" /> Client
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <span className="size-2 rounded-full bg-info" /> Marketing
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-default text-sm hover:bg-[var(--surface)]"
              >
                <span className="size-2 rounded-full bg-info" /> Office
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Compose Panel */}
      <div className="xl:col-span-9">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-md flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-sm font-semibold text-title mb-0">New Message</p>
          </div>
          <form action="#" className="p-4 space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold c-text mb-1 inline-block">
                  From <span className="text-danger">*</span>
                </label>
                <CommonSelect
                  options={fromOptions}
                  className="w-full"
                  ariaLabel="Select from address"
                />
              </div>
              <div>
                <label className="text-sm font-semibold c-text mb-1 inline-block">
                  To <span className="text-danger">*</span>
                </label>
                <CommonSelect
                  options={toOptions}
                  className="w-full"
                  ariaLabel="Select recipient"
                />
              </div>
              <div>
                <label className="text-sm font-semibold c-text mb-1 inline-block">
                  BCC <span className="text-danger">*</span>
                </label>
                <CommonSelect
                  options={bccOptions}
                  className="w-full"
                  ariaLabel="Select bcc address"
                />
              </div>
              <div>
                <label className="text-sm font-semibold c-text mb-1 inline-block">
                  Subject <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-md bg-[var(--card)] focus:outline-none focus:ring-0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold c-text mb-1 inline-block">
                Message
              </label>
              <textarea
                rows={8}
                placeholder="Type Here"
                className="w-full text-sm px-3 py-2 focus:outline-none focus:ring-0 resize-none border border-[var(--border)] rounded-md"
              />
            </div>
            <div>
              <div>
                <input type="file" id="file-attachment-input" className="hidden" />
                <label
                  htmlFor="file-attachment-input"
                  className="btn-sm bg-dark text-white border border-dark inline-flex items-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer text-sm font-medium py-1.5 px-3 rounded"
                >
                  <i className="ph-duotone ph-paperclip" /> Attachment
                </label>
              </div>
              <p className="text-[11px] text-default mt-2 mb-0">
                Max upload file size: 32MB
              </p>
            </div>
          </form>
          <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border)]">
            <button
              type="button"
              className="btn-sm bg-dark text-white border border-dark inline-flex items-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer"
            >
              <i className="ph-duotone ph-note-pencil" /> Make as Draft
            </button>
            <button
              type="button"
              className="btn-sm bg-danger text-white border border-danger inline-flex items-center gap-2 hover:bg-danger-hover hover:border-danger-hover cursor-pointer"
            >
              <i className="ph ph-x" /> Discard
            </button>
            <button
              type="button"
              className="btn-sm bg-primary text-white border border-primary inline-flex items-center gap-2 hover:bg-primary-hover hover:border-primary-hover cursor-pointer"
            >
              <i className="ph-duotone ph-paper-plane-right" /> Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
  )
}

export default EmailCompose
