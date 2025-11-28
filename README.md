# 📜 Generador de Certificados

<div align="center">
 
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
  
  **Sistema profesional para generar certificados personalizados en masa**
</div>

---

## 📋 Descripción

Generador de Certificados es una aplicación web moderna que permite generar múltiples certificados personalizados de forma rápida y eficiente. Carga tu plantilla PDF, importa los datos de los estudiantes desde Excel/CSV, y genera certificados personalizados con solo unos clics.

## ✨ Características

- 🎨 **Personalización Visual** - Esquema de colores personalizables con temas predefinidos
- 📄 **Carga de Plantillas PDF** - Sube tu propia plantilla de certificado
- 📊 **Importación desde Excel/CSV** - Importa datos de estudiantes de forma masiva
- 🖱️ **Editor Visual Drag & Drop** - Posiciona elementos arrastrando y soltando
- 📝 **Elementos Dinámicos** - Agrega texto personalizado e imágenes
- 🎯 **Mapeo Automático de Columnas** - Detecta automáticamente nombres y duraciones
- 💾 **Descarga en Lote** - Descarga todos los certificados en un archivo ZIP
- 📱 **Diseño Responsive** - Funciona en desktop y dispositivos móviles
- 💾 **Persistencia de Preferencias** - Guarda tu configuración de colores

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18.2** - Biblioteca de interfaz de usuario
- **TypeScript 5.3** - Tipado estático para JavaScript
- **Vite 5.1** - Build tool y dev server ultrarrápido
- **Tailwind CSS** - Framework de estilos utility-first

### Bibliotecas Principales
- **pdf-lib** - Manipulación de archivos PDF
- **xlsx** - Lectura de archivos Excel y CSV
- **jszip** - Creación de archivos ZIP
- **file-saver** - Descarga de archivos en el navegador
- **lucide-react** - Iconos modernos y ligeros

---

## 📦 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene incluido con Node.js) o **yarn**
- Un navegador web moderno (Chrome, Firefox, Edge, Safari)

Para verificar si tienes Node.js instalado, ejecuta:

```bash
node --version
npm --version
```

---

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alexmavl/Generador-Certificados.git
cd Generador-Certificados
```

### 2. Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias listadas en el `package.json`:

**Dependencias de Producción:**
- `react` & `react-dom` - Framework de UI
- `pdf-lib` - Manipulación de PDFs
- `xlsx` - Lectura de Excel/CSV
- `jszip` - Compresión de archivos
- `file-saver` - Descarga de archivos
- `lucide-react` - Iconos

**Dependencias de Desarrollo:**
- `@vitejs/plugin-react` - Plugin de Vite para React
- `typescript` - Compilador de TypeScript
- `vite` - Build tool
- Tipos de TypeScript para todas las dependencias

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

---

## 📖 Uso

### Paso 1: Subir Archivos

1. **Plantilla PDF**: Sube tu plantilla de certificado en formato PDF
2. **Datos de Estudiantes**: Sube un archivo Excel (.xlsx, .xls) o CSV con los datos
   - La primera fila debe contener los nombres de las columnas
   - Incluye columnas como: Nombre, Duración, etc.

### Paso 2: Configurar Diseño

1. **Agregar Elementos**:
   - Haz clic en "Añadir Texto" para agregar campos de texto
   - Haz clic en "Añadir Sello" para subir imágenes (firmas, sellos, logos)

2. **Posicionar Elementos**:
   - Arrastra los elementos a la posición deseada en la plantilla
   - Selecciona un elemento para ver sus propiedades

3. **Configurar Propiedades**:
   - **Texto**: Asigna a columna de Excel o usa texto estático
   - **Fuente**: Cambia familia, tamaño, estilo y color
   - **Imagen**: Ajusta el tamaño con el slider

### Paso 3: Generar Certificados

1. Haz clic en "Generar Certificados"
2. Espera mientras se procesan todos los certificados
3. Se descargará automáticamente un archivo ZIP con todos los certificados

### Personalización de Colores

1. Haz clic en el botón "Personalizar" en el navbar
2. Selecciona colores personalizados o elige un tema predefinido:
   - 🔵 Azul (predeterminado)
   - 🔴 Rojo
   - 🟣 Púrpura
   - 🟢 Verde
3. Los cambios se aplican instantáneamente y se guardan automáticamente

---

## � Demo en Vivo

La aplicación está desplegada y disponible en:

**🔗 [https://generador-certificados-lwdg.vercel.app/](https://generador-certificados-lwdg.vercel.app/)**

Puedes probar todas las funcionalidades sin necesidad de instalar nada localmente.

---

## �🏗️ Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la build de producción
npm run preview
```

