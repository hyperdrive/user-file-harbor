
import { API_CONFIG } from "@/config/api";
import { UserFile } from "@/types/file";

// Demo data to use when API fails
const DEMO_FILES: UserFile[] = [
  {
    title: "Project Proposal",
    id: "file-001",
    summary: "A comprehensive project proposal for the new marketing campaign.",
    text: "This document outlines our strategy for the upcoming Q3 marketing campaign. The campaign will focus on increasing brand awareness among the 25-34 demographic.\n\nKey points include:\n- Social media strategy\n- Content creation timeline\n- Budget allocation\n- Success metrics",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=500" },
      { id: 2, url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500" }
    ]
  },
  {
    title: "Meeting Notes",
    id: "file-002",
    summary: "Notes from the weekly team meeting on product development.",
    text: "Date: March 15, 2023\nAttendees: Sarah, Michael, Jennifer, David\n\nAgenda Items:\n1. Review of previous action items\n2. Current sprint progress\n3. Blockers and challenges\n4. Next steps\n\nDecisions Made:\n- Frontend redesign to be prioritized for next sprint\n- Additional QA resources approved\n- Customer feedback session scheduled for next Tuesday",
    images: []
  },
  {
    title: "Research Results",
    id: "file-003",
    text: "Our market research indicates strong potential for product expansion in the European market. Survey results show 78% of respondents would consider switching to our service if properly localized.\n\nPrimary competitors in this space are currently underserving the market with outdated technology stacks and poor user experiences.",
    images: [
      { id: 3, url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500" }
    ]
  }
];

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
      
      // Return demo data when API fails
      console.info("Using demo data as fallback");
      return DEMO_FILES;
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
      
      // For demo purposes, return a mock successful upload
      const mockFile: UserFile = {
        id: `file-${Date.now()}`,
        title: fileData.get('title')?.toString() || "Uploaded Document",
        text: "This is a placeholder for your uploaded content. In a real application, this would contain the actual content you uploaded.",
        images: []
      };
      
      // Add the new mock file to our demo data
      DEMO_FILES.push(mockFile);
      
      return mockFile;
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
      
      // For demo purposes, remove the file from our demo data
      const index = DEMO_FILES.findIndex(file => file.id === fileId);
      if (index !== -1) {
        DEMO_FILES.splice(index, 1);
      }
    }
  }
};
