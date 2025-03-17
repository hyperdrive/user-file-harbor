
export interface FileImage {
  id: number;
  url: string;
}

export interface UserFile {
  title: string;
  id: string;
  summary?: string;
  text: string;
  images: FileImage[];
}
