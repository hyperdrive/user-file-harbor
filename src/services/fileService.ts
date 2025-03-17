
import { API_CONFIG } from "@/config/api";
import { UserFile } from "@/types/file";

export const fileService = {
  async listFiles(): Promise<UserFile[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/files`);
      
      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch files:", error);
      throw error;
    }
  },
  
  async uploadFile(fileData: FormData): Promise<UserFile> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/files`, {
        method: "POST",
        body: fileData,
      });
      
      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  },
  
  async deleteFile(fileId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/files/${fileId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting file: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to delete file with ID ${fileId}:`, error);
      throw error;
    }
  }
};
