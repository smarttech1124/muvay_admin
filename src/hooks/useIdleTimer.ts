'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

const EVENTS = ['mousedown','mousemove','keydown','scroll','touchstart','click'];
const TIMEOUT_MS = 15 * 60 * 1000; // 15 min

export function useIdleTimer() {
  const { clearAuth, isAuthenticated } = useAuthStore();
  const timer = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (isAuthenticated) {
        clearAuth();
        window.location.replace('/login?reason=timeout');
      }
    }, TIMEOUT_MS);
  }, [clearAuth, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    reset();
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [isAuthenticated, reset]);
}
