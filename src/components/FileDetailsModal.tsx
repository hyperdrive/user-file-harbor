
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserFile } from "@/types/file";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface FileDetailsModalProps {
  file: UserFile | null;
  open: boolean;
  onClose: () => void;
}

const FileDetailsModal = ({ file, open, onClose }: FileDetailsModalProps) => {
  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{file.title}</DialogTitle>
          {file.summary && (
            <DialogDescription>{file.summary}</DialogDescription>
          )}
        </DialogHeader>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-6 py-4">
            <div className="text-sm">
              {file.text.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {file.images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {file.images.map((image) => (
                    <div key={image.id} className="rounded-md overflow-hidden border">
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={image.url}
                          alt={`Image ${image.id}`}
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileDetailsModal;
