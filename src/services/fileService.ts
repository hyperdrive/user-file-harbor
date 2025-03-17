
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
      console.log("Starting SSE connection to:", `${API_CONFIG.BASE_URL}/files`);
      
      return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`${API_CONFIG.BASE_URL}/files`);
        
        // Log when the connection is established
        eventSource.onopen = () => {
          console.log("SSE connection opened successfully");
        };
        
        // Listen for all message events for debugging
        eventSource.onmessage = (event) => {
          console.log("Received generic SSE message:", event);
        };
        
        eventSource.addEventListener('data', (event) => {
          console.log("Received 'data' event:", event);
          console.log("Event data content:", event.data);
          
          try {
            const rawFiles = JSON.parse(event.data);
            console.log("Successfully parsed data:", rawFiles);
            
            // Process the files to ensure they match our UserFile type
            const files: UserFile[] = rawFiles.map((file: any) => {
              console.log("Processing file:", file);
              
              // Generate a unique ID if the incoming ID is invalid
              let fileId = file.id?.toString();
              if (!fileId || fileId === "-1") {
                fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                console.log(`Generated new ID for file "${file.title}":`, fileId);
              }
              
              return {
                title: file.title,
                id: fileId,
                summary: file.summary,
                text: file.text,
                images: file.images || [],
                metadata: file.metadata
              };
            });
            
            console.log("Processed files:", files);
            eventSource.close();
            console.log("SSE connection closed after successful data processing");
            resolve(files);
          } catch (parseError) {
            console.error("Error parsing SSE data:", parseError);
            console.error("Raw data that failed to parse:", event.data);
            eventSource.close();
            console.log("SSE connection closed due to parse error");
            reject(parseError);
          }
        });
        
        eventSource.addEventListener('error', (error) => {
          console.error("SSE connection error:", error);
          console.log("Error event details:", {
            readyState: eventSource.readyState,
            withCredentials: eventSource.withCredentials,
            url: eventSource.url
          });
          
          eventSource.close();
          console.log("SSE connection closed due to error");
          // Return demo data when SSE connection fails
          console.info("Using demo data as fallback for SSE error");
          resolve(DEMO_FILES);
        });
        
        // Safety timeout in case the server doesn't respond
        setTimeout(() => {
          if (eventSource.readyState !== EventSource.CLOSED) {
            console.warn("SSE connection timed out after 10 seconds");
            eventSource.close();
            console.log("SSE connection closed due to timeout");
            console.info("Using demo data as fallback for timeout");
            resolve(DEMO_FILES);
          }
        }, 10000);
      });
    } catch (error) {
      console.error("Failed to establish SSE connection:", error);
      
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
