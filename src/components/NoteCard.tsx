import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Note } from "@/lib/note-storage";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

export function NoteCard({ note, onDelete, onOpen }: NoteCardProps) {
  return (
    <Card
      className="relative group w-full cursor-pointer"
      onClick={() => onOpen(note.id)}
    >
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="truncate flex-1 cursor-pointer">
          {note.title || "Untitled Note"}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDelete(note.id)}
              variant="destructive"
            >
              Delete Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground line-clamp-2">
          {note.content || "No content yet."}
        </div>
      </CardContent>
    </Card>
  );
}
