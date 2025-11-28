import { ElementType, DraggableElement } from './types';

export const STEPS = [
  { number: 1, title: 'Upload Files', description: 'Template & Data' },
  { number: 2, title: 'Configure', description: 'Drag & Drop Layout' },
  { number: 3, title: 'Generate', description: 'Download Certificates' },
];

export const FONT_FAMILIES = [
  'Helvetica',
  'Times-Roman',
  'Courier',
];

export const FONT_STYLES = [
  'Normal',
  'Bold',
  'Italic',
  'BoldItalic',
];

export const INITIAL_ELEMENTS: DraggableElement[] = [
  {
    id: 'name_placeholder',
    type: ElementType.TEXT,
    label: 'Student Name',
    valueKey: '', // Will auto-map to 'Nombre' if found
    x: 50,
    y: 45,
    fontSize: 24,
    fontFamily: 'Helvetica',
    fontStyle: 'Bold',
    color: '#000000',
  },
  {
    id: 'hours_placeholder',
    type: ElementType.TEXT,
    label: 'Course Duration',
    valueKey: '', // Will auto-map to 'Duration' if found
    x: 50,
    y: 55,
    fontSize: 14,
    fontFamily: 'Helvetica',
    fontStyle: 'Normal',
    color: '#333333',
  },
];