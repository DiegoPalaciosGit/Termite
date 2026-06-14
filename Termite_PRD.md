# Product Requirements Document (PRD): Termite v1.5 (MVP)

Este documento detalla las especificaciones de negocio y requerimientos funcionales para **Termite**, el SaaS vertical de control operativo y financiero diseñado para carpinterías, adaptado específicamente con base en los procesos y datos reales de **Carpintería Escobar** (Zapopan, Jalisco).

---

## 1. Contexto & Problema (El "Por Qué")
**Carlos** (dueño de Carpintería Escobar) gestiona un equipo de 14 personas (carpinteros, laqueadores, auxiliares, operador de CNC, chofer y administrativo). 
El taller sufre de ineficiencias críticas:
-   Desperdicio y daño de materia prima (tableros de MDF de 15mm/6mm, maderas) estimado en un **10% de merma** por mal almacenamiento.
-   Tiempos muertos buscando herramientas e insumos.
-   Pago de horas extras (hasta 25% extra semanal) por retrabajo de piezas dañadas.
-   Falta de control en la rentabilidad real de los proyectos (muebles como el *Mueble Pink Up*, *Exhibidor de lentes* y *Estructura SkinCare*).

---

## 2. Visión del Producto: Evolución de Versiones

### Fase 1: MVP (Solo para Carlos)
El objetivo del MVP es que **únicamente Carlos** tenga el control de su taller desde una aplicación móvil/web. Carlos registrará las cotizaciones, dará seguimiento a las órdenes y controlará el inventario escaneando entradas/salidas.

### Fase 2: Ecosistema Completo (Trabajadores y Clientes)
-   **Portal del Trabajador:** Interfaz ultra-simple para los carpinteros y laqueadores en el taller. 
    -   Cada estante o contenedor de material (ej. caja de bisagras o rack de MDF) tendrá un código QR físico.
    -   El trabajador lo escanea con la cámara de su celular y presiona un botón gigante de **"Falta Material"**.
    -   Carlos recibe una alerta inmediata en su panel para solicitar compras.
-   **Portal del Cliente Final:** Cotizador y catálogo web.
    -   El cliente cotiza y compra modelos y medidas estándar directo en la web.
    -   Si requiere una medida personalizada, llena un formulario de dimensiones básicas (**Alto x Ancho x Profundidad**).
    -   El sistema envía este formulario a Carlos como una **"Hoja Viajera Pendiente"** para que él calcule el costo real y envíe la cotización manual.

---

## 3. Requerimientos de Arquitectura de Base de Datos (Supabase)

Para evitar reestructuraciones y deuda técnica al migrar a la Fase 2, la base de datos se modelará con soporte multi-rol desde el Día 1:
-   **Tabla `profiles`:** Vinculada a Supabase `auth.users`, contendrá un campo `role` con los siguientes enums:
    -   `admin` (Carlos, con acceso total a finanzas, inventarios y hojas viajeras).
    -   `worker` (Trabajadores del taller, con acceso futuro a escanear QR de faltantes e interactuar con su hoja viajera asignada).
    -   `client` (Clientes finales, con acceso futuro a ver el catálogo y cotizar).
-   **Row Level Security (RLS):** Las tablas críticas (como `facturas`, `cuentas_por_pagar` y `costos_fijos`) tendrán políticas de seguridad estrictas que restrinjan el acceso de lectura y escritura únicamente a usuarios con el rol `admin`.

---

## 4. Requerimientos Funcionales del MVP (Fase 1)

### F1: Módulo de Finanzas y Configuración de Costos
-   **Preconfiguración de Mano de Obra:** El sistema vendrá precargado con los sueldos reales por hora de Carpintería Escobar:
    -   *Carpintero:* $88 MXN/hr
    -   *Laqueador:* $77 MXN/hr
    -   *Operador CNC:* $66 MXN/hr
    -   *Auxiliar Carpintero:* $48 MXN/hr
    -   *Auxiliar Laqueador / Chofer:* $45 MXN/hr
    -   *Administrativo:* $75 MXN/hr
-   **Configuración de Indirectos:** Carlos podrá ingresar el costo mensual de Renta, Luz y Amortización de maquinaria (como la máquina CNC y compresor) para prorratear estos costos fijos por día de proyecto.

### F2: Catálogo Privado con Alerta de Margen (Semáforo)
-   Carlos define el precio de venta público manual de sus 3 productos estrella:
    1.  *Mueble Pink Up* (Precio base sugerido: $9,367 MXN - basado en lote de 50)
    2.  *Exhibidor de Lentes* (Precio base sugerido: $6,000 MXN)
    3.  *Estructura SkinCare con Entrepaños* (Precio base sugerido: $1,300 MXN)
