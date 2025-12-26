/**
 * Restore page - wrapper for the restore wizard
 */

import { RestoreWizard } from '../components/restore/RestoreWizard.jsx';

export function Restore({ onComplete }) {
  return <RestoreWizard onComplete={onComplete} />;
}
