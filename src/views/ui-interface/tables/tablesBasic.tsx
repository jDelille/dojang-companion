import { type ReactNode } from "react";
import { Download, Eye, MoreVertical, SquarePen, Trash2 } from "lucide-react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/tables-basic.html. Six cards demo the same three-row
   dataset with different cell treatments, so the rows are data and the six
   tables differ only by how a row renders.
*/

type Person = {
  name: string;
  email: string;
  avatar: string;
  active: boolean;
};

const PEOPLE: Person[] = [
  { name: "Mary", email: "john@example.com", avatar: "assets/img/avatars/avatar-18.jpg", active: true },
  { name: "Moe", email: "mary@example.com", avatar: "assets/img/avatars/avatar-10.jpg", active: true },
  { name: "Dooley", email: "july@example.com", avatar: "assets/img/avatars/avatar-03.jpg", active: false },
];

type PlainRow = { name: string; email: string };

const PLAIN_ROWS: PlainRow[] = [
  { name: "John", email: "john@example.com" },
  { name: "Mary", email: "mary@example.com" },
  { name: "July", email: "july@example.com" },
];

const HEAD_CELL = "px-4 py-2 bg-[var(--surface)] c-text text-start";
const CELL = "px-4 py-3 text-start";
const BORDERED_CELL = "border border-[var(--border)] px-4 py-3 text-start";
const ROW = "border-b border-[var(--border)]";
const AVATAR_CELL = "inline-flex items-center gap-2 px-4 py-3 text-start";
const DARK_AVATAR_CELL = "inline-flex w-full items-center gap-2 px-4 py-3 text-start";

const DROPDOWN_ACTIONS: { key: string; label: string; icon: typeof Eye }[] = [
  { key: "view", label: "View Details", icon: Eye },
  { key: "edit", label: "Edit", icon: SquarePen },
  { key: "delete", label: "Delete", icon: Trash2 },
];

const PreviewCard = ({
  title,
  children,
  contentClassName = "overflow-auto",
  code,
}: {
  title: string;
  children: ReactNode;
  contentClassName?: string;
  code: string;
}) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName="preview-card sm:col-span-6 col-span-12 bg-[var(--card)] rounded-md border border-[var(--border)] p-5"
    contentClassName={contentClassName}
  >
    {children}
  </PreviewCodeToggle>
);

const Avatar = ({ src }: { src: string }) => (
  <span className="relative flex shrink-0">
    <ImageWithBasePath
      className="w-8 h-8 border border-[var(--border)] rounded-full"
      src={src}
      alt="avatar"
    />
    <span className="bottom-0 end-0.5 absolute size-2 bg-success border border-white rounded-full" />
  </span>
);

const RowDropdown = () => (
  <div className="hs-dropdown [--placement:bottom-right] [--auto-close:inside] relative inline-flex">
    <button
      type="button"
      className="hs-dropdown-toggle cursor-pointer size-8 rounded-full inline-flex items-center justify-center text-sm font-normal border border-[var(--border)] bg-[var(--card)] c-text hover:bg-[var(--card)] focus:outline-hidden"
      aria-haspopup="menu"
      aria-expanded="false"
      aria-label="Dropdown"
    >
      <MoreVertical className="w-4 h-4" aria-hidden="true" />
    </button>

    <div
      className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-50 bg-[var(--card)] border border-[var(--border)] rounded-lg mt-2 z-50"
      role="menu"
      aria-orientation="vertical"
    >
      <div className="p-2 space-y-1">
        {DROPDOWN_ACTIONS.map(({ key, label, icon: Icon }) => (
          <a key={key} className="dropdown-item" href="#">
            <Icon className="w-4 h-4 me-2" aria-hidden="true" />
            {label}
          </a>
        ))}
      </div>
    </div>
  </div>
);

