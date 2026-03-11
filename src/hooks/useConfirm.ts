import { useState } from 'react';

export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; variant?: 'danger'|'warning' }>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  const confirm = (title: string, message: string, onConfirm: () => void, variant: 'danger'|'warning' = 'danger') =>
    setState({ open: true, title, message, onConfirm, variant });

  const close   = () => setState(s => ({ ...s, open: false }));
  const execute = () => { state.onConfirm(); close(); };

  return { ...state, confirm, close, execute };
}
