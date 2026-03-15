/**
 * Backup progress screen with circular progress
 */

import PropTypes from 'prop-types';
import { Card } from '../common/Card.jsx';
import { CircularProgress } from '../common/CircularProgress.jsx';
import { Icon } from '../common/Icon.jsx';
import { Button } from '../common/Button.jsx';

export function BackupProgress({ progress, error, onRetry }) {
  const { stage, percent, filesProcessed, totalFiles } = progress;

  // Error state — show clearly instead of silently going back
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Icon type="alert" size={32} className="text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-kobo-dark mb-3">Backup Failed</h2>
          <p className="text-kobo-gray mb-2 text-sm">
            The backup could not be completed. Error details:
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-800 text-sm font-mono break-words">{error}</p>
          </div>
          <p className="text-kobo-gray text-sm mb-6">
            If you have a large library (&gt;2 GB), try closing other browser tabs to free memory,
            then retry. Open the browser console (F12) for more details.
          </p>
          <Button onClick={onRetry}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <h2 className="text-3xl font-display text-kobo-dark mb-8">
          Creating Backup
        </h2>

        {/* Circular Progress */}
        <div className="mb-8 flex justify-center">
          <CircularProgress percent={percent} size={200} />
        </div>

        {/* Current Stage */}
        <p className="text-lg font-body text-kobo-dark mb-2">
          {stage || 'Processing...'}
        </p>

        {/* File counter */}
        {filesProcessed !== undefined && totalFiles > 0 && (
          <div className="mb-8 text-center">
            <p className="text-sm font-body text-kobo-gray mb-1">Files</p>
            <p className="text-lg font-body text-kobo-dark">
              {filesProcessed} / {totalFiles}
            </p>
          </div>
        )}

        {/* Stages List */}
        <div className="space-y-3 mb-8">
          <StageItem
            text="Reading book files"
            status={percent >= 20 ? 'completed' : percent > 0 ? 'active' : 'pending'}
          />
          <StageItem
            text="Streaming books to archive"
            status={percent >= 82 ? 'completed' : percent > 20 ? 'active' : 'pending'}
          />
          <StageItem
            text="Adding metadata"
            status={percent >= 92 ? 'completed' : percent > 82 ? 'active' : 'pending'}
          />
          <StageItem
            text="Saving backup"
            status={percent >= 100 ? 'completed' : percent > 92 ? 'active' : 'pending'}
          />
        </div>

        {/* Warning */}
        <div className="p-4 bg-kobo-warning/10 border border-kobo-warning/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon type="alert" className="text-kobo-warning flex-shrink-0" />
            <p className="text-sm font-body text-kobo-gray text-left">
              Keep this window open until the backup is complete
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

BackupProgress.propTypes = {
  progress: PropTypes.object.isRequired,
  error: PropTypes.string,
  onRetry: PropTypes.func,
};

function StageItem({ text, status }) {
  const icons = {
    completed: 'check',
    active: 'loading',
    pending: 'loading',
  };

  const colors = {
    completed: 'text-kobo-success',
    active: 'text-kobo-accent',
    pending: 'text-kobo-gray-light',
  };

  return (
    <div className={`flex items-center gap-3 ${status === 'pending' ? 'opacity-50' : ''}`}>
      {status === 'completed' && <Icon type="check" size={20} className="text-kobo-success" />}
      {status === 'active' && (
        <div className="w-5 h-5 border-2 border-kobo-accent border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'pending' && <div className="w-5 h-5 border-2 border-kobo-gray-light rounded-full opacity-30" />}
      <span className="font-body text-base text-kobo-dark">{text}</span>
    </div>
  );
}
