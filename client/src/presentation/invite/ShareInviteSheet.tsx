import { useEffect, useMemo, useRef, useState } from 'react';
import { shareInviteContent } from '@adapters/share/ShareAdapter';
import { createApiClient } from '@adapters/api/ApiClient';
import type { Invite } from '@domain/invite/inviteTypes';
import { resolveInviteError } from '@domain/invite/inviteErrors';
import {
  buildInviteLink,
  buildInviteShareMessage,
  formatInviteExpiry,
} from '@domain/invite/invitePresentation';
import { CreateInviteUseCase } from '@domain/invite/inviteUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { NavButton } from '../components/NavButton';
import styles from './ShareInviteSheet.module.css';

interface ShareInviteSheetProps {
  open: boolean;
  groupId: string;
  token: string;
  onClose: () => void;
}

export function ShareInviteSheet({ open, groupId, token, onClose }: ShareInviteSheetProps) {
  const { t, locale } = useI18n();
  const api = useMemo(() => createApiClient(), []);
  const createInvite = useMemo(() => new CreateInviteUseCase(api), [api]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setInvite(null);
      setError(null);
      setCopied(false);
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setLoading(true);
    createInvite
      .execute(groupId, token)
      .then(setInvite)
      .catch((err: unknown) => setError(resolveInviteError(err, t)))
      .finally(() => setLoading(false));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [createInvite, groupId, onClose, open, t, token]);

  if (!open) {
    return null;
  }

  const share = async () => {
    if (!invite) {
      return;
    }

    setSharing(true);
    setError(null);
    setCopied(false);

    try {
      const message = buildInviteShareMessage(invite, t);
      const link = buildInviteLink(invite.linkToken);
      const result = await shareInviteContent(message, link);
      setCopied(result === 'copied');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSharing(false);
    }
  };

  const copyCode = async () => {
    if (!invite) {
      return;
    }

    await navigator.clipboard.writeText(invite.code);
    setCopied(true);
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-invite-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="share-invite-title">{t('invite.share.title')}</h2>
          <NavButton ref={closeButtonRef} action="close" onClick={onClose} />
        </header>

        {loading && <p>{t('common.loading')}</p>}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {copied && !error && <p className={styles.success}>{t('invite.share.copied')}</p>}

        {invite && !loading && (
          <>
            <div className={styles.codeBlock}>
              <p className={styles.codeLabel}>{t('invite.share.codeLabel')}</p>
              <p className={styles.code}>{invite.code}</p>
            </div>

            <p className={styles.expiry}>
              {t('invite.share.expiresAt', {
                date: formatInviteExpiry(invite.expiresAt, locale),
              })}
            </p>

            <div className={styles.actions}>
              <Button fullWidth disabled={sharing} onClick={() => void share()}>
                {sharing ? t('common.loading') : t('invite.share.share')}
              </Button>
              <Button variant="secondary" fullWidth onClick={() => void copyCode()}>
                {t('invite.share.copyCode')}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
