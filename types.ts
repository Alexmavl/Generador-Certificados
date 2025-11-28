export enum ElementType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface DraggableElement {
  id: string;
  type: ElementType;
  label: string; // Display name
  valueKey?: string; // Key in Excel data (e.g., 'Name', 'Hours')
  content?: string | File; // Static content or File for images
  x: number; // Percentage 0-100 relative to canvas
  y: number; // Percentage 0-100 relative to canvas
  width?: number; // For images
  height?: number; // For images
  fontSize?: number; // For text
  fontFamily?: string;
  fontStyle?: string; // Normal, Bold, Italic, BoldItalic
  color?: string;
  previewUrl?: string; // For image previews
}

export interface ExcelData {
  [key: string]: any;
}

export interface AppState {
  step: number;
  pdfFile: File | null;
  excelFile: File | null;
  excelData: ExcelData[];
  excelColumns: string[];
  elements: DraggableElement[];
  isGenerating: boolean;
  progress: number;
}