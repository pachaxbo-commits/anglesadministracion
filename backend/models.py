"""
Modelos Pydantic para validación de datos

Estos modelos se usan para validar los datos que llegan
a la API antes de procesarlos.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SaleData(BaseModel):
    """Datos de una venta para el reporte"""
    id: str
    tipoVenta: str  # LUCIO, DOCTORES, ENVIO
    productoNombre: str
    cantidad: int
    precioVenta: float
    
    # Campos opcionales según tipo
    metodoPago: Optional[str] = None  # QR o EFECTIVO
    clienteNombre: Optional[str] = None
    doctorNombre: Optional[str] = None
    departamento: Optional[str] = None
    
    createdAt: datetime


class ExportRequest(BaseModel):
    """Solicitud de exportación a Excel"""
    ventas: List[SaleData]
    mes: Optional[int] = None  # 1-12
    año: Optional[int] = None
    

class ExportResponse(BaseModel):
    """Respuesta con el archivo Excel generado"""
    filename: str
    message: str
