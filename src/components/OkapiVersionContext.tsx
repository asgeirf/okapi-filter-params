import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { okapiVersions, latestOkapiVersion } from '@/data';

interface OkapiVersionContextValue {
  okapiVersion: string;
  setOkapiVersion: (v: string) => void;
  allVersions: string[];
}

const OkapiVersionContext = createContext<OkapiVersionContextValue>({
  okapiVersion: latestOkapiVersion,
  setOkapiVersion: () => {},
  allVersions: okapiVersions,
});

// eslint-disable-next-line react-refresh/only-export-components
export function useOkapiVersion() {
  return useContext(OkapiVersionContext);
}

export function OkapiVersionProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramVersion = searchParams.get('okapi');
  const initialVersion = paramVersion && okapiVersions.includes(paramVersion)
    ? paramVersion
    : latestOkapiVersion;

  const [version, setVersionState] = useState(initialVersion);

  const setOkapiVersion = useCallback((v: string) => {
    setVersionState(v);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (v === latestOkapiVersion) {
        next.delete('okapi');
      } else {
        next.set('okapi', v);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return (
    <OkapiVersionContext.Provider value={{
      okapiVersion: version,
      setOkapiVersion,
      allVersions: okapiVersions,
    }}>
      {children}
    </OkapiVersionContext.Provider>
  );
}
