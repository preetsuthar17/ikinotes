// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
import type { DateOrder } from '@/utils/note-utils';

interface NotesFilterProps {
  tagFilter: string;
  dateOrder: DateOrder;
  allTags: string[];
  onTagFilterChange: (value: string) => void;
  onDateOrderChange: (value: DateOrder) => void;
}

export function NotesFilter({
  tagFilter,
  dateOrder,
  allTags,
  onTagFilterChange,
  onDateOrderChange,
}: NotesFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="w-40 min-w-[120px]">
        <Select onValueChange={onTagFilterChange} value={tagFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-40 min-w-[120px]">
        <Select
          onValueChange={(v) => onDateOrderChange(v as DateOrder)}
          value={dateOrder}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
