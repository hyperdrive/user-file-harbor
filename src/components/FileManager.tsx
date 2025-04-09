
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "@/services/fileService";
import { UserFile } from "@/types/file";
import { toast } from "sonner";
import FileCard from "./FileCard";
import FileDetailsModal from "./FileDetailsModal";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileText } from "lucide-react";

const FileManager = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<UserFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<UserFile | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const {
    data: files,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["files"],
    queryFn: fileService.listFiles
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fileService.uploadFile(formData, {
        "filter": ['progress'],
        "handler": (event,data) => {
         console.log(event,data)
         if (event == 'progress') {
          let message = (data as {message: string}).message
          toast.info(message)
         }
        }
      })},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      toast.success("File deleted successfully");
      setFileToDelete(null);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    },
  });

  const handleViewFile = (file: UserFile) => {
    setSelectedFile(file);
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files?.find((f) => f.id === fileId) || null;
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteMutation.mutate(fileToDelete.id);
    }
  };

  const handleUpload = async (formData: FormData) => {
    await uploadMutation.mutateAsync(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Files</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        </div>

        {isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>Error loading files: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse"></div>
            ))}
          </div>
        ) : files && files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onView={handleViewFile}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No files found</h2>
            <p className="text-muted-foreground mb-6">
              Upload your first file to get started
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </div>
        )}
      </div>

      <FileDetailsModal
        file={selectedFile}
        open={!!selectedFile}
        onClose={() => setSelectedFile(null)}
      />

      <DeleteConfirmationDialog
        open={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDelete}
        title={fileToDelete?.title || ""}
      />

      <FileUpload
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default FileManager;
