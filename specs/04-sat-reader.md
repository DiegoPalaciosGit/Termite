# Spec 04 — Lector SAT (IMAP + XML CFDI)

**Estado:** DIFERIDO — Sprint 4 (Semana 4-5)  
**Prerequisito:** MVP validado por Carlos (Sprints 1-3 completos y en uso).

---

## Por qué se difiere

1. Requiere acceso a la cuenta de Gmail de Carlos para configurar IMAP — operacional, no solo código.
2. No bloquea el valor core del MVP (Carlos puede actualizar precios manualmente en `materials.cost_unit`).
3. Los XML del SAT varían por proveedor — necesitamos ver facturas reales de Maximaderas y Barcocinas para mapear los campos correctamente.

---

## Descripción

Termite se conecta al correo de compras de Carlos via IMAP, detecta facturas electrónicas (CFDI), extrae el costo de los materiales del XML y actualiza automáticamente los precios en el inventario.

---

## Reglas de Negocio (preliminares)

**RN-01:** Solo leer correos del día actual para minimizar procesamiento.

**RN-02:** Filtros de búsqueda IMAP:
- Subject contiene: `factura` OR `CFDI` OR `XML`
- Adjuntos: `.xml` o `.pdf`
- Ignorar correos sin adjunto relevante.

**RN-03:** Del XML CFDI, extraer:
```xml
<cfdi:Concepto ClaveProdServ="..." Cantidad="X" Descripcion="..." ValorUnitario="X.XX" />
```

**RN-04:** Mapeo de descripción del XML → código de material en Termite:
- "MDF 15MM MAPLE" → `MDF-15MM-MAPLE`
- El mapeo es configurable (tabla `sat_material_mappings` — Fase 4).

**RN-05:** Si el precio en la factura difiere del actual en `materials.cost_unit`:
- Actualizar `cost_unit` con el nuevo precio.
- Registrar una entrada de material por la cantidad de la factura.
- Crear registro de cuenta por pagar.

**RN-06:** Las facturas que no se pueden parsear se guardan en cola para revisión manual de Carlos.

---

## Stack técnico

```bash
composer require webklex/laravel-imap
```

```php
// Parser básico de CFDI
$xml = simplexml_load_string($xmlContent);
$xml->registerXPathNamespace('cfdi', 'http://www.sat.gob.mx/cfd/4');
$conceptos = $xml->xpath('//cfdi:Concepto');
foreach ($conceptos as $concepto) {
    $descripcion = (string) $concepto['Descripcion'];
    $cantidad    = (float)  $concepto['Cantidad'];
    $precio      = (float)  $concepto['ValorUnitario'];
    // Buscar material en DB por descripción o mapeo
}
```

---

## Tareas para cuando se active este sprint

1. Revisar 3-5 facturas XML reales de Maximaderas / Barcocinas con Carlos.
2. Diseñar tabla `sat_material_mappings` (`descripcion_sat` → `material_id`).
3. Configurar credenciales IMAP en `.env` (App Password de Gmail).
4. Implementar `SatReaderJob` (queue job, no síncrono).
5. UI: "Buzón de Facturas" — lista de facturas procesadas y pendientes.

---

*Spec version: 0.1 (borrador) — 2026-06-14 — activar cuando MVP esté validado por Carlos*
