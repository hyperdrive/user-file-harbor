
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserFile } from "@/types/file";
import { FileText, Trash, Image } from "lucide-react";

interface FileCardProps {
  file: UserFile;
  onView: (file: UserFile) => void;
  onDelete: (fileId: string) => void;
}

const FileCard = ({ file, onView, onDelete }: FileCardProps) => {
  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-ellipsis overflow-hidden line-clamp-1">
            {file.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2" onClick={() => onView(file)}>
        <p className="text-sm text-muted-foreground line-clamp-3">{file.summary || file.text.slice(0, 100)}...</p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Document</span>
        </div>
        {file.images.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Image className="h-3 w-3" />
            <span className="text-xs">{file.images.length}</span>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default FileCard;
