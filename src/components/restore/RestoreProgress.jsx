/**
 * Restore progress screen
 */

import { Card } from '../common/Card.jsx';
import { CircularProgress } from '../common/CircularProgress.jsx';
import { Icon } from '../common/Icon.jsx';

export function RestoreProgress({ progress }) {
  const { stage, percent, filesProcessed, totalFiles } = progress;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <h2 className="text-3xl font-bold text-kobo-dark mb-8">
          Restoring Your Library
        </h2>

        {/* Circular Progress */}
        <div className="mb-8 flex justify-center">
          <CircularProgress percent={percent} size={200} />
        </div>

        {/* Current Stage */}
        <p className="text-xl font-semibold text-kobo-dark mb-8">
          {stage || 'Preparing...'}
        </p>

        {/* Files Progress */}
        {filesProcessed !== undefined && totalFiles > 0 && (
          <div className="mb-8">
            <p className="text-kobo-gray mb-2">Files Copied</p>
            <p className="text-2xl font-bold text-kobo-dark">
              {filesProcessed} / {totalFiles}
            </p>
          </div>
        )}

        {/* Stages */}
        <div className="space-y-3 mb-8">
          <StageItem
            text="Preparing device"
            status={percent >= 10 ? "completed" : percent > 0 ? "active" : "pending"}
          />
          <StageItem
            text="Copying database"
            status={percent >= 20 ? "completed" : percent > 10 ? "active" : "pending"}
          />
          <StageItem
            text="Transferring books"
            status={percent >= 90 ? "completed" : percent > 20 ? "active" : "pending"}
          />
          <StageItem
            text="Restoring annotations"
            status={percent >= 95 ? "completed" : percent > 90 ? "active" : "pending"}
          />
          <StageItem
            text="Finalizing"
            status={percent >= 100 ? "completed" : percent > 95 ? "active" : "pending"}
          />
        </div>

        {/* Critical Warning */}
        <div className="p-4 bg-kobo-error/10 border-2 border-kobo-error/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon type="alert" className="text-kobo-error flex-shrink-0" />
            <p className="text-sm font-semibold text-kobo-error text-left">
              DO NOT disconnect your Kobo until complete!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StageItem({ text, status }) {
  return (
    <div className={`flex items-center gap-3 ${status === 'pending' ? 'opacity-50' : ''}`}>
      {status === 'completed' && <Icon type="check" size={20} className="text-kobo-success" />}
      {status === 'active' && (
        <div className="w-5 h-5 border-2 border-kobo-accent border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'pending' && <div className="w-5 h-5 border-2 border-kobo-gray-light rounded-full opacity-30" />}
      <span className="text-kobo-dark">{text}</span>
    </div>
  );
}
