'use client'

import { formatTimeAgo } from '@/lib/date'
import { RefreshCw, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface EventSyncStatusProps {
  lastSyncedAt?: string
}

export default function EventSyncStatus({ lastSyncedAt }: EventSyncStatusProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [localLastSynced, setLocalLastSynced] = useState(lastSyncedAt)

  const isDevelopment = process.env.NODE_ENV === 'development'

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncError(null)
    setSyncSuccess(false)

    try {
      const response = await fetch('/api/events/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync events')
      }

      // Update local state with new sync time
      setLocalLastSynced(new Date().toISOString())
      setSyncSuccess(true)

      // In development, just show success message without refresh to avoid HMR conflicts
      // In production, use window.location.reload() to update the page
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncError(error instanceof Error ? error.message : 'Failed to sync events')
    } finally {
      setIsSyncing(false)
    }
  }

  const displaySyncTime = localLastSynced || lastSyncedAt

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {displaySyncTime ? (
            <span>Events last synced: {formatTimeAgo(displaySyncTime)}</span>
          ) : (
            <span>Events not yet synced</span>
          )}
        </div>

        {isDevelopment && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {syncError && (
        <div className="mt-2 text-sm text-red-600">
          {syncError}
        </div>
      )}

      {syncSuccess && (
        <div className="mt-2 text-sm text-green-600 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1.5" />
          <span>
            Events synced successfully!
            {isDevelopment && ' Refresh the page to see updates.'}
          </span>
        </div>
      )}
    </div>
  )
}
