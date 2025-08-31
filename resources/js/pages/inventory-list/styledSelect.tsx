// utils/styledSelect.ts
import { type StylesConfig } from 'react-select'

type Option = { value: number; label: string }

export const StyledSelect: StylesConfig<Option, false> = {
  control: (base) => ({
    ...base,
    borderRadius: '0.5rem',
    padding: '2px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'black',
  }),
  input: (base) => ({
    ...base,
    color: 'black',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'black',
  }),
  option: (base, state) => ({
    ...base,
    color: 'black',
    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
  }),
}