-   **Semáforo de Margen:** El sistema calcula el costo real sumando la mano de obra estimada, indirectos y el costo actual de los materiales (ej. MDF 15mm Maple a $792, MDF 6mm a $209). Si el margen de ganancia baja del 35%, el sistema marca el producto en **Amarillo/Rojo** en el catálogo privado de Carlos.

### F3: Inbox Facturas & Lector SAT (XML/PDF)
-   **Lectura y Filtrado por IMAP:** Carlos vincula su Gmail personal/de compras. El sistema se conecta vía IMAP/Gmail API y aplica filtros para buscar únicamente correos del día que contengan palabras clave (como *factura*, *CFDI*, *XML*) y tengan archivos XML o PDF adjuntos, ignorando el resto de correos personales para preservar su privacidad.
-   **Extracción Automática:** Extrae automáticamente el costo unitario de los tableros y herrajes (leyendo las etiquetas `<cfdi:Concepto>` del XML de proveedores como *Maximaderas* o *Barcocinas*) y actualiza los precios en la base de datos de inventario sin captura manual.
-   **Registro de Deuda:** Registra el monto de la factura como **Cuenta por Pagar Pendiente**.

### F4: Gestión de Inventario mediante Escaneo & Fórmulas UDG
-   **Codificación ABC:** Inventario agrupado en categorías:
    -   *Categoría A:* MDF 15mm, MDF Enchapado Blanco 15mm, MDF 6mm.
    -   *Categoría B:* Bisagras bidimensionales / cuello cero, Patas grises, Tornillos.
    -   *Categoría C:* Lacas, Tintas (rojo, negro, amarillo), solventes.
-   **Escaneo móvil:** Carlos utiliza la cámara de su celular para escanear el QR del material en la bodega al recibir o entregar material al taller, registrando la Entrada/Salida directamente en la base de datos (reemplazando el flujo manual de Excel). Aplica el método **PEPS (Primeras Entradas, Primeras Salidas)**.
-   **Cálculo Automático de Reabastecimiento (Fórmulas UDG):** El sistema calcula dinámicamente el **Punto de Pedido (PP)** para cada material usando las variables logísticas del taller:
    -   *Fórmula:* $PP = SS + (Consumo Medio \times Lead Time)$
    -   *Lead Time (Tiempo de Entrega):* Calculado restando la fecha de recepción de factura SAT vs. fecha de pedido real.
    -   *Stock de Seguridad (SS):* $(Lead Time Máximo - Lead Time Habitual) \times Consumo Medio$.
    -   *Acción:* Si el stock actual es igual o menor al $PP$, el sistema envía una alerta a Carlos indicando: *"Es hora de comprar [Material]. Pedir [Cantidad Económica de Pedido] unidades."*

### F5: Hojas Viajeras Digitales (Seguimiento de Producción)
-   *Nota: En lugar de un tablero Kanban (que puede ser confuso), Termite utilizará el concepto tradicional de **Hoja Viajera** del taller (Anexo del Seminario).*
-   Para cada pedido, Carlos crea una **Hoja Viajera Digital** que contiene:
    -   Nombre del producto, Cliente, Cantidad y Código de barras/QR único.
    -   Estatus del mueble: `Producto Terminado` | `Producto en Proceso` | `Producto en Retrabajo`.
    -   **Bitácora de Tiempos:** Registra qué trabajador (ej. Miguel Márquez) completó cada fase y cuánto tiempo tardó:
        1.  *Corte (CNC / Sierra)*
        2.  *Lijado / Porosidad*
        3.  *Laca / Pintura (Cuarto de laca)*
        4.  *Ensamble / Herrajes*
        5.  *Emplayado y Almacén*

---

## 5. Propuesta de Flujo de Pantallas (Móvil-First para Carlos)

```mermaid
graph TD
    Login[1. Login express] --> Dash[2. Dashboard de Carlos]
    Dash --> Settings[3. Costos de Nómina e Indirectos]
    Dash --> Inv[4. Inventario Scan QR]
    Dash --> Traveler[5. Control de Hojas Viajeras]
    Dash --> Invoices[6. Buzón de Facturas & Conciliación IA]
    
    Inv --> ABCView[4.1 Vista ABC de Stock: MDF, Herrajes, Lacas]
    Traveler --> CreateTraveler[5.1 Generar Hoja Viajera para Cliente]
    Traveler --> StepTracker[5.2 Registrar Tiempos: Corte -> Lijado -> Laca -> Ensamble]
```

---

## 6. Próximos Pasos de Desarrollo
1.  **Aprobación del PRD adaptado:** Validar si esta estructura adaptada a Carpintería Escobar es el lenguaje ideal para presentárselo a Gael.
2.  **Modelado de Base de Datos en Supabase:** Diseñar las tablas de `materiales` (con códigos del SAT), `hojas_viajeras` e `inventario` basados en este PRD.
