import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileJson, FileText, Filter as FilterIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { OkapiVersionSelector } from '@/components/OkapiVersionSelector';
import { useOkapiVersion } from '@/components/OkapiVersionContext';
import { searchFilters, getFilterVersions, getSchemaVersionForOkapi, type FilterData } from '@/data';

export function FilterSelectPage() {
  const [query, setQuery] = useState('');
  const { okapiVersion } = useOkapiVersion();
  const results = useMemo(() => searchFilters(query, okapiVersion), [query, okapiVersion]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FilterIcon className="h-8 w-8" />
                Okapi Filter Configuration
              </h1>
              <p className="text-muted-foreground mt-1">
                Select a filter to configure its parameters
              </p>
            </div>
            <OkapiVersionSelector />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, MIME type, extension..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          {results.length} filter{results.length !== 1 ? 's' : ''} found
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((filter) => (
            <FilterCard key={filter.meta.id} filter={filter} okapiVersion={okapiVersion} />
          ))}
        </div>
      </main>
    </div>
  );
}

function FilterCard({ filter, okapiVersion }: { filter: FilterData; okapiVersion: string }) {
  const { meta, schema } = filter;
  const propCount = Object.keys(schema.properties).length;
  const versions = getFilterVersions(meta.id);
  const currentSchemaVer = getSchemaVersionForOkapi(meta.id, okapiVersion);
  const hasMultipleVersions = versions.length > 1;

  return (
    <Link to={`/configure/${meta.id}`}>
      <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{meta.name}</CardTitle>
            <div className="flex items-center gap-1">
              {hasMultipleVersions && currentSchemaVer !== undefined && (
                <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                  v{currentSchemaVer}
                </span>
              )}
              <span className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                {meta.id}
              </span>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {meta.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs">
            {meta.mimeType && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                <FileJson className="h-3 w-3" />
                {meta.mimeType}
              </span>
            )}
            {meta.extensions.slice(0, 3).map((ext) => (
              <span
                key={ext}
                className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded"
              >
                <FileText className="h-3 w-3" />
                {ext}
              </span>
            ))}
            {meta.extensions.length > 3 && (
              <span className="text-muted-foreground">
                +{meta.extensions.length - 3} more
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {propCount} configurable parameter{propCount !== 1 ? 's' : ''}
            {hasMultipleVersions && (
              <span className="ml-2">
                · {versions.length} schema version{versions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
