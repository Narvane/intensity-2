import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createApiClient } from '@adapters/api/ApiClient';
import { useSession } from '@app/SessionProvider';
import { BOX_TYPES, DEFAULT_BOX_TYPE, type BoxType } from '@domain/box/boxTypes';
import { CreateBoxUseCase } from '@domain/box/boxUseCases';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../components/Button';
import styles from './CreateBoxPage.module.css';

export function CreateBoxPage() {
  const { t } = useI18n();
  const { session } = useSession();
  const navigate = useNavigate();
  const api = useMemo(() => createApiClient(), []);
  const createBox = useMemo(() => new CreateBoxUseCase(api), [api]);

  const [name, setName] = useState('');
  const [type, setType] = useState<BoxType>(DEFAULT_BOX_TYPE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!session?.token || !session.groupId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createBox.execute(session.token, {
        groupId: session.groupId,
        name,
        type,
      });
      navigate('/box-home');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/box-home')}>
          {t('common.back')}
        </Button>
        <h1>{t('createBox.title')}</h1>
      </header>

      <section className={styles.form}>
        <label className={styles.field}>
          <span>{t('createBox.nameLabel')}</span>
          <input
            type="text"
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <fieldset className={styles.types}>
          <legend>{t('createBox.typeLabel')}</legend>
          {BOX_TYPES.map((boxType) => (
            <label key={boxType} className={styles.typeOption}>
              <input
                type="radio"
                name="boxType"
                checked={type === boxType}
                onChange={() => setType(boxType)}
              />
              <span>
                <strong>{t(`boxTypes.${boxType}.title`)}</strong>
                <small>{t(`boxTypes.${boxType}.hint`)}</small>
              </span>
            </label>
          ))}
        </fieldset>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <Button fullWidth disabled={loading || name.trim().length === 0} onClick={() => void submit()}>
          {loading ? t('common.loading') : t('createBox.submit')}
        </Button>
      </section>
    </main>
  );
}
