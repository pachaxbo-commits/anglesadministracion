# 🏥 Sistema de Gestión de Farmacia

Sistema interno de gestión para farmacia con React, Firebase y FastAPI.

## 📁 Estructura del Proyecto

```
farmacia-app/
├── frontend/                    # Aplicación React + Vite
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── ui/              # Componentes base (Button, Input, etc.)
│   │   │   ├── layout/          # Sidebar, Header
│   │   │   ├── auth/            # PrivateRoute
│   │   │   ├── products/        # Formularios de productos
│   │   │   ├── doctors/         # Formularios de doctores
│   │   │   └── sales/           # Formularios de ventas
│   │   ├── pages/               # Páginas de la aplicación
│   │   ├── lib/                 # Firebase config, utilidades
│   │   ├── hooks/               # Custom hooks
│   │   └── context/             # AuthContext
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                     # API FastAPI (solo Excel export)
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   │   └── profits.py           # Exportar a Excel
│   └── requirements.txt
│
└── README.md
```

## 🚀 Instalación

### Requisitos Previos
- Node.js v18 o superior
- Python 3.9 o superior
- Una cuenta de Firebase

---

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. **Habilitar Authentication:**
   - Ve a Authentication > Sign-in method
   - Activa "Correo electrónico/contraseña"
4. **Habilitar Firestore:**
   - Ve a Firestore Database
   - Crea una base de datos (modo producción o prueba)
5. **Habilitar Storage:**
   - Ve a Storage
   - Configura las reglas para permitir subida de imágenes
6. **Obtener configuración:**
   - Ve a Configuración del proyecto > General
   - En "Tus apps", crea una app web
   - Copia el objeto `firebaseConfig`

### 2. Configurar el Frontend

```bash
# Entrar a la carpeta del frontend
cd farmacia-app

# Instalar dependencias
npm install

# Configurar Firebase
# Edita src/lib/firebase.ts y reemplaza los valores con tu configuración
```

**Edita `src/lib/firebase.ts`:**
```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "123456789",
  appId: "TU_APP_ID"
}
```

### 3. Configurar el Backend (opcional - solo para Excel)

```bash
# Entrar a la carpeta del backend
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

---

## ▶️ Ejecutar la Aplicación

### Frontend (React)
```bash
cd farmacia-app
npm run dev
```
Abre http://localhost:5173 en tu navegador.

### Backend (FastAPI) - Solo si necesitas exportar Excel
```bash
cd backend
python -m uvicorn main:app --reload
```
La API estará en http://localhost:8000

---

## 🔐 Crear Usuario de Prueba

Como el sistema usa Firebase Auth, necesitas crear un usuario:

1. En Firebase Console, ve a Authentication
2. Click en "Agregar usuario"
3. Ingresa un email y contraseña

O usa la consola de Firebase para ejecutar:
```javascript
firebase.auth().createUserWithEmailAndPassword("admin@farmacia.com", "tu_contraseña")
```

---

## 📋 Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Productos** | CRUD completo con foto, precio, costo, stock |
| **Doctores** | CRUD con nombre y ciudad |
| **Inventario** | Ver productos, editar stock, alertas de stock bajo |
| **Ventas** | Lucio (QR/Efectivo), Doctores, Envío a departamentos |
| **Ganancias** | Reportes mensuales, tablas por tipo, exportar Excel |

### Reglas del Sistema

- ✅ **Venta de inventario**: Reduce el stock automáticamente
- ✅ **Venta rápida**: NO afecta el inventario
- ✅ **Ganancias**: Solo suma precios de venta (no resta costos)
- ✅ **Eliminar venta**: Restaura el stock y se guarda en ventas eliminadas

---

## 🛠️ Tecnologías

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **UI:** Radix UI, Framer Motion, Lucide Icons
- **Backend:** Python FastAPI, OpenPyXL
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage (fotos de productos)

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que Firebase esté configurado correctamente
2. Revisa la consola del navegador para errores
3. Asegúrate de que las reglas de Firestore permitan lectura/escritura
