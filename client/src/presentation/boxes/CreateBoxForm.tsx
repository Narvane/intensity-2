import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { DEFAULT_BOX_TYPE, type Box, type BoxType } from '@domain/box/boxTypes';
import { CreateBoxUseCase } from '@domain/box/boxUseCases';
import { CreateExperienceUseCase } from '@domain/experience/experienceUseCases';
import { getSuggestionById } from '../../content/suggestion-packs';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import { Checkbox, type CheckboxAccent } from '../components/Checkbox';
import { SuggestionPickerList } from '../suggestions/SuggestionPickerList';
import { BoxTypePicker } from './BoxTypePicker';
import styles from './CreateBoxForm.module.css';

export type CreateBoxVariant = 'experienceBox' | 'experiences';

export interface CreateBoxFormProps {
  groupId: string;
  token: string;
  /** Visual accent for the hosting mode. */
  variant?: CreateBoxVariant;
  cancelPath?: string;
  /** Called after a successful create. When omitted, navigates to `successPath`. */
  onSuccess?: (box: Box, meta?: { partialFillFailures?: number }) => void;
  /** Default post-create navigation when `onSuccess` is not provided. */
  successPath?: string;
}

/**
 * Reusable create-box flow: name, thematic type picker, submit.
 * Host pages supply session context, navigation, and optional chrome.
 */
export function CreateBoxForm({
  groupId,
  token,
  variant = 'experienceBox',
  cancelPath,
  onSuccess,
  successPath = '/box-home',
}: CreateBoxFormProps) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const createBox = useMemo(() => new CreateBoxUseCase(api), [api]);
  const createExperience = useMemo(() => new CreateExperienceUseCase(api), [api]);

  const [name, setName] = useState('');
  const [type, setType] = useState<BoxType>(DEFAULT_BOX_TYPE);
  const [fillWithDefaults, setFillWithDefaults] = useState(false);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !loading;
  const checkboxAccent: CheckboxAccent = variant === 'experiences' ? 'purple' : 'coral';

  useEffect(() => {
    setSelectedSuggestionIds(new Set());
  }, [type]);

  useEffect(() => {
    if (!fillWithDefaults) {
      setSelectedSuggestionIds(new Set());
    }
  }, [fillWithDefaults]);

  const submit = async () => {
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const box = await createBox.execute(token, {
        groupId,
        name: trimmedName,
        type,
      });

      if (fillWithDefaults && selectedSuggestionIds.size > 0) {
        let failedCount = 0;

        for (const suggestionId of selectedSuggestionIds) {
          const suggestion = getSuggestionById(locale, suggestionId);
          if (!suggestion || suggestion.boxType !== type) {
            continue;
          }

          try {
            await createExperience.execute(box.id, token, {
              description: suggestion.description,
              reflection: suggestion.reflection,
              intensity: suggestion.intensity,
              parameters: suggestion.parameters,
            });
          } catch {
            failedCount += 1;
          }
        }

        if (failedCount > 0) {
          setWarning(t('createBox.partialFillError', { count: failedCount }));
        }

        if (onSuccess) {
          onSuccess(box, { partialFillFailures: failedCount });
        } else {
          navigate(successPath, {
            replace: true,
            state: { partialFillFailures: failedCount },
          });
        }
        return;
      }

      if (onSuccess) {
        onSuccess(box);
      } else {
        navigate(successPath, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form} data-variant={variant}>
      <section className={styles.section} aria-labelledby="create-box-name-heading">
        <h2 id="create-box-name-heading" className={styles.sectionTitle}>
          {t('createBox.nameStep')}
        </h2>
        <p className={styles.sectionHint}>{t('createBox.nameHint')}</p>
        <label className={styles.field}>
          <span className="srOnly">{t('createBox.nameLabel')}</span>
          <input
            type="text"
            maxLength={80}
            value={name}
            placeholder={t('createBox.namePlaceholder')}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      </section>

      <section className={styles.section} aria-labelledby="create-box-type-heading">
        <h2 id="create-box-type-heading" className={styles.sectionTitle}>
          {t('createBox.typeStep')}
        </h2>
        <p className={styles.sectionHint}>{t('createBox.typeHint')}</p>
        <BoxTypePicker value={type} onChange={setType} />
      </section>

      <section className={styles.section} aria-labelledby="create-box-defaults-heading">
        <h2 id="create-box-defaults-heading" className={styles.sectionTitle}>
          {t('createBox.defaultsStep')}
        </h2>
        <label className={styles.flag} htmlFor="create-box-fill-defaults">
          <Checkbox
            id="create-box-fill-defaults"
            accent={checkboxAccent}
            checked={fillWithDefaults}
            onChange={(event) => setFillWithDefaults(event.target.checked)}
          />
          <span className={styles.flagCopy}>
            <strong>{t('suggestions.createBox.flag')}</strong>
            <span className={styles.flagHint}>{t('suggestions.createBox.flagHint')}</span>
          </span>
        </label>

        {fillWithDefaults && (
          <>
            <SuggestionPickerList
              boxType={type}
              accent={checkboxAccent}
              selectedIds={selectedSuggestionIds}
              onChange={setSelectedSuggestionIds}
            />
            <p className={styles.selectionCount}>
              {t('suggestions.createBox.selectedCount', {
                count: selectedSuggestionIds.size,
              })}
            </p>
          </>
        )}
      </section>

      {warning && (
        <p className={styles.warning} role="status">
          {warning}
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        {cancelPath && (
          <Button variant="secondary" fullWidth onClick={() => navigate(cancelPath)}>
            {t('common.back')}
          </Button>
        )}
        <Button fullWidth disabled={!canSubmit} onClick={() => void submit()}>
          {loading ? t('common.loading') : t('createBox.submit')}
        </Button>
      </div>
    </div>
  );
}
