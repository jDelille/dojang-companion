// Full-screen shell for the public kiosk: no sidebar, header or staff navigation.
// One centered column that every kiosk screen sits in, so screens never set
// their own width. Same layout as Companion's app/(kiosk)/KioskShell.module.scss.

// The kiosk API only serves sample data outside production (src/server/kiosk-mock.ts),
// so say so on screen whenever it can be showing it.
const SHOWS_SAMPLE_DATA = process.env.NODE_ENV !== "production";

const KioskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="kiosk-shell @container flex min-h-dvh flex-col overflow-x-clip pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
      {SHOWS_SAMPLE_DATA && (
        <p className="border-b border-(--kiosk-line) px-5 py-4 text-[11px] text-(--kiosk-text-secondary)">
          Sample classes · Development preview, not connected to Odoo
        </p>
      )}
      <main className="mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[56rem] flex-1 flex-col rounded-3xl border border-(--kiosk-line) bg-(--kiosk-panel) px-5 py-5 @min-[540px]:my-8 @min-[540px]:px-14 @min-[540px]:py-10">
        {children}
      </main>
    </div>
  );
};

export default KioskLayout;
