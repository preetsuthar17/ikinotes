"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/chip";
import { X } from "lucide-react";

const tagInputVariants = cva(
  "min-h-9 w-full rounded-ele border border-border bg-input px-3 py-2 text-sm ring-offset-background transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border",
        destructive: "border-destructive focus-within:ring-destructive",
      },
      size: {
        sm: "min-h-8 px-2 py-1 text-xs",
        default: "min-h-9 px-3 py-2 text-sm",
        lg: "min-h-10 px-4 py-2",
        xl: "min-h-12 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface TagInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "value" | "onChange"
    >,
    VariantProps<typeof tagInputVariants> {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  tagVariant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  tagSize?: "sm" | "default" | "lg";
  allowDuplicates?: boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  separator?: string | RegExp;
  clearAllButton?: boolean;
  onClearAll?: () => void;
  disabled?: boolean;
  error?: boolean;
  suggestions?: string[];
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      className,
      variant,
      size,
      tags,
      onTagsChange,
      maxTags,
      placeholder = "Type and press Enter to add tags...",
      tagVariant = "secondary",
      tagSize = "sm",
      allowDuplicates = false,
      onTagAdd,
      onTagRemove,
      separator = ",",
      clearAllButton = false,
      onClearAll,
      disabled,
      error,
      suggestions = [],
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

    const addTag = React.useCallback(
      (tag: string) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        if (!allowDuplicates && tags.includes(trimmedTag)) return;
        if (maxTags && tags.length >= maxTags) return;

        const newTags = [...tags, trimmedTag];
        onTagsChange(newTags);
        onTagAdd?.(trimmedTag);
        setInputValue("");
      },
      [tags, onTagsChange, onTagAdd, allowDuplicates, maxTags]
    );

    const removeTag = React.useCallback(
      (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        onTagsChange(newTags);
        onTagRemove?.(tagToRemove);
      },
      [tags, onTagsChange, onTagRemove]
    );

    // Filter suggestions: not already tagged, matches input, case-insensitive
    const filteredSuggestions = React.useMemo(() => {
      if (!inputValue.trim()) return [];
      const lowerInput = inputValue.toLowerCase();
      return suggestions
        .filter(
          (s) =>
            !tags.includes(s) &&
            s.toLowerCase().includes(lowerInput) &&
            s.trim() !== ""
        )
        .slice(0, 6); // limit to 6 suggestions
    }, [inputValue, suggestions, tags]);

    // Reset highlight when suggestions/input changes
    React.useEffect(() => {
      setHighlightedIndex(filteredSuggestions.length > 0 ? 0 : -1);
    }, [filteredSuggestions.length, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (separator instanceof RegExp) {
        const parts = value.split(separator);
        if (parts.length > 1) {
          parts.slice(0, -1).forEach((part) => addTag(part));
          setInputValue(parts[parts.length - 1]);
          return;
        }
      } else if (typeof separator === "string" && value.includes(separator)) {
        const parts = value.split(separator);
        parts.slice(0, -1).forEach((part) => addTag(part));
        setInputValue(parts[parts.length - 1]);
        return;
      }

      setInputValue(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Keyboard navigation for suggestions
      if (isFocused && filteredSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          return;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          return;
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
          e.preventDefault();
          addTag(filteredSuggestions[highlightedIndex]);
          return;
        }
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        addTag(inputValue);
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        tags.length > 0
      ) {
        removeTag(tags[tags.length - 1]);
      }
    };

    const handleClearAll = () => {
      onTagsChange([]);
      onClearAll?.();
      setInputValue("");
    };

    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    const chipSizeMapping = {
      sm: "sm" as const,
      default: "sm" as const,
      lg: "default" as const,
      xl: "default" as const,
    };

    return (
      <div className="relative">
        <div
          className={cn(
            tagInputVariants({
              variant: error ? "destructive" : variant,
              size,
            }),
            "cursor-text",
            className
          )}
          onClick={handleContainerClick}
        >
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {tags.map((tag, index) => (
                <motion.div
                  key={`${tag}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                  layout
                >
                  <Chip
                    variant={tagVariant}
                    size={chipSizeMapping[size || "default"]}
                    dismissible
                    onDismiss={() => removeTag(tag)}
                    className="pointer-events-auto rounded-card"
                  >
                    {tag}
                  </Chip>
                </motion.div>
              ))}
            </AnimatePresence>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : ""}
              disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
              className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 100)}
              {...props}
            />
          </div>
        </div>
        {/* Suggestions dropdown */}
        {isFocused && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 z-10 mt-1 w-full rounded-ele border border-border bg-popover shadow-lg text-sm max-h-48 overflow-auto">
            {filteredSuggestions.map((sugg, idx) => (
              <button
                key={sugg}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 transition-colors",
                  idx === highlightedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                )}
                onMouseDown={e => {
                  e.preventDefault();
                  addTag(sugg);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {sugg}
              </button>
            ))}
          </div>
        )}
        {clearAllButton && tags.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-ele p-1 hover:bg-accent transition-colors disabled:pointer-events-none disabled:opacity-50"
            aria-label="Clear all tags"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";

export { TagInput, tagInputVariants };
