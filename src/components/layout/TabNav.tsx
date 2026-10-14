import type { ViewRange } from '../../types/ViewRange';
import styles from './TabNav.module.css';

interface Tab {
  id: ViewRange;
  label: string;
}

const TABS: Tab[] = [
  { id: 'day',     label: 'Today' },
  { id: '7d',      label: '7 Days' },
  { id: 'quarter', label: 'Quarter' },
];

interface Props {
  active: ViewRange;
  onChange: (range: ViewRange) => void;
}

export function TabNav({ active, onChange }: Props) {
  return (
    <nav className={styles.nav} role="tablist" aria-label="Time range">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