---

## 📁 Estructura del Proyecto

```
Generador-Certificados/
├── components/           # Componentes React
│   ├── EditorCanvas.tsx # Canvas de edición de certificados
│   └── StepIndicator.tsx # Indicador de pasos
├── utils/               # Utilidades
│   └── pdfHelpers.ts   # Funciones de generación de PDF
├── image/              # Imágenes y assets
│   └── Logotipo MV transparente.png
├── App.tsx             # Componente principal
├── index.tsx           # Punto de entrada
├── types.ts            # Definiciones de tipos TypeScript
├── constants.ts        # Constantes de la aplicación
├── index.css           # Estilos globales
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración de TypeScript
├── vite.config.ts      # Configuración de Vite
└── README.md           # Documentación
```

---

## 🎨 Características Detalladas

### Mapeo Automático de Columnas

La aplicación detecta automáticamente columnas comunes:
- **Nombres**: detecta columnas con "nombre", "name", "student", "alumno"
- **Duración**: detecta columnas con "duration", "duración", "hours", "horas", "tiempo"

### Tipos de Elementos

1. **Texto Dinámico**: Se vincula a una columna de Excel
2. **Texto Estático**: Texto fijo que aparece en todos los certificados
3. **Imágenes**: Logos, firmas, sellos (PNG, JPG)

### Fuentes Disponibles

- Helvetica
- Times-Roman
- Courier
- Y más...

---

## 🔧 Solución de Problemas

### La aplicación no inicia

```bash
# Eliminar node_modules e instalar de nuevo
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Errores al generar certificados

- Verifica que el PDF no esté protegido con contraseña
- Asegúrate de que el archivo Excel tenga datos válidos
- Verifica que todos los elementos tengan configuración válida

### El archivo ZIP no se descarga

- Verifica los permisos del navegador para descargas
- Intenta con menos certificados para probar
- Revisa la consola del navegador (F12) para errores

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Contactos

**Marvin Vásquez**

- 📧 Email: [marvinv708@gmail.com](mailto:marvinv708@gmail.com)
- 💬 WhatsApp: [+502 3358-5075](https://wa.me/50233585075)
- 🌐 GitHub: [@Alexmavl](https://github.com/Alexmavl)

---
**Marvin Vásquez**

- 📧 Email: [selvinlomiguel@gmail.com](mailto:selvinlomiguel@gmail.com)
- 💬 WhatsApp: [+502 3231-3250](https://wa.me/50232313250)
- 🌐 GitHub: [@QuimiSell](https://github.com/QuimiSell)

---

## 📄 Licencia

© 2025 Todos los derechos reservados para Marvin Vásquez y Selvin López

---

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Framework de UI
- [pdf-lib](https://pdf-lib.js.org/) - Manipulación de PDFs
- [SheetJS](https://sheetjs.com/) - Lectura de Excel/CSV
- [Lucide](https://lucide.dev/) - Iconos hermosos
- [Vite](https://vitejs.dev/) - Build tool ultrarrápido

---

<div align="center">
  Hecho por Marvin Vásquez y Selvin López
</div>
