import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { StepIndicator } from './components/StepIndicator';
import { EditorCanvas } from './components/EditorCanvas';
import { generateCertificates } from './utils/pdfHelpers';
import { AppState, DraggableElement, ElementType, ExcelData } from './types';
import { INITIAL_ELEMENTS, FONT_FAMILIES, FONT_STYLES } from './constants';
import { FileSpreadsheet, FileText, Image as Download, Plus, Type, Stamp, Settings, Palette, Mail, MessageCircle } from 'lucide-react';

// Personalization interface
interface PersonalizationSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const App: React.FC = () => {
  // Load personalization settings from localStorage
  const loadPersonalization = (): PersonalizationSettings => {
    const saved = localStorage.getItem('certificateAppPersonalization');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      primaryColor: '#2563eb',
      secondaryColor: '#4f46e5',
      accentColor: '#10b981',
    };
  };

  const [state, setState] = useState<AppState>({
    step: 1,
    pdfFile: null,
    excelFile: null,
    excelData: [],
    excelColumns: [],
    elements: INITIAL_ELEMENTS,
    isGenerating: false,
    progress: 0,
  });

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [personalization, setPersonalization] = useState<PersonalizationSettings>(loadPersonalization());
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(false);

  // Save personalization settings to localStorage
  useEffect(() => {
    localStorage.setItem('certificateAppPersonalization', JSON.stringify(personalization));
  }, [personalization]);

  // --- Handlers ---

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setState(prev => ({ ...prev, pdfFile: e.target.files![0] }));
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const arrayBuffer = evt.target?.result;
        // Use 'array' type to better handle UTF-8/Unicode in CSVs
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // defval: "" ensures empty cells aren't skipped, keeping rows aligned
        const data = XLSX.utils.sheet_to_json<ExcelData>(ws, { defval: "" });

        if (data.length > 0) {
          const columns = Object.keys(data[0]);

          // Auto-map columns if matches found
          let newElements = [...state.elements];

          // Try to find Name column
          const nameCol = columns.find(c => /nombre|name|student|alumno/i.test(c));
          if (nameCol) {
            newElements = newElements.map(el =>
              el.id === 'name_placeholder' ? { ...el, valueKey: nameCol } : el
            );
          }

          // Try to find Duration/Hours column
          const timeCol = columns.find(c => /duration|duracion|hours|horas|tiempo/i.test(c));
          if (timeCol) {
            newElements = newElements.map(el =>
              el.id === 'hours_placeholder' ? { ...el, valueKey: timeCol } : el
            );
          }

          setState(prev => ({
            ...prev,
            excelFile: file,
            excelData: data,
            excelColumns: columns,
            elements: newElements
          }));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const addTextElement = () => {
    const newId = `text_${Date.now()}`;
    const newElement: DraggableElement = {
      id: newId,
      type: ElementType.TEXT,
      label: 'New Text',
      content: 'Sample Text',
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: 'Helvetica',
      fontStyle: 'Normal',
      color: '#000000',
    };
    setState(prev => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
  };

  const addImageElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const newId = `img_${Date.now()}`;
        const newElement: DraggableElement = {
          id: newId,
          type: ElementType.IMAGE,
          label: file.name,
          content: file,
          previewUrl: evt.target?.result as string,
          x: 50,
          y: 50,
          width: 20, // percentage width
          height: 10, // will be auto-calculated ratio in renderer
        };
        setState(prev => ({ ...prev, elements: [...prev.elements, newElement] }));
        setSelectedElementId(newId);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (id: string, updates: Partial<DraggableElement>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    }));
  };

  const handleGenerate = async () => {
    if (!state.pdfFile) return;

    setState(prev => ({ ...prev, isGenerating: true, progress: 0 }));

    try {
      const blob = await generateCertificates(
        state.pdfFile,
        state.excelData,
        state.elements,
        (progress) => setState(prev => ({ ...prev, progress }))
      );
      FileSaver.saveAs(blob, 'certificates_bundle.zip');
      setState(prev => ({ ...prev, step: 3 }));
    } catch (error) {
      console.error(error);
      alert('Error generating certificates. Please check console.');
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const resetPersonalization = () => {
    const defaultSettings: PersonalizationSettings = {
      primaryColor: '#2563eb',
      secondaryColor: '#4f46e5',
      accentColor: '#10b981',
    };
    setPersonalization(defaultSettings);
  };

  // --- Render Sections ---

  const renderPersonalizationPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowPersonalizationPanel(false)}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette size={24} style={{ color: personalization.primaryColor }} />
            <h2 className="text-2xl font-bold" style={{ color: personalization.primaryColor }}>Personalización</h2>
          </div>
          <button onClick={() => setShowPersonalizationPanel(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Color Scheme */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Esquema de colores</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Color primario</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={personalization.primaryColor}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    value={personalization.primaryColor}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-2 py-2 text-sm border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Color secundario</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={personalization.secondaryColor}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    value={personalization.secondaryColor}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-2 py-2 text-sm border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Color de acento</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={personalization.accentColor}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
                  />
                  <input
                    type="text"
                    value={personalization.accentColor}
                    onChange={(e) => setPersonalization(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="flex-1 px-2 py-2 text-sm border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Temas predefinidos</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setPersonalization(prev => ({ ...prev, primaryColor: '#2563eb', secondaryColor: '#4f46e5', accentColor: '#10b981' }))}
                  className="p-3 rounded-lg border-2 hover:border-blue-500 transition-colors"
                >
                  <div className="flex space-x-1 mb-1">
                    <div className="w-4 h-4 rounded bg-blue-600"></div>
                    <div className="w-4 h-4 rounded bg-indigo-600"></div>
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                  </div>
                  <span className="text-xs font-medium">Azul</span>
                </button>
                <button
                  onClick={() => setPersonalization(prev => ({ ...prev, primaryColor: '#dc2626', secondaryColor: '#ea580c', accentColor: '#facc15' }))}
                  className="p-3 rounded-lg border-2 hover:border-red-500 transition-colors"
                >
                  <div className="flex space-x-1 mb-1">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <div className="w-4 h-4 rounded bg-orange-600"></div>
                    <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  </div>
                  <span className="text-xs font-medium">Rojo</span>
                </button>
                <button
                  onClick={() => setPersonalization(prev => ({ ...prev, primaryColor: '#7c3aed', secondaryColor: '#a855f7', accentColor: '#ec4899' }))}
                  className="p-3 rounded-lg border-2 hover:border-purple-500 transition-colors"
                >
                  <div className="flex space-x-1 mb-1">
                    <div className="w-4 h-4 rounded bg-violet-600"></div>
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <div className="w-4 h-4 rounded bg-pink-500"></div>
                  </div>
                  <span className="text-xs font-medium">Púrpura</span>
                </button>
                <button
                  onClick={() => setPersonalization(prev => ({ ...prev, primaryColor: '#059669', secondaryColor: '#0d9488', accentColor: '#0891b2' }))}
                  className="p-3 rounded-lg border-2 hover:border-green-500 transition-colors"
                >
                  <div className="flex space-x-1 mb-1">
                    <div className="w-4 h-4 rounded bg-green-600"></div>
                    <div className="w-4 h-4 rounded bg-teal-600"></div>
                    <div className="w-4 h-4 rounded bg-cyan-600"></div>
                  </div>
                  <span className="text-xs font-medium">Verde</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={resetPersonalization}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Restablecer valores predeterminados
            </button>
            <button
              onClick={() => setShowPersonalizationPanel(false)}
              className="px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              style={{ backgroundColor: personalization.primaryColor }}
            >
              Guardar y cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Upload */}
        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${state.pdfFile ? `bg-green-50` : 'border-gray-300'}`} style={{ borderColor: state.pdfFile ? personalization.accentColor : '#d1d5db' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${personalization.primaryColor}20`, color: personalization.primaryColor }}>
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Suba la plantilla del diploma en pdf</h3>
          <p className="text-sm text-gray-500 mb-4">Debe ser un archivo PDF (por ejemplo, diploma_template.pdf)</p>
          <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded cursor-pointer shadow-sm transition-colors">
            <span>{state.pdfFile ? 'Change PDF' : 'Select PDF'}</span>
            <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          </label>
          {state.pdfFile && <span className="mt-2 text-sm font-medium" style={{ color: personalization.accentColor }}>{state.pdfFile.name}</span>}
        </div>

        {/* Excel Upload */}
        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${state.excelFile ? `bg-green-50` : 'border-gray-300'}`} style={{ borderColor: state.excelFile ? personalization.accentColor : '#d1d5db' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${personalization.secondaryColor}20`, color: personalization.secondaryColor }}>
            <FileSpreadsheet size={32} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Subir los datos de los estudiantes</h3>
          <p className="text-sm text-gray-500 mb-4">Excel o CSV (con nombre, duración, etc.)</p>
          <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded cursor-pointer shadow-sm transition-colors">
            <span>{state.excelFile ? 'Change Excel' : 'Select Excel/CSV'}</span>
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleExcelUpload} />
          </label>
          {state.excelFile && <span className="mt-2 text-sm font-medium" style={{ color: personalization.accentColor }}>{state.excelFile.name} ({state.excelData.length} rows)</span>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          disabled={!state.pdfFile || !state.excelFile}
          onClick={() => setState(prev => ({ ...prev, step: 2 }))}
          className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform ${!state.pdfFile || !state.excelFile
            ? 'bg-gray-300 cursor-not-allowed'
            : 'hover:-translate-y-0.5'
            }`}
          style={{ backgroundColor: (!state.pdfFile || !state.excelFile) ? '#d1d5db' : personalization.primaryColor }}
        >
          Siguiente: Configurar el diseño &rarr;
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedElement = state.elements.find(el => el.id === selectedElementId);

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col overflow-y-auto">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Plus size={18} className="mr-2" /> Añadir elementos
          </h3>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={addTextElement}
              className="flex flex-col items-center justify-center p-3 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Type size={20} className="mb-1 text-gray-600" />
              <span className="text-xs font-medium">Añadir Texto</span>
            </button>
            <label className="flex flex-col items-center justify-center p-3 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
              <Stamp size={20} className="mb-1 text-gray-600" />
              <span className="text-xs font-medium">Añadir Sello</span>
              <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={addImageElement} />
            </label>
          </div>

          <hr className="mb-4 border-gray-100" />

          {selectedElement ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Propiedades</h4>
                <button
                  onClick={() => setState(prev => ({
                    ...prev,
                    elements: prev.elements.filter(el => el.id !== selectedElement.id)
                  }))}
                  className="text-red-500 text-xs hover:underline"
                >
                  Borrar
                </button>
              </div>

              {/* Common Label */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={selectedElement.label}
                  onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                  className="w-full text-sm border-gray-300 rounded p-2 border focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Text Specifics */}
              {selectedElement.type === ElementType.TEXT && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Asignar a columna de Excel</label>
                    <select
                      value={selectedElement.valueKey || ''}
                      onChange={(e) => updateElement(selectedElement.id, { valueKey: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded p-2 border focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Texto estático --</option>
                      {state.excelColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  {!selectedElement.valueKey && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Contenido de texto estático</label>
                      <input
                        type="text"
                        value={selectedElement.content as string}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        className="w-full text-sm border-gray-300 rounded p-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de fuente</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                        className="w-full text-sm border-gray-300 rounded p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-full h-9 border-gray-300 rounded p-1 border cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Familia de fuentes</label>
                    <select
                      value={selectedElement.fontFamily || 'Helvetica'}
                      onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded p-2 border"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estilo de fuente</label>
                    <select
                      value={selectedElement.fontStyle || 'Normal'}
                      onChange={(e) => updateElement(selectedElement.id, { fontStyle: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded p-2 border"
                    >
                      {FONT_STYLES.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Image Specifics */}
              {selectedElement.type === ElementType.IMAGE && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño (Ancho %)</label>
                  <input
                    type="range"
                    min="5" max="50"
                    value={selectedElement.width || 20}
                    onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

            </div>
          ) : (
            <div className="text-center text-gray-400 py-10 text-sm">
              Selecciona un elemento en el certificado para editar sus propiedades.
            </div>
          )}

          <div className="mt-auto pt-6">
            <button
              onClick={handleGenerate}
              disabled={state.isGenerating}
              className="w-full py-3 text-white rounded-lg font-bold shadow-md flex justify-center items-center transition-all"
              style={{ backgroundColor: personalization.primaryColor, opacity: state.isGenerating ? 0.7 : 1 }}
            >
              {state.isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando... {Math.round(state.progress)}%
                </>
              ) : (
                <>Generar Certificados</>
              )}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-200 rounded-xl overflow-auto p-4 flex items-start justify-center">
          {state.pdfFile && (
            <EditorCanvas
              pdfFile={state.pdfFile}
              elements={state.elements}
              onUpdateElements={(newElements) => setState(prev => ({ ...prev, elements: newElements }))}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
            />
          )}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Download size={48} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Certificados listos!</h2>
      <p className="text-gray-600 mb-8 max-w-md text-center">
        Tu lote de {state.excelData.length} Los certificados se han generado correctamente. La descarga debería haberse iniciado automáticamente.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 1, elements: INITIAL_ELEMENTS }))}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <header className="shadow-lg sticky top-0 z-50" style={{ backgroundColor: personalization.primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 rounded overflow-hidden bg-white px-2 py-1">
              <img src="./image/Logotipo MV transparente.png" alt="Logo MV" className="h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Generador de Certificados
            </h1>
          </div>

          <button
            onClick={() => setShowPersonalizationPanel(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-white text-white hover:bg-opacity-80 transition-all"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Settings size={18} />
            <span className="hidden sm:inline font-medium">Personalizar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <StepIndicator currentStep={state.step} />

        <div className="mt-8">
          {state.step === 1 && renderStep1()}
          {state.step === 2 && renderStep2()}
          {state.step === 3 && renderStep3()}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-6 mt-auto" style={{ backgroundColor: personalization.primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <p className="text-sm font-semibold">Generador de Certificados</p>
              <p className="text-xs opacity-80"> Autores: Selvin Lopez y Marvin Vásquez</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <a
                href="mailto:marvinv708@gmail.com"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Mail size={18} />
                <span className="text-sm">marvinv708@gmail.com</span>
              </a>
              <a
                href="mailto:selvinlomiguel@gmail.com"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Mail size={18} />
                <span className="text-sm">selvinlomiguel@gmail.com</span>
              </a>


              <a
                href="https://wa.me/50233585075"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <MessageCircle size={18} />
                <span className="text-sm">WhatsApp: 3358-5075</span>
              </a>
                  <a
                href="https://wa.me/50232313250"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <MessageCircle size={18} />
                <span className="text-sm">WhatsApp: 3231-3250</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Personalization Panel */}
      {showPersonalizationPanel && renderPersonalizationPanel()}
    </div>
  );
};

export default App;