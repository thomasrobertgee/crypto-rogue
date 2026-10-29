/**
 * Smart Re-Engagement & Web Notification Scheduler
 *
 * Hooks into the browser/PWA Web Notifications API with permission checks.
 * Dispatches alerts for:
 * 1. Full Energy Cap (30/30 Energy restored).
 * 2. Idle Mining Patrol Rig hitting 100% capacity (uncollected Hashrate & Blueprints ready).
 * 3. Daily Server Reset (00:00 UTC - Daily Raids & Margin Call Tower attempts refreshed).
 *
 * Features seamless in-app fallback toasts if browser notifications are denied or unsupported.
 */

import { useMetaStore, MAX_ENERGY } from '../state/useMetaStore'
import { IDLE_RIG_CAP_HOURS, VIP_EXTRA_RIG_CAP_HOURS } from '../config/economy.config'

export interface AppNotification {
  id: string
  title: string
  body: string
  icon?: string
  tag: string
  timestamp: number
}

// Global in-app notification listeners for UI alert toasts
type NotificationListener = (notif: AppNotification) => void
const listeners = new Set<NotificationListener>()

export function subscribeToInAppNotifications(fn: NotificationListener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function dispatchInAppNotice(title: string, body: string, tag: string): void {
  const notif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    body,
    tag,
    timestamp: Date.now(),
  }
  listeners.forEach((cb) => {
    try {
      cb(notif)
    } catch {}
  })
}

/** Check if Web Notifications API is supported by the current environment. */
export function isWebNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/** Get current notification permission status. */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isWebNotificationsSupported()) return 'unsupported'
  return Notification.permission
}

/** Request Web Notification permission from the browser. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isWebNotificationsSupported()) {
    dispatchInAppNotice(
      'Notifications Unsupported',
      'This browser does not support Web Notifications. In-app alerts will be used.',
      'permission_status',
    )
    return false
  }

  try {
    const perm = await Notification.requestPermission()
    const granted = perm === 'granted'
    useMetaStore.getState().setNotificationsEnabled(granted)

    if (granted) {
      sendSystemNotification(
        '🔔 Notifications Enabled!',
        'You will receive tactical alerts for Full Energy, 100% Rig Capacity, and Daily Resets.',
        'welcome',
      )
    } else {
      dispatchInAppNotice(
        'Notifications Disabled',
        'Browser notifications blocked. Tactical alerts will appear as in-game notices.',
        'permission_denied',
      )
    }
    return granted
  } catch (err) {
    console.warn('Error requesting notification permission:', err)
    return false
  }
}

/** Send a system notification or fallback to in-app toast. */
export function sendSystemNotification(title: string, body: string, tag: string): void {
  const meta = useMetaStore.getState()
  const hasBrowserPerm = isWebNotificationsSupported() && Notification.permission === 'granted'

  if (meta.notificationsEnabled && hasBrowserPerm) {
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag,
        badge: '/favicon.ico',
      })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    } catch {
      // Fallback in case of restricted background context
      dispatchInAppNotice(title, body, tag)
    }
  } else {
    // In-app fallback toast
    dispatchInAppNotice(title, body, tag)
  }
}

/** Check re-engagement triggers: Full Energy, 100% Rig Patrol Cap, and 00:00 UTC Reset. */
export function checkAndTriggerReEngagementNotifications(): void {
  const meta = useMetaStore.getState()
  const now = Date.now()

  // 1. Full Energy Cap Check (30/30)
  meta.syncEnergy?.()
  const currentEnergy = meta.energy ?? MAX_ENERGY
  const lastEnergyNotice = meta.lastEnergyNotifiedTimestamp ?? 0
  const energyNoticeCooldownMs = 1000 * 60 * 60 // 1 hour cooldown between alerts

  if (currentEnergy >= MAX_ENERGY && now - lastEnergyNotice > energyNoticeCooldownMs) {
    sendSystemNotification(
      '⚡ Energy Recharged to Full (30/30)!',
      'Your trading stamina is at peak capacity. Jump into the next Rogue Run!',
      'full_energy',
    )
    useMetaStore.setState({ lastEnergyNotifiedTimestamp: now })
  }

  // 2. Idle Mining Patrol Rig 100% Capacity Check
  const lastPatrolNotice = meta.lastPatrolNotifiedTimestamp ?? 0
  const patrolNoticeCooldownMs = 1000 * 60 * 60 * 2 // 2 hours cooldown
  const lastClaim = meta.lastIdleClaimTimestamp ?? now
  const elapsedHours = (now - lastClaim) / (1000 * 3600)
  const capHours = IDLE_RIG_CAP_HOURS + (meta.isVipAdFree ? VIP_EXTRA_RIG_CAP_HOURS : 0)

  if (elapsedHours >= capHours && now - lastPatrolNotice > patrolNoticeCooldownMs) {
    sendSystemNotification(
      '⛏️ Mining Patrol Rig at 100% Capacity!',
      'Your mining rigs are overflowing with Hashrate and Blueprints. Claim them now in Camp!',
      'patrol_rig_full',
    )
    useMetaStore.setState({ lastPatrolNotifiedTimestamp: now })
  }

  // 3. Daily Server Reset Check (00:00 UTC)
  const todayUtcDate = new Date(now).toISOString().slice(0, 10)
  const lastNoticeDate = meta.lastDailyResetNoticeDate ?? ''

  if (lastNoticeDate && lastNoticeDate !== todayUtcDate) {
    sendSystemNotification(
      '🌅 Market Day Reset (00:00 UTC)!',
      'Daily Raids and Margin Call Tower tickets have reset. Claim today’s fresh rewards!',
      'daily_reset',
    )
    useMetaStore.setState({ lastDailyResetNoticeDate: todayUtcDate })
  } else if (!lastNoticeDate) {
    // Initial setup
    useMetaStore.setState({ lastDailyResetNoticeDate: todayUtcDate })
  }
}
