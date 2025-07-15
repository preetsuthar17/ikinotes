import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Folder } from "@/lib/note-storage";

interface FolderCardProps {
  folder: Folder;
  onDelete: (id: string) => void;
}

export function FolderCard({ folder, onDelete }: FolderCardProps) {
  return (
    <Card className="relative group">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="truncate flex-1">{folder.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onDelete(folder.id)}
              variant="destructive"
            >
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  );
}
