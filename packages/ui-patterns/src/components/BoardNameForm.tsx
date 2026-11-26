import { useId, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface BoardNameFormProps {
  name: string;
  mode: 'rename' | 'fork';
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export function BoardNameForm({
  name,
  mode,
  onNameChange,
  onSubmit,
  onCancel,
  autoFocus = false,
}: BoardNameFormProps): ReactElement {
  const inputId = useId();
  const formId = useId();
  const { t } = useTranslation();
  return (
    <>
      <form
        id={formId}
        className="wm-modal-body"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor={inputId} className="wm-input-label">
          {t('playground.patternName')}
        </label>
        <input
          id={inputId}
          className="wm-input"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          autoFocus={autoFocus}
        />
      </form>
      <div className="wm-modal-footer">
        <button className="btn btn-secondary btn-outline" type="button" onClick={onCancel}>
          {t('dialogs.cancel')}
        </button>
        <button className="btn btn-primary" type="submit" form={formId}>
          {t(mode === 'fork' ? 'playground.createFork' : 'playground.save')}
        </button>
      </div>
    </>
  );
}
