import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import sanitizeHtml from "sanitize-html";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeString(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "u", "br", "p", "ul", "ol", "li"],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}
