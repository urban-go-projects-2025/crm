import { useEffect, useRef } from 'react';
import { sendActivityHeartbeat } from '../services/api';

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes of no input = Idle
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // Ping backend every 30 seconds
const DEBOUNCE_PING_WINDOW_MS = 22 * 1000; // Prevent multiple tabs from double-pinging

export function useActivityTracker(currentUser) {
  const lastActivityRef = useRef(Date.now());
  const isIdleRef = useRef(false);

  useEffect(() => {
    if (!currentUser) return;

    const userKey = currentUser.id || 'default';
    const LAST_PING_KEY = `omw_last_hb_${userKey}`;
    const LAST_ACT_KEY = `omw_last_act_${userKey}`;

    lastActivityRef.current = Date.now();
    isIdleRef.current = false;
    try {
      localStorage.setItem(LAST_ACT_KEY, String(Date.now()));
    } catch (e) {}

    // Send immediate initial ping on login/mount (if not sent by another tab in past 20s)
    const now = Date.now();
    const lastPing = parseInt(localStorage.getItem(LAST_PING_KEY) || '0', 10);
    if (now - lastPing >= DEBOUNCE_PING_WINDOW_MS) {
      try { localStorage.setItem(LAST_PING_KEY, String(now)); } catch (e) {}
      sendActivityHeartbeat('active').catch(() => {});
    }

    // Activity reset handler with throttle (max 1/sec)
    let throttleTimeout = null;
    const handleUserActivity = () => {
      const currentTime = Date.now();
      lastActivityRef.current = currentTime;
      isIdleRef.current = false;

      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000);
        try {
          localStorage.setItem(LAST_ACT_KEY, String(currentTime));
        } catch (e) {}
      }
    };

    // Tab visibility handler: when tab becomes active again, immediately update last activity
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentTime = Date.now();
        lastActivityRef.current = currentTime;
        isIdleRef.current = false;
        try {
          localStorage.setItem(LAST_ACT_KEY, String(currentTime));
        } catch (e) {}
      }
    };

    // Listen to user interactions
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat interval - sends active or idle status every 30s
    const heartbeatInterval = setInterval(() => {
      const currentTime = Date.now();

      // Check cross-tab activity: if user interacted in ANY open tab, they are not idle!
      let globalLastActivity = lastActivityRef.current;
      try {
        const storedAct = parseInt(localStorage.getItem(LAST_ACT_KEY) || '0', 10);
        if (storedAct > globalLastActivity) {
          globalLastActivity = storedAct;
        }
      } catch (e) {}

      const timeSinceLastActivity = currentTime - globalLastActivity;

      // Mark as idle only if there has been NO interaction across any CRM tab for > 2 mins
      if (timeSinceLastActivity > IDLE_TIMEOUT_MS) {
        isIdleRef.current = true;
      } else {
        isIdleRef.current = false;
      }

      // Multi-tab check: Skip ping if another tab of this user already pinged in this 30s window!
      const lastSentTime = parseInt(localStorage.getItem(LAST_PING_KEY) || '0', 10);
      if (currentTime - lastSentTime < DEBOUNCE_PING_WINDOW_MS) {
        return; // Another tab already handled this interval!
      }

      // Mark this tab as the sender for this window
      try {
        localStorage.setItem(LAST_PING_KEY, String(currentTime));
      } catch (e) {}

      const statusToSend = isIdleRef.current ? 'idle' : 'active';
      sendActivityHeartbeat(statusToSend).catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeatInterval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [currentUser?.id]);
}
