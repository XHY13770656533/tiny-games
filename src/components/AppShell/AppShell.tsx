import { Outlet } from 'react-router-dom';
import styles from './AppShell.module.css';

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <Outlet />
    </div>
  );
}
