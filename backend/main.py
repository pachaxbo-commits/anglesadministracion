"""
Backend FastAPI para Sistema de Gestión de Farmacia

Este backend es SOLO para:
- Exportar reportes de ganancias a Excel (.xlsx)

El CRUD de productos, doctores, ventas se hace directamente
desde el frontend con Firebase Firestore.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.profits import router as profits_router

# Crear la aplicación FastAPI
app = FastAPI(
    title="Farmacia API",
    description="API para exportar reportes de ganancias a Excel",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # URLs del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(profits_router, prefix="/api/profits", tags=["Ganancias"])


@app.get("/")
async def root():
    """Ruta de prueba para verificar que el servidor está corriendo"""
    return {"message": "API Farmacia funcionando correctamente", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Verificación de salud del servidor"""
    return {"status": "healthy"}
