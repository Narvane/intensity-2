import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@adapters/api/ApiClient';
import { createDefaultPendingInviteAdapter } from '@adapters/invite/PendingInvitePreferencesAdapter';
import { createApiClient, createDefaultSessionAdapter, useSession } from '@app/SessionProvider';
import {
  LoginExperienceBoxUseCase,
  LoginExperiencesUseCase,
  RegisterParticipantUseCase,
  ValidateInviteCodeFormatUseCase,
} from '@domain/auth/authUseCases';
import {
  getMemoryPendingReturnPath,
  hydratePendingInvite,
  resolvePostAuthDestination,
} from '@domain/invite/pendingInvite';
import { consumeExperienceBoxSessionEndReason } from '@domain/session/experienceBoxSessionEnd';
import { useI18n } from '../../i18n/I18nContext';
import { BrandMark } from '../components/BrandMark';
import { AuthModeIntro } from '../components/AuthModeIntro';
import { Button } from '../components/Button';
import { NavButton } from '../components/NavButton';
import { QuickGuideOverlay } from '../quick-guide/QuickGuideOverlay';
import styles from './AuthPage.module.css';

type AuthPanel = 'experiences' | 'experienceBox' | 'register' | 'invite';

interface AuthLocationState {
  returnTo?: string;
  panel?: AuthPanel;
}

interface CredentialForm {
  email: string;
  password: string;
}

const emptyCredential = (): CredentialForm => ({ email: '', password: '' });

