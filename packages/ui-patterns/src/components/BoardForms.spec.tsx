import { useState, type ReactElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { BoardNameForm, BoardDetailsForm, type BoardDetailsValues } from '../index';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string): string => key }),
}));
afterEach(cleanup);

describe('Board form presentation', () => {
  test('forwards renamed values, native submission, and cancellation without persistence', () => {
    const onNameChange = vi.fn();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const { container } = render(
      <BoardNameForm
        name="Glider"
        mode="rename"
        onNameChange={onNameChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New glider' } });
    expect(onNameChange).toHaveBeenCalledWith('New glider');
    fireEvent.submit(container.querySelector('form')!);
    fireEvent.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  test('isolates field labels and visibility radio groups between forms', () => {
    const values: BoardDetailsValues = {
      name: 'Glider',
      category: 'Spaceships',
      description: '',
      tags: '',
      visibility: 'public',
    };
    render(
      <>
        <BoardNameForm
          name="Fork"
          mode="fork"
          onNameChange={vi.fn()}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
        <BoardNameForm
          name="Rename"
          mode="rename"
          onNameChange={vi.fn()}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
        <BoardDetailsForm
          values={values}
          categoryOptions={['Spaceships']}
          onChange={vi.fn()}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
        <BoardDetailsForm
          values={{ ...values, visibility: 'private' }}
          categoryOptions={['Spaceships']}
          onChange={vi.fn()}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      </>,
    );
    const names = screen.getAllByRole('textbox', { name: 'playground.patternName' });
    expect(new Set(names.map((input) => input.id)).size).toBe(4);
    const groups = screen.getAllByRole('group', {
      name: 'playground.confirmDraftSaveVisibilityLabel',
    });
    expect(
      within(groups[0]).getByRole('radio', { name: 'playground.visibilityPublic' }),
    ).toBeChecked();
    expect(
      within(groups[1]).getByRole('radio', { name: 'playground.visibilityPrivate' }),
    ).toBeChecked();
    expect(
      within(groups[0])
        .getByRole('radio', { name: 'playground.visibilityPublic' })
        .getAttribute('name'),
    ).not.toBe(
      within(groups[1])
        .getByRole('radio', { name: 'playground.visibilityPrivate' })
        .getAttribute('name'),
    );
  });

  test('rejects blank required metadata and submits controlled values after editing', () => {
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    function ControlledForm(): ReactElement {
      const [values, setValues] = useState<BoardDetailsValues>({
        name: '  ',
        category: '',
        description: 'Existing description',
        tags: 'moving',
        visibility: 'public',
      });
      return (
        <BoardDetailsForm
          values={values}
          categoryOptions={['Spaceships']}
          onChange={(next) => {
            onChange(next);
            setValues(next);
          }}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      );
    }
    const { container } = render(<ControlledForm />);
    const submit = screen.getByRole('button', { name: 'playground.confirmDraftSaveAction' });
    expect(submit).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'playground.patternName' }), {
      target: { value: 'My board' },
    });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Spaceships' } });
    fireEvent.click(screen.getByRole('radio', { name: 'playground.visibilityPrivate' }));
    expect(onChange).toHaveBeenLastCalledWith({
      name: 'My board',
      category: 'Spaceships',
      description: 'Existing description',
      tags: 'moving',
      visibility: 'private',
    });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
