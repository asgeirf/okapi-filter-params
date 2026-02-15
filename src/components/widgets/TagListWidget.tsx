import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface TagListWidgetProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readonly?: boolean;
  options?: {
    separator?: string;
    placeholder?: string;
    suggestions?: string[];
    allowCustom?: boolean;
    description?: string;
  };
}

export function TagListWidget(props: TagListWidgetProps) {
  const { value, onChange, options = {}, disabled, readonly } = props;
  const { separator = ',', placeholder = 'Add item...', suggestions = [] } = options;
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Parse current value into array
  const tags: string[] = value
    ? String(value).split(separator).map(s => s.trim()).filter(Boolean)
    : [];

  // Serialize tags back to string
  const serializeTags = (newTags: string[]): string => {
    return newTags.join(separator);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      onChange(serializeTags(newTags));
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.length > 0 ? serializeTags(newTags) : '');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {/* Tags display */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm"
          >
            <code className="text-xs">{tag}</code>
            {!readonly && !disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:bg-blue-200 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input with suggestions */}
      {!readonly && !disabled && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputValue.trim() && addTag(inputValue)}
              disabled={!inputValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.slice(0, 10).map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm font-mono"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Serialized value preview (for debugging, can be hidden) */}
      {tags.length > 0 && (
        <div className="text-xs text-gray-400 font-mono truncate">
          → {value}
        </div>
      )}
    </div>
  );
}

export default TagListWidget;
