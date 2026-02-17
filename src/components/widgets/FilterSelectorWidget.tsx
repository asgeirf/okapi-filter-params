import { useMemo } from 'react';
import { getFiltersForOkapi } from '@/data';
import { useOkapiVersion } from '../OkapiVersionContext';
import { Select } from '../ui/select';

interface FilterSelectorWidgetProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    allowNull?: boolean;
    suggestions?: string[];
  };
}

export function FilterSelectorWidget(props: FilterSelectorWidgetProps) {
  const { value, onChange, disabled, readonly, options = {} } = props;
  const { allowNull = true, suggestions = [] } = options;
  const { okapiVersion } = useOkapiVersion();

  const filters = useMemo(() => getFiltersForOkapi(okapiVersion), [okapiVersion]);
  const allFilterIds = filters.map(f => f.meta.id);
  const sortedIds = [
    ...suggestions.filter(s => allFilterIds.includes(s)),
    ...allFilterIds.filter(id => !suggestions.includes(id))
  ];

  return (
    <Select
      value={value || ''}
      onChange={(e) => {
        const newValue = e.target.value;
        onChange(newValue === '' ? null : newValue);
      }}
      disabled={disabled || readonly}
    >
      {allowNull && <option value="">None</option>}
      {suggestions.length > 0 && (
        <optgroup label="Suggested">
          {suggestions.filter(s => allFilterIds.includes(s)).map(id => {
            const filter = filters.find(f => f.meta.id === id);
            return (
              <option key={id} value={id}>
                {filter?.meta.name || id}
              </option>
            );
          })}
        </optgroup>
      )}
      <optgroup label="All Filters">
        {sortedIds.filter(id => !suggestions.includes(id)).map(id => {
          const filter = filters.find(f => f.meta.id === id);
          return (
            <option key={id} value={id}>
              {filter?.meta.name || id}
            </option>
          );
        })}
      </optgroup>
    </Select>
  );
}

export default FilterSelectorWidget;
