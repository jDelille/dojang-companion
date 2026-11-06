// Full-screen shell for the public kiosk: no sidebar, header or staff navigation.
// One centered column that every kiosk screen sits in, so screens never set
// their own width. Same layout as Companion's app/(kiosk)/KioskShell.module.scss.
import styles from '@/views/kiosk/daniel/KioskShell.module.css';

const KioskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={`kiosk-shell ${styles.shell}`}>
      <main className={`kiosk-design-panel ${styles.main}`}>
        {children}
      </main>
    </div>
  );
};

export default KioskLayout;
