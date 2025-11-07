'use client'

import { useState } from 'react'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'

export function GoogleDriveSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'success' | 'error'
    message?: string
    stats?: {
      driveResources: number
      manualResources: number
      totalResources: number
    }
  }>({ type: 'idle' })

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncStatus({ type: 'idle' })

    try {
      const response = await fetch('/api/resources/google-drive-sync', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSyncStatus({
          type: 'success',
          message: data.message,
          stats: data.stats
        })

        // Reload the page after successful sync to show new resources
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setSyncStatus({
          type: 'error',
          message: data.error || 'Sync failed'
        })
      }
    } catch {
      setSyncStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync from Google Drive'}
      </button>

      {syncStatus.type !== 'idle' && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm max-w-sm ${
          syncStatus.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {syncStatus.type === 'success' ? (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <div>{syncStatus.message}</div>
            {syncStatus.stats && (
              <div className="mt-1 text-xs">
                Google Drive: {syncStatus.stats.driveResources} |
                Manual: {syncStatus.stats.manualResources} |
                Total: {syncStatus.stats.totalResources}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}