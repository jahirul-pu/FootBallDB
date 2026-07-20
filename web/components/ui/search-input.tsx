import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, onChange, ...props }, ref) => {
    return (
      <div className={cn('relative flex items-center', className)}>
        <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border py-2 pr-10 pl-9 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:bg-accent hover:text-foreground absolute right-2 flex h-6 w-6 items-center justify-center rounded-sm"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';
