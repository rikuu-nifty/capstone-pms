// utils/styledSelect.ts
import { type StylesConfig } from 'react-select'

type Option = { value: number; label: string }

export const StyledSelect: StylesConfig<Option, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    borderRadius: '0.5rem',
    color: 'var(--foreground)',
    padding: '2px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--foreground)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--foreground)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
  }),
  option: (base, state) => ({
    ...base,
    color: state.isSelected ? 'var(--accent-foreground)' : 'var(--popover-foreground)',
    backgroundColor: state.isFocused || state.isSelected ? 'var(--accent)' : 'var(--popover)',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
  }),
}
