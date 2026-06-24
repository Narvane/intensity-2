import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { createDefaultPendingInviteAdapter } from '@adapters/invite/PendingInvitePreferencesAdapter';
import { useSession } from '@app/SessionProvider';
import { useNavigation } from '@app/NavigationProvider';
import type { InvitePreview } from '@domain/invite/inviteTypes';
import { resolveInviteError } from '@domain/invite/inviteErrors';
import { formatInviteExpiry } from '@domain/invite/invitePresentation';
import {
  clearPendingInvite,
  hydratePendingInvite,
  normalizeInviteReturnPath,
  rememberPendingInvite,
} from '@domain/invite/pendingInvite';
import { AcceptInviteUseCase, ValidateInviteUseCase } from '@domain/invite/inviteUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { NavButton } from '../components/NavButton';
import styles from './InvitePreviewPage.module.css';

export function InvitePreviewPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session, loading: sessionLoading } = useSession();
  const { setNavigation } = useNavigation();
  const api = useMemo(() => createApiClient(), []);
  const pendingInvitePort = useMemo(() => createDefaultPendingInviteAdapter(), []);
  const validateInvite = useMemo(() => new ValidateInviteUseCase(api), [api]);
  const acceptInvite = useMemo(() => new AcceptInviteUseCase(api), [api]);

  const code = searchParams.get('code')?.trim().toUpperCase() ?? '';
  const linkToken = searchParams.get('t')?.trim() ?? '';

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingAccept, setAwaitingAccept] = useState(false);
  const autoAcceptStarted = useRef(false);

  const returnPath = normalizeInviteReturnPath(location.pathname, location.search);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = code
        ? await validateInvite.executeByCode(code)
        : linkToken
          ? await validateInvite.executeByLinkToken(linkToken)
          : null;

      if (!result) {
        setError(t('invite.errors.missingReference'));
        setPreview(null);
        return;
      }

      setPreview(result);
    } catch (err) {
      setPreview(null);
      setError(resolveInviteError(err, t));
    } finally {
      setLoading(false);
    }
  }, [code, linkToken, t, validateInvite]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    void hydratePendingInvite(pendingInvitePort).then((pending) => {
      if (pending?.awaitingAccept) {
        setAwaitingAccept(true);
      }
    });
  }, [pendingInvitePort]);

  const completeAccept = useCallback(
    async (invitePreview: InvitePreview) => {
      if (!session?.token || session.accessMode !== 'EXPERIENCES') {
        return false;
      }

      setAccepting(true);
      setError(null);

      try {
        const result = await acceptInvite.execute(invitePreview.inviteId, session.token);
        await clearPendingInvite(pendingInvitePort);
        setAwaitingAccept(false);
        await setNavigation({ groupId: result.groupId });
        navigate(`/groups/${result.groupId}/boxes`, { replace: true });
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.code === 'ALREADY_GROUP_MEMBER') {
          await clearPendingInvite(pendingInvitePort);
          setAwaitingAccept(false);
          await setNavigation({ groupId: invitePreview.groupId });
          navigate(`/groups/${invitePreview.groupId}/boxes`, { replace: true });
          return true;
        }
        setError(resolveInviteError(err, t));
        return false;
      } finally {
        setAccepting(false);
      }
    },
    [acceptInvite, navigate, pendingInvitePort, session, setNavigation, t],
  );

  useEffect(() => {
    if (
      autoAcceptStarted.current ||
      sessionLoading ||
      loading ||
      !preview ||
      !awaitingAccept ||
      session?.accessMode !== 'EXPERIENCES'
    ) {
      return;
    }

    autoAcceptStarted.current = true;
    void completeAccept(preview);
  }, [
    awaitingAccept,
    completeAccept,
    loading,
    preview,
    session?.accessMode,
    sessionLoading,
  ]);

  const goToAuth = (panel: 'experiences' | 'register') => {
    void rememberPendingInvite(pendingInvitePort, returnPath, true);
    setAwaitingAccept(true);
    navigate('/auth', { state: { returnTo: returnPath, panel } });
  };

  const accept = async () => {
    if (!preview) {
      return;
    }

    if (!session?.token || session.accessMode !== 'EXPERIENCES') {
      goToAuth('experiences');
      return;
    }

    await completeAccept(preview);
  };

  const canAccept = session?.accessMode === 'EXPERIENCES';
  const showAuthActions = !sessionLoading && !canAccept;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.accent}>{t('invite.preview.accent')}</p>
        <h1>{t('invite.preview.title')}</h1>
      </header>

      <section className={styles.panel}>
        {(loading || sessionLoading) && <p className={styles.message}>{t('common.loading')}</p>}

        {!loading && !sessionLoading && error && !preview && (
          <>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <Button variant="secondary" fullWidth onClick={() => navigate('/auth')}>
              {t('invite.preview.backToAuth')}
            </Button>
          </>
        )}

        {!loading && !sessionLoading && preview && (
          <>
            <p className={styles.membersTitle}>{t('invite.preview.membersTitle')}</p>
            <ul className={styles.members}>
              {preview.members.map((member) => (
                <li key={member.participantId}>{member.displayName}</li>
              ))}
            </ul>

            <p className={styles.expiry}>
              {t('invite.preview.expiresAt', {
                date: formatInviteExpiry(preview.expiresAt, locale),
              })}
            </p>

            {showAuthActions && (
              <p className={styles.authHint}>{t('invite.preview.authRequired')}</p>
            )}

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              {canAccept ? (
                <Button fullWidth disabled={accepting} onClick={() => void accept()}>
                  {accepting ? t('common.loading') : t('invite.preview.accept')}
                </Button>
              ) : (
                <>
                  <Button fullWidth onClick={() => goToAuth('experiences')}>
                    {t('invite.preview.signInToAccept')}
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => goToAuth('register')}>
                    {t('invite.preview.registerToAccept')}
                  </Button>
                </>
              )}
              <NavButton
                action="back"
                fullWidth
                onClick={() => navigate('/auth')}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
