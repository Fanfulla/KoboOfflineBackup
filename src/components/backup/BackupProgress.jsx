/**
 * Backup progress screen with circular progress
 */

import { Card } from '../common/Card.jsx';
import { CircularProgress } from '../common/CircularProgress.jsx';
import { Icon } from '../common/Icon.jsx';

export function BackupProgress({ progress }) {
  const { stage, percent, filesProcessed, totalFiles, speed, eta } = progress;

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

        {/* Progress Details */}
        {filesProcessed !== undefined && totalFiles > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div>
              <p className="text-sm font-body text-kobo-gray mb-1">Files</p>
              <p className="text-lg font-body text-kobo-dark">
                {filesProcessed} / {totalFiles}
              </p>
            </div>
            {speed && (
              <div>
                <p className="text-sm font-body text-kobo-gray mb-1">Speed</p>
                <p className="text-lg font-body text-kobo-dark">
                  {speed}
                </p>
              </div>
            )}
            {eta && (
              <div>
                <p className="text-sm font-body text-kobo-gray mb-1">Time Remaining</p>
                <p className="text-lg font-body text-kobo-dark">
                  {eta}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stages List */}
        <div className="space-y-3 mb-8">
          <StageItem
            text="Reading book files"
            status={percent >= 20 ? "completed" : percent > 0 ? "active" : "pending"}
          />
          <StageItem
            text="Compressing books"
            status={percent >= 70 ? "completed" : percent > 20 ? "active" : "pending"}
          />
          <StageItem
            text="Adding metadata"
            status={percent >= 80 ? "completed" : percent > 70 ? "active" : "pending"}
          />
          <StageItem
            text="Creating archive"
            status={percent >= 95 ? "completed" : percent > 80 ? "active" : "pending"}
          />
          <StageItem
            text="Saving backup"
            status={percent >= 100 ? "completed" : percent > 95 ? "active" : "pending"}
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
