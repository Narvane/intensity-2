import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useSession } from '@app/SessionProvider';
import { useNavigation } from '@app/NavigationProvider';
import type { InvitePreview } from '@domain/convite/inviteTypes';
import { resolveInviteError } from '@domain/convite/inviteErrors';
import { formatInviteExpiry } from '@domain/convite/invitePresentation';
import { AcceptInviteUseCase, ValidateInviteUseCase } from '@domain/convite/inviteUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import styles from './InvitePreviewPage.module.css';

export function InvitePreviewPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session } = useSession();
  const { setNavigation } = useNavigation();
  const api = useMemo(() => createApiClient(), []);
  const validateInvite = useMemo(() => new ValidateInviteUseCase(api), [api]);
  const acceptInvite = useMemo(() => new AcceptInviteUseCase(api), [api]);

  const code = searchParams.get('code')?.trim().toUpperCase() ?? '';
  const linkToken = searchParams.get('t')?.trim() ?? '';

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnPath = `${location.pathname}${location.search}`;

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

  const goToAuth = (panel: 'experiences' | 'register') => {
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

    setAccepting(true);
    setError(null);

    try {
      const result = await acceptInvite.execute(preview.inviteId, session.token);
      await setNavigation({ groupId: result.groupId });
      navigate(`/groups/${result.groupId}/boxes`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ALREADY_GROUP_MEMBER') {
        await setNavigation({ groupId: preview.groupId });
        navigate(`/groups/${preview.groupId}/boxes`, { replace: true });
        return;
      }
      setError(resolveInviteError(err, t));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.accent}>{t('invite.preview.accent')}</p>
        <h1>{t('invite.preview.title')}</h1>
      </header>

      <section className={styles.panel}>
        {loading && <p className={styles.message}>{t('common.loading')}</p>}

        {!loading && error && (
          <>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <Button variant="secondary" fullWidth onClick={() => navigate('/auth')}>
              {t('invite.preview.backToAuth')}
            </Button>
          </>
        )}

        {!loading && preview && (
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

            {(!session || session.accessMode !== 'EXPERIENCES') && (
              <p className={styles.authHint}>{t('invite.preview.authRequired')}</p>
            )}

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              {session?.accessMode === 'EXPERIENCES' ? (
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
              <Button variant="ghost" fullWidth onClick={() => navigate('/auth')}>
                {t('common.back')}
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
