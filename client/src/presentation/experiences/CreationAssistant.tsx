import { useEffect, useMemo, useState } from 'react';
import { createApiClient } from '@adapters/api/ApiClient';
import type { BoxType } from '@domain/box/boxTypes';
import type { Experience, ExperienceInput } from '@domain/experience/experienceTypes';
import {
  DEFAULT_PARAMETERS,
  suggestIntensity,
} from '@domain/experience/experienceTypes';
import {
  isValidIntensity,
  validateExperienceParameters,
} from '@domain/experience/intensityTokens';
import { resolveExperienceError } from '@domain/experience/experienceErrors';
import {
  CreateExperienceUseCase,
  UpdateExperienceUseCase,
} from '@domain/experience/experienceUseCases';
import type { ExperienceSuggestion } from '../../content/suggestion-packs';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { NavButton } from '../components/NavButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { IntegritySeal } from '../components/IntegritySeal';
import { ParameterStarField } from '../components/ParameterStarField';
import { RatingScale } from '../components/RatingScale';
import { SuggestionExplorer } from '../suggestions/SuggestionExplorer';
import styles from './CreationAssistant.module.css';

interface CreationAssistantProps {
  open: boolean;
  boxId: string;
  boxType: BoxType;
  token: string;
  editing?: Experience | null;
  onClose: () => void;
  onSaved: (experience: Experience, createAnother: boolean) => void;
}

const STEP_COUNT = 5;

