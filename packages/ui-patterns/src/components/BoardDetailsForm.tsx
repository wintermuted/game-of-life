import { useId, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface BoardDetailsValues {
  name: string;
  category: string;
  description: string;
  tags: string;
  visibility: 'public' | 'private';
}

export interface BoardDetailsFormProps {
  values: BoardDetailsValues;
  categoryOptions: readonly string[];
  onChange: (values: BoardDetailsValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export function BoardDetailsForm({
  values,
  categoryOptions,
  onChange,
  onSubmit,
  onCancel,
  autoFocus = false,
}: BoardDetailsFormProps): ReactElement {
  const id = useId();
  const { t } = useTranslation();
  const canSubmit = Boolean(values.name.trim() && values.category.trim());
  return (
    <>
      <form
        id={`${id}-form`}
        className="wm-modal-body playground-board-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) onSubmit();
        }}
      >
        <label htmlFor={`${id}-name`} className="wm-input-label">
          {t('playground.patternName')}
        </label>
        <input
          id={`${id}-name`}
          className="wm-input"
          type="text"
          value={values.name}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          placeholder={t('playground.confirmDraftSaveNamePlaceholder')}
          autoFocus={autoFocus}
        />
        <label htmlFor={`${id}-category`} className="wm-input-label">
          {t('playground.confirmDraftSaveCategoryLabel')}
        </label>
        <select
          id={`${id}-category`}
          className="wm-input"
          value={values.category}
          onChange={(event) => onChange({ ...values, category: event.target.value })}
        >
          <option value="" disabled>
            {t('playground.confirmDraftSaveCategoryPlaceholder')}
          </option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <label htmlFor={`${id}-description`} className="wm-input-label">
          {t('playground.infoDescriptionLabel')}
        </label>
        <textarea
          id={`${id}-description`}
          className="wm-input"
          value={values.description}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          placeholder={t('playground.confirmDraftSaveDescriptionPlaceholder')}
          rows={3}
        />
        <label htmlFor={`${id}-tags`} className="wm-input-label">
          {t('playground.confirmDraftSaveTagsLabel')}
        </label>
        <input
          id={`${id}-tags`}
          className="wm-input"
          type="text"
          value={values.tags}
          onChange={(event) => onChange({ ...values, tags: event.target.value })}
          placeholder={t('playground.confirmDraftSaveTagsPlaceholder')}
        />
        <fieldset className="playground-visibility-toggle-group">
          <legend className="wm-input-label">
            {t('playground.confirmDraftSaveVisibilityLabel')}
          </legend>
          {(['public', 'private'] as const).map((visibility) => (
            <label key={visibility} className="playground-visibility-toggle-option">
              <input
                type="radio"
                name={`${id}-visibility`}
                value={visibility}
                checked={values.visibility === visibility}
                onChange={() => onChange({ ...values, visibility })}
              />
              <span>
                {t(
                  visibility === 'public'
                    ? 'playground.visibilityPublic'
                    : 'playground.visibilityPrivate',
                )}
              </span>
            </label>
          ))}
        </fieldset>
      </form>
      <div className="wm-modal-footer">
        <button className="btn btn-secondary btn-outline" type="button" onClick={onCancel}>
          {t('dialogs.cancel')}
        </button>
        <button className="btn btn-primary" type="submit" form={`${id}-form`} disabled={!canSubmit}>
          {t('playground.confirmDraftSaveAction')}
        </button>
      </div>
    </>
  );
}
