import { useOkapiVersion } from './OkapiVersionContext';
import { Select } from './ui/select';

export function OkapiVersionSelector() {
  const { okapiVersion, setOkapiVersion, allVersions } = useOkapiVersion();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="okapi-version" className="text-sm text-muted-foreground whitespace-nowrap">
        Okapi
      </label>
      <Select
        id="okapi-version"
        value={okapiVersion}
        onChange={(e) => setOkapiVersion(e.target.value)}
        className="w-28 text-sm"
      >
        {allVersions.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </Select>
    </div>
  );
}
