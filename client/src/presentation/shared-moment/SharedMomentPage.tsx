import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useAppLogout } from '@app/useAppLogout';
import { useNavigation } from '@app/NavigationProvider';
import { useSession } from '@app/SessionProvider';
import { ListExperiencesUseCase } from '@domain/experience/experienceUseCases';
import { ExecutarSorteioUseCase } from '@domain/sorteio/ExecutarSorteioUseCase';
import {
  DEFAULT_INTENSITY_FILTER,
  type IntensityFilter,
  type IntensityFilterMode,
} from '@domain/sorteio/FiltroIntensidadePolicy';
import { RevelacaoOrchestrator } from '@domain/sorteio/RevelacaoOrchestrator';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { RatingScale } from '../components/RatingScale';
import { DrawResultCard } from './DrawResultCard';
import styles from './SharedMomentPage.module.css';

const orchestrator = new RevelacaoOrchestrator();

export function SharedMomentPage() {
  const { boxId = '' } = useParams();
  const { t } = useI18n();
  const { session } = useSession();
  const { navigation } = useNavigation();
  const logout = useAppLogout();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const listExperiences = useMemo(() => new ListExperiencesUseCase(api), [api]);
  const drawUseCase = useMemo(() => new ExecutarSorteioUseCase(), []);

  const [filter, setFilter] = useState<IntensityFilter>(DEFAULT_INTENSITY_FILTER);
  const [drawSession, setDrawSession] = useState(orchestrator.createIdleSession());
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolSize, setPoolSize] = useState<number | null>(null);
  const [emptyFilter, setEmptyFilter] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const boxName = navigation.boxName ?? t('sharedMoment.defaultBoxName');

  const drawButtonLabel = () => {
    const name = t(`intensity.levels.${filter.level}`);
    if (filter.mode === 'EXACT') {
      return t('sharedMoment.drawExact', { level: filter.level, name });
    }
    if (filter.mode === 'UP_TO') {
      return t('sharedMoment.drawUpTo', { level: filter.level, name });
    }
    return t('sharedMoment.drawAny');
  };

  const setFilterMode = (mode: IntensityFilterMode) => {
    setFilter((current) => ({ ...current, mode }));
    setDrawSession(orchestrator.backToDraw());
    setEmptyFilter(false);
  };

  const handleDraw = async () => {
    if (!session?.token) {
      return;
    }

    setDrawing(true);
    setError(null);
    setEmptyFilter(false);
    setDrawSession(orchestrator.backToDraw());
    setStatusMessage(t('sharedMoment.statusChoosing'));

    try {
      const pool = await listExperiences.execute(boxId, session.token);
      setPoolSize(pool.length);

      if (pool.length === 0) {
        return;
      }

      const result = drawUseCase.execute(pool, filter);
      if (!result) {
        setEmptyFilter(true);
        return;
      }

      setDrawSession(orchestrator.applyDraw(orchestrator.createIdleSession(), result));
      setStatusMessage(t('sharedMoment.statusDrawn'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setDrawing(false);
    }
  };

  return (
    <main className={styles.page}>
      <p className="srOnly" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </p>
      <header className={styles.header}>
        <div>
          <p className={styles.mode}>{t('session.experienceBoxMode')}</p>
          <h1>{boxName}</h1>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={() => navigate('/box-home')}>
            {t('common.back')}
          </Button>
          <Button variant="ghost" onClick={() => void logout()}>
            {t('session.logout')}
          </Button>
        </div>
      </header>

      <section className={styles.filters}>
        <p className={styles.filtersLabel}>{t('sharedMoment.filtersLabel')}</p>
        <div className={styles.chips}>
          {(['ANY', 'EXACT', 'UP_TO'] as IntensityFilterMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={filter.mode === mode ? styles.chipActive : styles.chip}
              onClick={() => setFilterMode(mode)}
            >
              {t(`sharedMoment.filter.${mode}`)}
            </button>
          ))}
        </div>

        {filter.mode !== 'ANY' && (
          <RatingScale
            label={t('sharedMoment.intensityLevel')}
            value={filter.level}
            tone="intensity"
            onChange={(level) => {
              setFilter((current) => ({ ...current, level }));
              setDrawSession(orchestrator.backToDraw());
              setEmptyFilter(false);
            }}
          />
        )}
      </section>

      {drawSession.phase === 'idle' && (
        <div className={styles.drawArea}>
          <Button fullWidth disabled={drawing} onClick={() => void handleDraw()}>
            {drawing ? t('sharedMoment.choosing') : drawButtonLabel()}
          </Button>

          {poolSize === 0 && !drawing && (
            <p className={styles.hintCard}>{t('sharedMoment.emptyBox')}</p>
          )}

          {emptyFilter && !drawing && (
            <p className={styles.hintCard}>{t('sharedMoment.emptyFilter')}</p>
          )}
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {drawSession.result && drawSession.phase !== 'idle' && (
        <>
          <DrawResultCard
            experience={drawSession.result.experience}
            revealed={drawSession.phase === 'revealed'}
          />

          {drawSession.phase === 'drawn' && (
            <p className={styles.alignmentHint}>{t('sharedMoment.alignmentHint')}</p>
          )}

          <div className={styles.actions}>
            {drawSession.phase === 'drawn' && (
              <Button
                fullWidth
                onClick={() => {
                  setDrawSession(orchestrator.reveal(drawSession));
                  setStatusMessage(t('sharedMoment.statusRevealed'));
                }}
              >
                {t('sharedMoment.reveal')}
              </Button>
            )}

            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                setDrawSession(orchestrator.backToDraw());
                setStatusMessage('');
              }}
            >
              {t('sharedMoment.backToDraw')}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