export function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const authState = (location.state as AuthLocationState | null) ?? {};
  const { refresh } = useSession();
  const api = useMemo(() => createApiClient(), []);
  const sessionPort = useMemo(() => createDefaultSessionAdapter(), []);
  const pendingInvitePort = useMemo(() => createDefaultPendingInviteAdapter(), []);

  const registerUseCase = useMemo(
    () => new RegisterParticipantUseCase(api, sessionPort),
    [api, sessionPort],
  );
  const loginExperiencesUseCase = useMemo(
    () => new LoginExperiencesUseCase(api, sessionPort),
    [api, sessionPort],
  );
  const loginExperienceBoxUseCase = useMemo(
    () => new LoginExperienceBoxUseCase(api, sessionPort),
    [api, sessionPort],
  );
  const validateInviteCode = useMemo(() => new ValidateInviteCodeFormatUseCase(), []);

  const [panel, setPanel] = useState<AuthPanel>(authState.panel ?? 'experiences');
  const [quickGuideOpen, setQuickGuideOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const [experiencesForm, setExperiencesForm] = useState<CredentialForm>(emptyCredential);
  const [boxCredentials, setBoxCredentials] = useState<CredentialForm[]>([emptyCredential()]);
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    email: '',
    password: '',
  });
  const [inviteCode, setInviteCode] = useState('');
  const [pendingReturnPath, setPendingReturnPath] = useState<string | null>(null);

  useEffect(() => {
    if (authState.panel) {
      setPanel(authState.panel);
    }
  }, [authState.panel]);

  useEffect(() => {
    const endReason = consumeExperienceBoxSessionEndReason();
    if (endReason === 'draw_limit') {
      setSessionNotice(t('session.experienceBoxEnded'));
      setPanel('experienceBox');
    }
  }, [t]);

  useEffect(() => {
    if (authState.returnTo) {
      setPendingReturnPath(authState.returnTo);
      return;
    }

    void hydratePendingInvite(pendingInvitePort).then((pending) => {
      if (pending?.returnPath) {
        setPendingReturnPath(pending.returnPath);
      }
    });
  }, [authState.returnTo, pendingInvitePort]);

  const resolveExperiencesDestination = () =>
    resolvePostAuthDestination(authState.returnTo, pendingReturnPath ?? getMemoryPendingReturnPath());

  const afterAuthNavigate = () => {
    navigate(resolveExperiencesDestination(), { replace: true });
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.code === 'GROUP_MEMBERSHIP_CONFLICT') {
        setError(t('auth.errors.groupMembershipConflict'));
        return;
      }
      setError(err.message);
      return;
    }
    setError(t('auth.errors.network'));
  };

  const submitExperiences = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginExperiencesUseCase.execute(experiencesForm);
      await refresh();
      navigate(resolveExperiencesDestination(), { replace: true });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitExperienceBox = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginExperienceBoxUseCase.execute(boxCredentials);
      await refresh();
      navigate('/box-home');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await registerUseCase.execute(registerForm);
      await refresh();
      afterAuthNavigate();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitInviteCode = () => {
    setError(null);
    if (!validateInviteCode.execute(inviteCode)) {
      setError(t('auth.errors.invalidInviteCode'));
      return;
    }
    navigate(`/join?code=${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
  };

  const panelClass =
    panel === 'experiences'
      ? styles.panelExperiences
      : panel === 'experienceBox'
        ? styles.panelExperienceBox
        : panel === 'invite'
          ? styles.panelInvite
          : styles.panelNeutral;

  return (
    <>
      <main className={styles.page}>
        <header className={styles.brandBar}>
          <BrandMark
            variant="wordmark"
            size="auth"
            accessibleName={t('app.name')}
          />
          <NavButton
            action="help"
            iconOnly
            className={styles.helpButton}
            onClick={() => setQuickGuideOpen(true)}
          />
        </header>

        <nav className={styles.tabs} aria-label={t('auth.tabsLabel')}>
          {(['experiences', 'experienceBox', 'register', 'invite'] as AuthPanel[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className={
                panel === tab
                  ? tab === 'experiences'
                    ? `${styles.tabActive} ${styles.tabActiveExperiences}`
                    : tab === 'experienceBox'
                      ? `${styles.tabActive} ${styles.tabActiveExperienceBox}`
                      : tab === 'invite'
                        ? `${styles.tabActive} ${styles.tabActiveInvite}`
                        : styles.tabActive
                  : styles.tab
              }
              onClick={() => {
                setPanel(tab);
                setError(null);
              }}
            >
              {t(`auth.tabs.${tab}`)}
            </button>
          ))}
        </nav>

        <section className={`${styles.panel} ${panelClass}`}>
          {panel === 'experiences' && (
            <>
              <AuthModeIntro mode="EXPERIENCES" />
              <label className={styles.field}>
                <span>{t('auth.fields.email')}</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={experiencesForm.email}
                  onChange={(event) =>
                    setExperiencesForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>{t('auth.fields.password')}</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={experiencesForm.password}
                  onChange={(event) =>
                    setExperiencesForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              <Button fullWidth disabled={loading} onClick={() => void submitExperiences()}>
                {loading ? t('auth.loading') : t('auth.experiences.submit')}
              </Button>
            </>
          )}

          {panel === 'experienceBox' && (
            <>
              <AuthModeIntro mode="EXPERIENCE_BOX" />
              <p className={styles.hint}>{t('auth.experienceBox.hint')}</p>
              {boxCredentials.map((credential, index) => (
                <div key={index} className={styles.credentialCard}>
                  <p className={styles.cardTitle}>
                    {t('auth.experienceBox.participant', { number: index + 1 })}
                  </p>
                  <label className={styles.field}>
                    <span>{t('auth.fields.email')}</span>
                    <input
                      type="email"
                      value={credential.email}
                      onChange={(event) =>
                        setBoxCredentials((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, email: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{t('auth.fields.password')}</span>
                    <input
                      type="password"
                      value={credential.password}
                      onChange={(event) =>
                        setBoxCredentials((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, password: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              ))}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setBoxCredentials((current) => [...current, emptyCredential()])}
              >
                {t('auth.experienceBox.addParticipant')}
              </Button>
              <Button fullWidth disabled={loading} onClick={() => void submitExperienceBox()}>
                {loading ? t('auth.loading') : t('auth.experienceBox.submit')}
              </Button>
            </>
          )}

          {panel === 'register' && (
            <>
              <h1>{t('auth.register.title')}</h1>
              <label className={styles.field}>
                <span>{t('auth.fields.displayName')}</span>
                <input
                  type="text"
                  value={registerForm.displayName}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>{t('auth.fields.email')}</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span>{t('auth.fields.password')}</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <Button fullWidth disabled={loading} onClick={() => void submitRegister()}>
                {loading ? t('auth.loading') : t('auth.register.submit')}
              </Button>
            </>
          )}

          {panel === 'invite' && (
            <>
              <h1>{t('auth.invite.title')}</h1>
              <label className={styles.field}>
                <span>{t('auth.invite.codeLabel')}</span>
                <input
                  type="text"
                  maxLength={6}
                  className={styles.inviteCode}
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                />
              </label>
              <Button fullWidth onClick={submitInviteCode}>
                {t('auth.invite.submit')}
              </Button>
            </>
          )}

          {sessionNotice && (
            <p className={styles.notice} role="status">
              {sessionNotice}
            </p>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </section>
      </main>

      <QuickGuideOverlay open={quickGuideOpen} onClose={() => setQuickGuideOpen(false)} />
    </>
  );
}
