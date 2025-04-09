
import { API_CONFIG } from "@/config/api";
import { UserFile } from "@/types/file";
import { SSE } from 'sse.js';

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

interface SSECustomEvent<T = any> extends CustomEvent<T> {
  data: string;
}

type SSEOptions = ConstructorParameters<typeof SSE>[1];
async function sseFetch<T>(url: string, event: string, timeout = 5000, options: SSEOptions = {},
  callback?: { filter: string[], handler: (event: SSECustomEvent, data: unknown) => void }
 ): Promise<T> {
  return new Promise((resolve, reject) => {
    const eventSource = new SSE(url, options);
    let timer: NodeJS.Timeout | number | null = null;

    // Helper function to reset the timeout timer
    const resetTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        eventSource.close();
        reject(new Error("SSE connection failed to open"));
      }, timeout);
    };

    // Start the initial timeout
    resetTimer();

    // Listen for the main event
    eventSource.addEventListener(event, (evt: SSECustomEvent) => {
      // Reset the timer for subsequent events, if needed
      resetTimer();
      // Resolve immediately since we got our event
      resolve(JSON.parse(evt.data));
      // Optional: Clear the timer once resolved
      if (timer !== null) {
        clearTimeout(timer);
      }
    });

    // Listen for errors on the SSE
    eventSource.addEventListener('error', (error: any) => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      eventSource.close();
      reject(error);
    });

    // Attach additional filters if provided, and have them use the same timer
    if (callback) {
      for (const filter of callback.filter) {
        eventSource.addEventListener(filter, (evt: SSECustomEvent) => {
          // Reset the timer for these events as well
          resetTimer();
          callback.handler(evt, JSON.parse(evt.data));
        });
      }
    }
  });
}

export const fileService = {
  async listFiles(): Promise<UserFile[]> {
    try {
      const files = await sseFetch<UserFile[]>(`${API_CONFIG.BASE_URL}/files`, 'files');
      return files.map((file) => ({
        title: file.title,
        id: file.id ?? `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        summary: file.summary,
        text: file.text,
        images: file.images
      }));
    } catch (error) {
      console.error("Failed to list files:", error);
      return DEMO_FILES;
    }
  },

  async uploadFile(fileData: FormData, callback: Parameters<typeof sseFetch>[4]): Promise<number> {

    const { token, vault_access_key_id } = await sseFetch<{ token: string, vault_access_key_id: string }>(`${API_CONFIG.BASE_URL}/files/upload_token`, 'token');

    const title = fileData.get('title') as string;
    const content = fileData.get('text') as string;

    let fileCount = 0;
    let file: File | undefined;
    fileData.forEach((value, key) => {
      if (key.startsWith('file-') && value instanceof File) {
        fileCount++;
        file = value;
      }
    });

    let oid = -1;
    if (fileCount > 0 && file) {
      console.log(file)
      const response = await fetch(`https://platform.mainly.ai/api/vault/v1/${vault_access_key_id}/objects`, {
        method: 'POST',
        headers: {
          'x-apikey': token,
          'Content-Type': 'text/plain',
          'x-filename': file.name,
          //'x-filename': `${title.toLowerCase().replace(/ /g, '-')}.txt`,
        },
        body: file.stream(),
        // @ts-ignore - this is valid
        duplex: 'half',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const { oid: uploadedOid } = await response.json();
      oid = uploadedOid;

    } else {
      console.log("JUST TAKING THE TEXT")
      oid = -1;
    }
    let payload = ''
    if (oid != -1) {
      console.log("OID != -1")
      payload = JSON.stringify({
        title,
        oid
      })
    } else {
      payload = JSON.stringify({
        title,
        text: content
      })
    }

    const id = await sseFetch<number>(`${API_CONFIG.BASE_URL}/files`, 'created', 30000, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: payload
    }, callback);

    console.log('Uploaded file with ID:', id);
    return id;
  },

  async deleteFile(fileId: string): Promise<void> {
    await sseFetch(`${API_CONFIG.BASE_URL}/files/${fileId}`, 'deleted', 5000, {
      method: 'DELETE',
    });
  }
};