export function CreationAssistant({
  open,
  boxId,
  boxType,
  token,
  editing,
  onClose,
  onSaved,
}: CreationAssistantProps) {
  const { t } = useI18n();
  const api = useMemo(() => createApiClient(), []);
  const createExperience = useMemo(() => new CreateExperienceUseCase(api), [api]);
  const updateExperience = useMemo(() => new UpdateExperienceUseCase(api), [api]);

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [reflection, setReflection] = useState('');
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [intensity, setIntensity] = useState(3);
  const [intensityTouched, setIntensityTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySuggestion = (suggestion: ExperienceSuggestion) => {
    setDescription(suggestion.description);
    setReflection(suggestion.reflection);
    setParameters(suggestion.parameters);
    setIntensity(suggestion.intensity);
    setIntensityTouched(true);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editing) {
      setStep(1);
      setDescription(editing.description ?? '');
      setReflection(editing.reflection ?? '');
      setParameters(editing.parameters);
      setIntensity(editing.intensity);
      setIntensityTouched(true);
      setError(null);
      return;
    }

    setStep(1);
    setDescription('');
    setReflection('');
    setParameters(DEFAULT_PARAMETERS);
    setIntensity(3);
    setIntensityTouched(false);
    setError(null);
  }, [open, editing]);

  if (!open) {
    return null;
  }

  const resetForAnother = () => {
    setStep(1);
    setDescription('');
    setReflection('');
    setParameters(DEFAULT_PARAMETERS);
    setIntensity(3);
    setIntensityTouched(false);
    setError(null);
  };

  const applySuggestedIntensity = (nextParameters = parameters) => {
    if (!intensityTouched) {
      setIntensity(suggestIntensity(nextParameters));
    }
  };

  const buildInput = (): ExperienceInput => ({
    description: description.trim(),
    reflection: reflection.trim(),
    intensity,
    parameters,
  });

  const save = async (createAnother: boolean) => {
    setLoading(true);
    setError(null);

    const parameterError = validateExperienceParameters(parameters);
    if (parameterError || !isValidIntensity(intensity)) {
      setError(t('experiences.validationError'));
      setLoading(false);
      return;
    }

    try {
      const input = buildInput();
      const saved = editing
        ? await updateExperience.execute(editing.id, token, input)
        : await createExperience.execute(boxId, token, input);

      if (createAnother) {
        resetForAnother();
      } else {
        onClose();
      }

      onSaved(saved, createAnother);
    } catch (err) {
      setError(resolveExperienceError(err, t));
    } finally {
      setLoading(false);
    }
  };

  const canAdvance =
    (step === 1 && description.trim().length > 0) ||
    (step === 2 && reflection.trim().length > 0) ||
    step === 3 ||
    step === 4 ||
    step === 5;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <section className={styles.panel}>
        <ScreenHeader
          trailing={<NavButton action="close" onClick={onClose} />}
        >
          <div className={styles.headerBody}>
            <h2>{editing ? t('assistant.editTitle') : t('assistant.title')}</h2>
            <p className={styles.stepLabel}>
              {t('assistant.stepIndicator', { current: step, total: STEP_COUNT })}
            </p>
          </div>
        </ScreenHeader>

        <div className={styles.progress} aria-hidden="true">
          {Array.from({ length: STEP_COUNT }, (_, index) => (
            <span
              key={index}
              className={index + 1 <= step ? styles.progressActive : styles.progressIdle}
            />
          ))}
        </div>

        <article className={styles.descriptionCard}>
          <p className={styles.cardLabel}>{t('assistant.descriptionCard')}</p>
          <p className={styles.cardText}>
            {description.trim().length > 0 ? description : t('assistant.descriptionEmpty')}
          </p>
        </article>

        {step === 1 && (
          <section className={styles.step}>
            <h3>{t('assistant.steps.suggestion.title')}</h3>
            <p>{t('assistant.steps.suggestion.body')}</p>
            <SuggestionExplorer boxType={boxType} onAccept={applySuggestion} />
            <p className={styles.hint}>{t('suggestions.explorer.manualHint')}</p>
            <label className={styles.field}>
              <span>{t('assistant.fields.description')}</span>
              <textarea
                value={description}
                maxLength={1000}
                rows={4}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </section>
        )}

        {step === 2 && (
          <section className={styles.step}>
            <h3>{t('assistant.steps.reflection.title')}</h3>
            <p>{t('assistant.steps.reflection.body')}</p>
            <label className={styles.field}>
              <span>{t('assistant.fields.reflection')}</span>
              <textarea
                value={reflection}
                maxLength={2000}
                rows={5}
                onChange={(event) => setReflection(event.target.value)}
              />
            </label>
          </section>
        )}

        {step === 3 && (
          <section className={styles.step}>
            <h3>{t('assistant.steps.parameters.title')}</h3>
            <p>{t('assistant.steps.parameters.body')}</p>
            <div className={styles.parameterFields}>
            <ParameterStarField
              parameterKey="effort"
              value={parameters.effort}
              showHint
              onChange={(effort) => {
                const next = { ...parameters, effort };
                setParameters(next);
                applySuggestedIntensity(next);
              }}
            />
            <ParameterStarField
              parameterKey="openness"
              value={parameters.openness}
              showHint
              onChange={(openness) => {
                const next = { ...parameters, openness };
                setParameters(next);
                applySuggestedIntensity(next);
              }}
            />
            <ParameterStarField
              parameterKey="novelty"
              value={parameters.novelty}
              showHint
              onChange={(novelty) => {
                const next = { ...parameters, novelty };
                setParameters(next);
                applySuggestedIntensity(next);
              }}
            />
            </div>
          </section>
        )}

        {step === 4 && (
          <section className={styles.step}>
            <h3>{t('assistant.steps.classification.title')}</h3>
            <p>{t('assistant.steps.classification.body')}</p>
            {!intensityTouched && (
              <p className={styles.hint}>
                {t('assistant.suggestedIntensity', {
                  level: suggestIntensity(parameters),
                  name: t(`intensity.levels.${suggestIntensity(parameters)}`),
                })}
              </p>
            )}
            <RatingScale
              label={t('assistant.fields.intensity')}
              value={intensity}
              tone="intensity"
              onChange={(value) => {
                setIntensity(value);
                setIntensityTouched(true);
              }}
            />
          </section>
        )}

        {step === 5 && (
          <section className={styles.step}>
            <h3>{t('assistant.steps.review.title')}</h3>
            <dl className={styles.summary}>
              <div>
                <dt>{t('assistant.fields.description')}</dt>
                <dd>{description}</dd>
              </div>
              <div>
                <dt>{t('assistant.fields.reflection')}</dt>
                <dd>{reflection}</dd>
              </div>
              <div>
                <dt>{t('assistant.fields.intensity')}</dt>
                <dd>{intensity}</dd>
              </div>
              {editing?.seal &&
              description.trim() === (editing.description ?? '').trim() ? (
                <div>
                  <dt>{t('seal.label')}</dt>
                  <dd>
                    <IntegritySeal seal={editing.seal} compact />
                  </dd>
                </div>
              ) : (
                <div>
                  <dt>{t('seal.label')}</dt>
                  <dd>{t('seal.reviewNote')}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <footer className={styles.footer}>
          {step > 1 && (
            <NavButton action="back" onClick={() => setStep((current) => current - 1)} />
          )}

          {step < STEP_COUNT && (
            <Button
              fullWidth
              disabled={!canAdvance}
              onClick={() => setStep((current) => current + 1)}
            >
              {t('assistant.next')}
            </Button>
          )}

          {step === STEP_COUNT && !editing && (
            <>
              <Button
                fullWidth
                disabled={loading}
                onClick={() => void save(false)}
              >
                {loading ? t('common.loading') : t('assistant.saveFinish')}
              </Button>
              <Button
                fullWidth
                variant="secondary"
                disabled={loading}
                onClick={() => void save(true)}
              >
                {t('assistant.saveAnother')}
              </Button>
            </>
          )}

          {step === STEP_COUNT && editing && (
            <Button fullWidth disabled={loading} onClick={() => void save(false)}>
              {loading ? t('common.loading') : t('assistant.saveChanges')}
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
