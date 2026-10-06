'use client';
// Client-only: document-level listeners.

import { useEffect, useEffectEvent, type RefObject } from 'react';

export type DismissReason = 'escape' | 'outside';

/**
 * Calls `onDismiss` when, while `open`, the user presses Escape or presses outside `containerRef`.
 * For non-modal popovers; modal overlays use `useModalFocus`.
 */
export function useDismiss(
  open: boolean,
  onDismiss: (reason: DismissReason) => void,
  containerRef: RefObject<HTMLElement | null>,
): void {
  const handleDismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const container = containerRef.current;
      if (container && event.target instanceof Node && !container.contains(event.target)) {
        handleDismiss('outside');
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleDismiss('escape');
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, containerRef]);
}
