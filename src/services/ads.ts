import { useMetaStore } from '../state/useMetaStore'

/**
 * Rewarded ad service stub. Replace with AdMob (Capacitor) later.
 * VIP Ad-Free players skip the ad instantly.
 */
export function showRewardedAd(isVipAdFree: boolean): Promise<boolean> {
  return new Promise((resolve) =>
    setTimeout(() => {
      useMetaStore.getState().incrementSeasonMissionProgress('adsWatched', 1)
      resolve(true)
    }, isVipAdFree ? 150 : 1800),
  )
}
