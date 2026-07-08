import Select, { type Props as SelectProps } from 'react-select';
import { Controller, type Control } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectProps extends Omit<SelectProps<Option, true>, 'name'> {
  name: string;
  control: Control<any>;
  options: Option[];
  label: string;
  placeholder?: string;
  error?: string;
}

export const MultiSelect = ({
  name,
  control,
  options,
  label,
  placeholder,
  error,
  isDisabled,
  ...rest
}: MultiSelectProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-secondary mb-1">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            {...rest}
            isMulti
            options={options}
            isDisabled={isDisabled}
            placeholder={placeholder || 'Select...'}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: error ? '#ef4444' : state.isFocused ? '#5A84F2' : '#d1d5db',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(90, 132, 242, 0.2)' : 'none',
                '&:hover': {
                  borderColor: state.isFocused ? '#5A84F2' : '#9ca3af'
                },
                borderRadius: '0.5rem',
                padding: '0.125rem',
                backgroundColor: isDisabled ? '#f9fafb' : '#ffffff',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected 
                  ? '#5A84F2' 
                  : state.isFocused 
                    ? '#ebf0fe' 
                    : 'white',
                ':active': {
                  backgroundColor: '#7A9DF5'
                }
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#ebf0fe',
                borderRadius: '0.375rem',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#3A63D9',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#3A63D9',
                ':hover': {
                  backgroundColor: '#7A9DF5',
                  color: 'white',
                }
              })
            }}
          />
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
