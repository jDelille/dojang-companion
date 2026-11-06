// Full-screen shell for the public kiosk: no sidebar, header or staff navigation.
// One centered column that every kiosk screen sits in, so screens never set
// their own width. Same layout as Companion's app/(kiosk)/KioskShell.module.scss.

const KioskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="kiosk-shell @container flex min-h-dvh flex-col overflow-x-clip pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]">
      <main className="kiosk-design-panel mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[56rem] flex-1 flex-col rounded-[18px] border border-(--kiosk-line) bg-(--kiosk-panel) px-5 py-5 @min-[540px]:my-8 @min-[540px]:px-14 @min-[540px]:py-10">
        {children}
      </main>
    </div>
  );
};

export default KioskLayout;
