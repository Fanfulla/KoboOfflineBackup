/**
 * Backup history page
 */

import { useState } from 'react';
import { useKoboStore } from '../stores/koboStore.js';
import { Container } from '../components/layout/Container.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { formatBytes, formatDate } from '../utils/formatters.js';

export function History({ onNavigate }) {
  const backups = useKoboStore((state) => state.backups);
  const removeBackup = useKoboStore((state) => state.removeBackup);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, backup: null });

  const handleDelete = (backup) => {
    setDeleteModal({ isOpen: true, backup });
  };

  const confirmDelete = () => {
    if (deleteModal.backup) {
      removeBackup(deleteModal.backup.id);
    }
    setDeleteModal({ isOpen: false, backup: null });
  };

  const handleRestore = (backup) => {
    // Navigate to restore page
    // In a real implementation, you might want to pre-load the backup file
    if (onNavigate) {
      onNavigate('restore');
    }
  };

  if (backups.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <div className="w-24 h-24 bg-kobo-gray-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon type="history" size={48} className="text-kobo-gray-light" />
              </div>

              <h2 className="text-3xl font-bold text-kobo-dark mb-4">
                No Backup History
              </h2>

              <p className="text-lg text-kobo-gray mb-8">
                You haven't created any backups yet. Create your first backup to keep your Kobo library safe.
              </p>

              <Button
                size="lg"
                variant="primary"
                onClick={() => onNavigate && onNavigate('backup')}
              >
                <Icon type="backup" size={20} />
                Create Backup
              </Button>
            </Card>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-kobo-dark mb-2">
              Backup History
            </h1>
            <p className="text-lg text-kobo-gray">
              View and manage your Kobo library backups
            </p>
          </div>

          {/* Backup List */}
          <div className="space-y-4">
            {backups.map((backup) => (
              <BackupCard
                key={backup.id}
                backup={backup}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            ))}
          </div>

          {/* Info Section */}
          <Card className="mt-8 bg-kobo-info/10 border-2 border-kobo-info/20">
            <div className="flex items-start gap-3">
              <Icon type="info" className="text-kobo-info flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-kobo-dark mb-2">
                  Backup Best Practices
                </h4>
                <ul className="text-sm text-kobo-gray space-y-1 list-disc list-inside">
                  <li>Create regular backups, especially before device updates</li>
                  <li>Store backups in multiple locations (cloud + external drive)</li>
                  <li>Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite</li>
                  <li>Verify backups can be restored periodically</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, backup: null })}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-kobo-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon type="alert" size={32} className="text-kobo-error" />
          </div>

          <h3 className="text-2xl font-bold text-kobo-dark mb-2">
            Delete Backup?
          </h3>

          <p className="text-kobo-gray mb-6">
            Are you sure you want to remove this backup from your history? This action cannot be undone.
          </p>

          {deleteModal.backup && (
            <div className="p-4 bg-kobo-cream-dark rounded-lg mb-6 text-left">
              <p className="text-sm text-kobo-gray mb-1">Backup File</p>
              <p className="font-semibold text-kobo-dark">
                {deleteModal.backup.filename}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false, backup: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <Icon type="trash" size={16} />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function BackupCard({ backup, onDelete, onRestore }) {
  return (
    <Card variant="elevated">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Backup Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-kobo-accent to-kobo-accent-dark rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon type="backup" size={32} className="text-white" />
        </div>

        {/* Backup Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-kobo-dark mb-1 truncate">
            {backup.filename}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-kobo-gray">
            <span className="flex items-center gap-1">
              <Icon type="calendar" size={14} />
              {formatDate(backup.created)}
            </span>
            <span className="flex items-center gap-1">
              <Icon type="database" size={14} />
              {formatBytes(backup.size)}
            </span>
            <span className="flex items-center gap-1">
              <Icon type="book" size={14} />
              {backup.bookCount} books
            </span>
            {backup.annotationCount > 0 && (
              <span className="flex items-center gap-1">
                <Icon type="note" size={14} />
                {backup.annotationCount} annotations
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onRestore(backup)}
            title="Restore this backup"
          >
            <Icon type="restore" size={16} />
            Restore
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(backup)}
            title="Remove from history"
          >
            <Icon type="trash" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
