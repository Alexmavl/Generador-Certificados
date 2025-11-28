import React, { useEffect, useRef, useState } from 'react';
import { DraggableElement, ElementType } from '../types';
import { Move, Trash2 } from 'lucide-react';

interface EditorCanvasProps {
  pdfFile: File;
  elements: DraggableElement[];
  onUpdateElements: (elements: DraggableElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

// Global variable for PDF.js
declare const pdfjsLib: any;

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  pdfFile,
  elements,
  onUpdateElements,
  selectedElementId,
  onSelectElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Render PDF to canvas
  useEffect(() => {
    const renderPdf = async () => {
      if (!pdfFile || !canvasRef.current) return;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const desiredWidth = containerRef.current?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const scale = desiredWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;
    };

    renderPdf();
    window.addEventListener('resize', renderPdf);
    return () => window.removeEventListener('resize', renderPdf);
  }, [pdfFile]);

  const handleMouseDown = (e: React.MouseEvent, id: string, xPercent: number, yPercent: number) => {
    e.stopPropagation();
    onSelectElement(id);
    setIsDragging(true);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentPixelX = (xPercent / 100) * rect.width;
      const currentPixelY = (yPercent / 100) * rect.height;
      
      setDragOffset({
        x: e.clientX - rect.left - currentPixelX,
        y: e.clientY - rect.top - currentPixelY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    const newXPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newYPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

    const updatedElements = elements.map((el) =>
      el.id === selectedElementId ? { ...el, x: newXPercent, y: newYPercent } : el
    );
    onUpdateElements(updatedElements);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onUpdateElements(elements.filter(el => el.id !== id));
    if (selectedElementId === id) onSelectElement(null);
  }

  const getFontFamilyCSS = (family?: string) => {
    switch(family) {
      case 'Times-Roman': return '"Times New Roman", Times, serif';
      case 'Courier': return '"Courier New", Courier, monospace';
      case 'Helvetica': default: return 'Helvetica, Arial, sans-serif';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full shadow-2xl rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-auto block" />
      
      {elements.map((el) => (
        <div
          key={el.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group select-none 
            ${selectedElementId === el.id ? 'z-50' : 'z-10'}`}
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
          onMouseDown={(e) => handleMouseDown(e, el.id, el.x, el.y)}
        >
          <div className={`relative p-2 border-2 rounded ${
            selectedElementId === el.id ? 'border-blue-500 bg-blue-500/10' : 'border-transparent hover:border-blue-300'
          }`}>
            
            {selectedElementId === el.id && (
              <button 
                onClick={(e) => handleDelete(e, el.id)}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
              >
                <Trash2 size={12} />
              </button>
            )}

            {el.type === ElementType.TEXT ? (
              <div 
                className="whitespace-nowrap"
                style={{ 
                  fontSize: `${el.fontSize || 12}px`,
                  color: el.color || '#000',
                  fontFamily: getFontFamilyCSS(el.fontFamily),
                  fontWeight: el.fontStyle?.includes('Bold') ? 'bold' : 'normal',
                  fontStyle: el.fontStyle?.includes('Italic') ? 'italic' : 'normal',
                  textShadow: '0 0 2px rgba(255,255,255,0.8)'
                }}
              >
                {el.valueKey ? `{${el.valueKey}}` : (el.content as string)}
              </div>
            ) : (
              <div className="relative">
                {el.previewUrl ? (
                   <img 
                   src={el.previewUrl} 
                   alt={el.label} 
                   className="object-contain"
                   style={{
                     width: el.width ? `${el.width * 5}px` : '100px',
                     maxHeight: '100px'
                   }}
                 />
                ) : (
                  <div className="w-24 h-12 bg-gray-200 flex items-center justify-center text-xs border border-dashed border-gray-400">
                    {el.label}
                  </div>
                )}
              </div>
            )}
            
             <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${selectedElementId === el.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
               <Move size={12} className="text-blue-600 bg-white rounded-full shadow-sm" />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};