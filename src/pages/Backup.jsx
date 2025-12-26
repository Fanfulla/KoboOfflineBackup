/**
 * Backup page - full backup wizard
 */

import { BackupWizard } from '../components/backup/BackupWizard.jsx';

export function Backup({ onComplete }) {
  return <BackupWizard onComplete={onComplete} />;
}
