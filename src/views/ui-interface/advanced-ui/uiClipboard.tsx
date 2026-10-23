import { useCallback, useRef, useState, type ReactNode } from "react";
import { Clipboard, Scissors } from "lucide-react";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

const DEFAULT_URL = "http://www.admin-dashboard.com";
const DEFAULT_TEXTAREA =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit...";

const PRIMARY_BTN =
  "btn inline-flex items-center bg-primary border border-primary text-white text-center hover:bg-primary-900 hover:border-primary-900 hover:text-white";
const GHOST_BTN =
  "btn inline-flex items-center bg-[var(--surface)] border border-[var(--border)] c-text text-center hover:bg-[var(--card2)]";
const WARNING_BTN =
  "btn inline-flex items-center bg-warning border border-warning text-white text-center hover:bg-warning-900 hover:border-warning-900 hover:text-white";

type PreviewCardProps = {
  title: ReactNode;
  children: ReactNode;
  code: string;
};

const PreviewCard = ({ title, children, code }: PreviewCardProps) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName="preview-card glass-card p-5"
    contentClassName="clipboard"
  >
    {children}
  </PreviewCodeToggle>
);

const UiClipboard = () => {
  const [inputOne, setInputOne] = useState(DEFAULT_URL);
  const [inputTwo, setInputTwo] = useState(DEFAULT_URL);
  const [textarea, setTextarea] = useState(DEFAULT_TEXTAREA);
  const [copied, setCopied] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((key: string) => {
    setCopied(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(null), 1500);
  }, []);

  const copy = useCallback(
    async (key: string, text: string) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        flash(key);
      } catch {
        // Clipboard unavailable (insecure context or denied permission).
      }
    },
    [flash],
  );

  const cut = useCallback(
    async (key: string, text: string, clear: () => void) => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        clear();
        flash(key);
      } catch {
        // Clipboard unavailable (insecure context or denied permission).
      }
    },
    [flash],
  );

  const label = (key: string, fallback: string) =>
    copied === key ? "Copied!" : fallback;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Clipboard</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Copy from Input */}
        <PreviewCard
          title={<h2 className="text-lg font-bold c-text mb-0">Copy from input</h2>}
          code={`<form class="form-horizontal">
	<label for="input-copy" class="set-label">Input URL</label>
	<input type="text" id="input-copy" class="fp-input block w-full py-2.5 text-sm mb-4" value="http://www.admin-dashboard.com">
	<div class="flex flex-wrap align-items-center gap-2">
		<button type="button" class="btn inline-flex items-center bg-primary border border-primary text-white text-center" data-clipboard-target="#input-copy">
			<i class="icon icon-clipboard me-1"></i> Copy from Input
		</button>
		<button type="button" class="btn inline-flex items-center bg-[var(--surface)] border border-[var(--border)] c-text text-center" data-clipboard-action="cut" data-clipboard-target="#input-copy">
			<i class="icon icon-scissors me-1"></i> Cut from Input
		</button>
	</div>
</form>`}
        >
          <form className="form-horizontal">
            <label htmlFor="input-copy" className="set-label">
              Input URL
            </label>
            <input
              type="text"
              id="input-copy"
              className="fp-input block w-full py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none mb-4"
              value={inputOne}
              onChange={(event) => setInputOne(event.target.value)}
            />
            <div className="flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={() => copy("input-copy", inputOne)}
              >
                <Clipboard className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("input-copy", "Copy from Input")}
              </button>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => cut("input-cut", inputOne, () => setInputOne(""))}
              >
                <Scissors className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("input-cut", "Cut from Input")}
              </button>
            </div>
          </form>
        </PreviewCard>
        {/* end card */}

        {/* Card 2: Copy from Input (second example) */}
        <PreviewCard
          title={<h3 className="text-lg font-bold c-text mb-0">Copy from input</h3>}
          code={`<form class="form-horizontal">
	<label for="input-copy2" class="set-label">Input URL</label>
	<input type="text" id="input-copy2" class="fp-input block w-full py-2.5 text-sm mb-4" value="http://www.admin-dashboard.com">
	<div class="flex flex-wrap align-items-center gap-2">
		<button type="button" class="btn inline-flex items-center bg-primary border border-primary text-white text-center" data-clipboard-target="#input-copy2">
			<i class="icon icon-clipboard me-1"></i> Copy from Input
		</button>
		<button type="button" class="btn inline-flex items-center bg-[var(--surface)] border border-[var(--border)] c-text text-center" data-clipboard-action="cut" data-clipboard-target="#input-copy2">
			<i class="icon icon-scissors me-1"></i> Cut from Input
		</button>
	</div>
</form>`}
        >
          <form className="form-horizontal">
            <label htmlFor="input-copy2" className="set-label">
              Input URL
            </label>
            <input
              type="text"
              id="input-copy2"
              className="fp-input block w-full py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none mb-4"
              value={inputTwo}
              onChange={(event) => setInputTwo(event.target.value)}
            />
            <div className="flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={() => copy("input-copy2", inputTwo)}
              >
                <Clipboard className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("input-copy2", "Copy from Input")}
              </button>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => cut("input-cut2", inputTwo, () => setInputTwo(""))}
              >
                <Scissors className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("input-cut2", "Cut from Input")}
              </button>
            </div>
          </form>
        </PreviewCard>
        {/* end card */}

        {/* Card 3: Copy from Text Area */}
        <PreviewCard
          title={
            <h4 className="text-lg font-bold c-text mb-0">Copy from Text Area</h4>
          }
          code={`<form class="form-horizontal">
	<label for="textarea-copy" class="set-label">Text Area</label>
	<textarea id="textarea-copy" class="fp-input block w-full py-2.5 text-sm mb-4" rows="3">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</textarea>
	<div class="flex flex-wrap align-items-center gap-2">
		<button type="button" class="btn inline-flex items-center bg-primary border border-primary text-white text-center" data-clipboard-target="#textarea-copy">
			<i class="icon icon-clipboard me-1"></i> Copy from Input
		</button>
		<button type="button" class="btn inline-flex items-center bg-[var(--surface)] border border-[var(--border)] c-text text-center" data-clipboard-action="cut" data-clipboard-target="#textarea-copy">
			<i class="icon icon-scissors me-1"></i> Cut from Input
		</button>
	</div>
</form>`}
        >
          <form className="form-horizontal">
            <label htmlFor="textarea-copy" className="set-label">
              Text Area
            </label>
            <textarea
              id="textarea-copy"
              className="fp-input block w-full py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none mb-4"
              rows={3}
              value={textarea}
              onChange={(event) => setTextarea(event.target.value)}
            />
            <div className="flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={() => copy("textarea-copy", textarea)}
              >
                <Clipboard className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("textarea-copy", "Copy from Input")}
              </button>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() =>
                  cut("textarea-cut", textarea, () => setTextarea(""))
                }
              >
                <Scissors className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("textarea-cut", "Cut from Input")}
              </button>
            </div>
          </form>
        </PreviewCard>
        {/* end card */}

        {/* Card 4: Copy Text from Paragraph */}
        <PreviewCard
          title={
            <h5 className="text-lg font-bold c-text mb-0">
              Copy Text from Paragraph
            </h5>
          }
          code={`<form class="form-horizontal">
	<p class="mb-1 c-text text-sm">Here is your OTP <span id="paragraph-copy1">22991</span>.</p>
	<p class="mb-4 c-text text-sm">Please do not share it to anyone</p>
	<div class="flex flex-wrap align-items-center gap-2">
		<button type="button" class="btn inline-flex items-center bg-primary border border-primary text-white text-center" data-clipboard-target="#paragraph-copy1">
			<i class="icon icon-clipboard me-1"></i> Copy from Input
		</button>
	</div>
</form>`}
        >
          <form className="form-horizontal">
            <p className="mb-1 c-text text-sm">
              Here is your OTP <span id="paragraph-copy1">22991</span>.
            </p>
            <p className="mb-4 c-text text-sm">Please do not share it to anyone</p>
            <div className="flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={() => copy("paragraph-copy1", "22991")}
              >
                <Clipboard className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("paragraph-copy1", "Copy from Input")}
              </button>
            </div>
          </form>
        </PreviewCard>
        {/* end card */}

        {/* Card 5: Copy Hidden Text (Advanced) */}
        <PreviewCard
          title={
            <h5 className="text-lg font-bold c-text mb-0">
              Copy Hidden Text (Advanced)
            </h5>
          }
          code={`<form class="form-horizontal">
	<p class="mb-4 c-text text-sm">Link -> <span id="advanced-paragraph">http://www.example.com/example</span></p>
	<div class="flex flex-wrap align-items-center gap-2">
		<button type="button" class="btn inline-flex items-center bg-primary border border-primary text-white text-center" data-clipboard-target="#advanced-paragraph">
			<i class="icon icon-clipboard me-1"></i> Copy from Input
		</button>
		<button type="button" class="btn inline-flex items-center bg-warning border border-warning text-white text-center" data-clipboard-text="2291">
			<i class="icon icon-clipboard me-1"></i> Copy Hidden Code
		</button>
	</div>
</form>`}
        >
          <form className="form-horizontal">
            <p className="mb-4 c-text text-sm">
              Link -&gt;{" "}
              <span id="advanced-paragraph">http://www.example.com/example</span>
            </p>
            <div className="flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={() =>
                  copy("advanced-paragraph", "http://www.example.com/example")
                }
              >
                <Clipboard className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("advanced-paragraph", "Copy from Input")}
              </button>
              <button
                type="button"
                className={WARNING_BTN}
                onClick={() => copy("hidden-code", "2291")}
              >
                <Clipboard className="w-4 h-4 me-1" aria-hidden="true" />{" "}
                {label("hidden-code", "Copy Hidden Code")}
              </button>
            </div>
          </form>
        </PreviewCard>
        {/* end card */}
      </div>
      {/* end grid */}
    </div>
  );
};

export default UiClipboard;
