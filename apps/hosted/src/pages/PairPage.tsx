import { useEffect, useState, useCallback } from 'react';
import { Button, Spinner, StatusDot, Text } from '@var-ui/react';
import { IconDeviceTablet, IconRefresh } from '@tabler/icons-react';
import { apiClient, ApiError } from '../services/apiClient';
import { persistDisplayId } from '../displayPersistence';
import type { PairCreateResponse, PairStatusResponse } from '../types/api';
import { kioskCard as s } from './KioskCard.styles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const POLL_INTERVAL_MS = 2000;

export function PairPage() {
  useDocumentTitle('Pair this tablet');
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'pending' | 'expired' | 'claimed'>('loading');

  const fetchStatus = useCallback(async (c: string) => {
    const data = await apiClient.get<PairStatusResponse>('/api/pair', {
      query: { code: c },
    });
    if (data.status === 'claimed' && data.displayId) {
      setStatus('claimed');
      persistDisplayId(data.displayId);
      window.location.href = `/?display=${data.displayId}`;
      return;
    }
    if (data.status === 'expired') setStatus('expired');
    else if (data.status === 'invalid') setStatus('expired');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function createPairing() {
      try {
        const data = await apiClient.post<PairCreateResponse>('/api/pair');
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setStatus('expired');
          return;
        }
        if (data.code) {
          setCode(data.code);
          setStatus('pending');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to get pairing code');
          setStatus('expired');
        }
      }
    }

    createPairing();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (status !== 'pending' || !code) return;
    const t = setInterval(() => fetchStatus(code), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [status, code, fetchStatus]);

  if (status === 'loading' && !code) {
    return (
      <main className={s.screen} data-color-mode="dark">
        <div className={s.card} aria-busy="true">
          <Spinner size="lg" label="Getting a pairing code" />
          <Text tone="secondary">Getting a pairing code…</Text>
        </div>
      </main>
    );
  }

  if (status === 'expired' || error) {
    return (
      <main className={s.screen} data-color-mode="dark">
        <div className={s.card}>
          <span className={s.iconBadge}>
            <IconDeviceTablet size={30} stroke={1.5} aria-hidden />
          </span>
          <h1 className={s.title}>{error ? 'We couldn’t get a code' : 'This code expired'}</h1>
          <Text tone="secondary" className={s.body}>
            {error ?? 'Codes last 15 minutes. Get a fresh one and enter it in Homeslate.'}
          </Text>
          <Button tone="accent" appearance="solid" size="lg" onClick={() => window.location.reload()} className={s.fullWidth}>
            <IconRefresh size={18} aria-hidden />
            Get a new code
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className={s.screen} data-color-mode="dark">
      <div className={s.card} data-wide="">
        <span className={s.iconBadge}>
          <IconDeviceTablet size={30} stroke={1.5} aria-hidden />
        </span>
        <h1 className={s.title}>Pair this tablet</h1>
        <Text tone="secondary" className={s.body}>
          On your phone or laptop, open Homeslate → Displays → <strong>Pair a tablet</strong>, and enter:
        </Text>
        {/* Read off the wall from across the room; nothing to copy on the tablet itself. */}
        <p className={s.code} aria-label={`Pairing code ${code?.split('').join(' ')}`}>
          {code}
        </p>
        <p className={s.status} role="status">
          <StatusDot tone="accent" pulse aria-hidden />
          Waiting for you to enter the code · expires in 15 minutes
        </p>
      </div>
    </main>
  );
}