const TablesBasic = () => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="text-xl font-black c-text mb-0">Basic Tables</h1>
    </div>

    {/* Start grid */}
    <div className="grid grid-cols-12 gap-6">
      <PreviewCard
        title="Basic Example"
        code={`<table class="table-auto mb-0 w-full">
	<thead class="border border-[var(--border)]">
		<tr>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Firstname</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Email</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Status</th>
		</tr>
	</thead>
	<tbody class="border border-[var(--border)]">
		<tr class="border-b border-[var(--border)]">
			<td class="inline-flex items-center gap-2 px-4 py-3 text-start">
				<span class="relative flex shrink-0">
					<img class="w-8 h-8 border border-[var(--border)] rounded-full" src="assets/img/avatars/avatar-18.jpg" alt="avatar">
					<span class="bottom-0 end-0.5 absolute size-2 bg-success border border-white rounded-full"></span>
				</span>
				<span class="text-dark">Mary</span>
			</td>
			<td class="px-4 py-3 text-start">john@example.com</td>
			<td class="px-4 py-3 text-start">
				<span class="badge badge-present">
					<span class="dot"></span>
					Active
				</span>
			</td>
		</tr>
		<!-- Moe, Dooley rows follow the same pattern -->
	</tbody>
</table>`}
      >
        <table className="table-auto mb-0 w-full">
          <thead className="border border-[var(--border)]">
            <tr>
              <th className={HEAD_CELL}>Firstname</th>
              <th className={HEAD_CELL}>Email</th>
              <th className={HEAD_CELL}>Status</th>
            </tr>
          </thead>
          <tbody className="border border-[var(--border)]">
            {PEOPLE.map((person) => (
              <tr key={person.name} className={ROW}>
                <td className={AVATAR_CELL}>
                  <Avatar src={person.avatar} />
                  <span className="text-dark">{person.name}</span>
                </td>
                <td className={CELL}>{person.email}</td>
                <td className={CELL}>
                  <span className={person.active ? "badge badge-present" : "badge badge-absent"}>
                    <span className="dot" />
                    {person.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PreviewCard>

      <PreviewCard
        title="Dark Table"
        contentClassName=""
        code={`<table class="table-auto mb-0 w-full">
	<thead class="border border-[var(--border)]">
		<tr class="bg-dark text-white">
			<th class="px-4 py-2 text-start">Firstname</th>
			<th class="px-4 py-2 text-start">Email</th>
			<th class="px-4 py-2 text-start">Action</th>
		</tr>
	</thead>
	<tbody class="border border-[var(--border)]">
		<tr class="border-b border-[var(--border)] bg-dark text-white">
			<td class="inline-flex w-full items-center gap-2 px-4 py-3 text-start">
				<span class="relative flex shrink-0">
					<img class="w-8 h-8 border border-[var(--border)] rounded-full" src="assets/img/avatars/avatar-18.jpg" alt="avatar">
					<span class="bottom-0 end-0.5 absolute size-2 bg-success border border-white rounded-full"></span>
				</span>
				<span class="text-white">Mary</span>
			</td>
			<td class="px-4 py-3 text-white">john@example.com</td>
			<td class="px-4 py-3 text-white">
				<div class="hs-dropdown relative inline-flex">
					<button type="button" class="hs-dropdown-toggle cursor-pointer size-8 rounded-full inline-flex items-center justify-center text-sm font-normal border border-[var(--border)] bg-[var(--card)] c-text" aria-label="Dropdown">
						<i class="icon icon-more-vertical"></i>
					</button>
					<div class="hs-dropdown-menu min-w-50 bg-[var(--card)] border border-[var(--border)] rounded-lg mt-2 z-50 hidden">
						<div class="p-2 space-y-1">
							<a class="dropdown-item" href="#">View Details</a>
							<a class="dropdown-item" href="#">Edit</a>
							<a class="dropdown-item" href="#">Delete</a>
						</div>
					</div>
				</div>
			</td>
		</tr>
	</tbody>
</table>`}
      >
        <table className="table-auto mb-0 w-full">
          <thead className="border border-[var(--border)]">
            <tr className="bg-dark text-white">
              <th className="px-4 py-2 text-start">Firstname</th>
              <th className="px-4 py-2 text-start">Email</th>
              <th className="px-4 py-2 text-start">Action</th>
            </tr>
          </thead>
          <tbody className="border border-[var(--border)]">
            {PEOPLE.map((person) => (
              <tr key={person.name} className={`${ROW} bg-dark text-white`}>
                <td className={DARK_AVATAR_CELL}>
                  <Avatar src={person.avatar} />
                  <span className="text-white">{person.name}</span>
                </td>
                <td className="px-4 py-3 text-white">{person.email}</td>
                <td className="px-4 py-3 text-white">
                  <RowDropdown />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PreviewCard>

      <PreviewCard
        title="Bordered Table"
        code={`<table class="table-auto mb-0 w-full">
	<thead class="border border-[var(--border)]">
		<tr>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Firstname</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Email</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Action</th>
		</tr>
	</thead>
	<tbody class="border border-[var(--border)]">
		<tr class="border border-[var(--border)]">
			<td class="border border-[var(--border)] px-4 py-3 text-start">John</td>
			<td class="border border-[var(--border)] px-4 py-3 text-start">john@example.com</td>
			<td class="border border-[var(--border)] px-4 py-3 text-start">
				<button type="button" class="btn-small bg-[var(--surface)] border border-[var(--border)] c-text text-center">View</button>
			</td>
		</tr>
	</tbody>
</table>`}
      >
        <table className="table-auto mb-0 w-full">
          <thead className="border border-[var(--border)]">
            <tr>
              <th className={HEAD_CELL}>Firstname</th>
              <th className={HEAD_CELL}>Email</th>
              <th className={HEAD_CELL}>Action</th>
            </tr>
          </thead>
          <tbody className="border border-[var(--border)]">
            {PLAIN_ROWS.map((row) => (
              <tr key={row.name} className="border border-[var(--border)]">
                <td className={BORDERED_CELL}>{row.name}</td>
                <td className={BORDERED_CELL}>{row.email}</td>
                <td className={BORDERED_CELL}>
                  <button
                    type="button"
                    className="btn-small bg-[var(--surface)] border border-[var(--border)] c-text text-center hover:bg-[var(--card2)] hover:c-text"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PreviewCard>

      <PreviewCard
        title="Striped Rows"
        code={`<table class="table-auto mb-0 w-full">
	<thead>
		<tr>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Firstname</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Lastname</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Action</th>
		</tr>
	</thead>
	<tbody>
		<tr class="bg-[var(--surface)]">
			<td class="px-4 py-3 text-start">John</td>
			<td class="px-4 py-3 text-start">john@example.com</td>
			<td class="px-4 py-3 text-start">
				<button type="button" class="btn-small flex items-center justify-center gap-1.5 bg-success border border-success text-white text-center">
					<i class="icon icon-download"></i>
					Success
				</button>
			</td>
		</tr>
	</tbody>
</table>`}
      >
        <table className="table-auto mb-0 w-full">
          <thead>
            <tr>
              <th className={HEAD_CELL}>Firstname</th>
              <th className={HEAD_CELL}>Lastname</th>
              <th className={HEAD_CELL}>Action</th>
            </tr>
          </thead>
          <tbody>
            {PLAIN_ROWS.map((row, index) => (
              <tr key={row.name} className={index % 2 === 0 ? "bg-[var(--surface)]" : ""}>
                <td className={CELL}>{row.name}</td>
                <td className={CELL}>{row.email}</td>
                <td className={CELL}>
                  <button
                    type="button"
                    className="btn-small flex items-center justify-center gap-1.5 cursor-pointer bg-success border border-success text-white text-center hover:bg-success-800 hover:text-white"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Success
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PreviewCard>

      <PreviewCard
        title="Actions Tables"
        code={`<table class="table-auto mb-0 w-full">
	<thead class="border border-[var(--border)]">
		<tr>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Firstname</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Email</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Action</th>
		</tr>
	</thead>
	<tbody class="border border-[var(--border)]">
		<tr class="border-b border-[var(--border)]">
			<td class="inline-flex items-center gap-2 px-4 py-3 text-start">
				<span class="relative flex shrink-0">
					<img class="w-8 h-8 border border-[var(--border)] rounded-full" src="assets/img/avatars/avatar-18.jpg" alt="avatar">
					<span class="bottom-0 end-0.5 absolute size-2 bg-success border border-white rounded-full"></span>
				</span>
				<span class="text-dark">Mary</span>
			</td>
			<td class="px-4 py-3 text-start">john@example.com</td>
			<td class="px-4 py-3 text-start flex gap-2">
				<button type="button" class="btn-small flex items-center justify-center badge-active rounded-full" aria-label="Edit">
					<i class="icon icon-square-pen"></i>
				</button>
				<button type="button" class="btn-small flex items-center justify-center badge-present rounded-full" aria-label="Download">
					<i class="icon icon-download"></i>
				</button>
				<button type="button" class="btn-small flex items-center justify-center badge-absent rounded-full" aria-label="Delete">
					<i class="icon icon-trash"></i>
				</button>
			</td>
		</tr>
	</tbody>
</table>`}
      >
        <table className="table-auto mb-0 w-full">
          <thead className="border border-[var(--border)]">
            <tr>
              <th className={HEAD_CELL}>Firstname</th>
              <th className={HEAD_CELL}>Email</th>
              <th className={HEAD_CELL}>Action</th>
            </tr>
          </thead>
          <tbody className="border border-[var(--border)]">
            {PEOPLE.map((person) => (
              <tr key={person.name} className={ROW}>
                <td className={AVATAR_CELL}>
                  <Avatar src={person.avatar} />
                  <span className="text-dark">{person.name}</span>
                </td>
                <td className={CELL}>{person.email}</td>
                <td className="px-4 py-3 text-start flex gap-2">
                  <button
                    type="button"
                    className="btn-small flex items-center justify-center badge-active rounded-full"
                    aria-label="Edit"
                  >
                    <SquarePen className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn-small flex items-center justify-center badge-present rounded-full"
                    aria-label="Download"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="btn-small flex items-center justify-center badge-absent rounded-full"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PreviewCard>

      <PreviewCard
        title="Button Tables"
        code={`<table class="table-auto mb-0 w-full">
	<thead class="border border-[var(--border)]">
		<tr>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Firstname</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Email</th>
			<th class="px-4 py-2 bg-[var(--surface)] c-text text-start">Action</th>
		</tr>
	</thead>
	<tbody class="border border-[var(--border)]">
		<tr class="border-b border-[var(--border)]">
			<td class="inline-flex items-center gap-2 px-4 py-3 text-start">
				<span class="relative flex shrink-0">
					<img class="w-8 h-8 border border-[var(--border)] rounded-full" src="assets/img/avatars/avatar-18.jpg" alt="avatar">
					<span class="bottom-0 end-0.5 absolute size-2 bg-success border border-white rounded-full"></span>
				</span>
				<span class="text-dark">Mary</span>
			</td>
			<td class="px-4 py-3 text-start">john@example.com</td>
			<td class="px-4 py-3 text-start">
				<button type="button" class="btn-small flex items-center justify-center gap-1.5 bg-danger border border-danger text-white text-center">
					<i class="icon icon-trash"></i>
					Delete
				</button>
			</td>
		</tr>
	</tbody>
</table>`}
      >
        <table className="table-auto mb-0 w-full">
          <thead className="border border-[var(--border)]">
            <tr>
              <th className={HEAD_CELL}>Firstname</th>
              <th className={HEAD_CELL}>Email</th>
              <th className={HEAD_CELL}>Action</th>
            </tr>
          </thead>
          <tbody className="border border-[var(--border)]">
            {PEOPLE.map((person) => (
              <tr key={person.name} className={ROW}>
                <td className={AVATAR_CELL}>
                  <Avatar src={person.avatar} />
                  <span className="text-dark">{person.name}</span>
                </td>
                <td className={CELL}>{person.email}</td>
                <td className={CELL}>
                  <button
                    type="button"
                    className="btn-small flex items-center justify-center gap-1.5 cursor-pointer bg-danger border border-danger text-white text-center hover:bg-danger-800 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PreviewCard>
    </div>
    {/* End grid */}
  </div>
);

export default TablesBasic;
