import { Revestimiento } from '@revestimientos/entities/revestimiento.entity';

export const revestimientoPropuestaTemplate = (data: Revestimiento) => {
  const formatCurrency = (value: number) =>
    value?.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    });

  const formatFecha = (date?: Date | string | null) => {
    if (!date) return '-';

    const parsedDate = date instanceof Date ? date : new Date(date);

    return parsedDate.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const extrasRows =
    data.extras?.length > 0
      ? data.extras
          .map(
            (extra) => `
        <tr>
          <td>${extra.nombre}</td>
          <td>${extra.detalle ?? '-'}</td>
          <td style="text-align:right;">${formatCurrency(extra.valor)}</td>
        </tr>
      `,
          )
          .join('')
      : `
        <tr>
          <td colspan="3" style="text-align:center;">Sin extras</td>
        </tr>
      `;

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Propuesta Comercial Revestimiento</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          color: #333;
          margin: 40px;
        }

        h1 {
          color: #1f4fd8;
          margin-bottom: 5px;
        }

        h2 {
          color: #1f4fd8;
          border-bottom: 2px solid #1f4fd8;
          padding-bottom: 4px;
          margin-top: 30px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }

        .header-box {
          width: 48%;
        }

        .header-box p {
          margin: 4px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 8px;
        }

        th {
          background-color: #f2f2f2;
          text-align: left;
        }

        .totals {
          margin-top: 20px;
          width: 100%;
        }

        .totals td {
          padding: 10px;
        }

        .totals .label {
          text-align: right;
          font-weight: bold;
        }

        .totals .value {
          text-align: right;
          font-weight: bold;
        }

        .grand-total {
          background-color: #1f4fd8;
          color: #fff;
          font-size: 14px;
        }

        .footer {
          margin-top: 40px;
          font-size: 11px;
        }
      </style>
    </head>

    <body>

      <h1>Propuesta Comercial de Revestimiento</h1>
      <p><strong>Fecha:</strong> ${formatFecha(data.fechaPropuesta)}</p>

      <div class="header">
        <div class="header-box">
          <p><strong>Cliente:</strong> ${data.client.nombre}</p>
          <p><strong>Dirección:</strong> ${data.client.direccion}</p>
          <p><strong>Comuna:</strong> ${data.client.comuna}</p>
        </div>

        <div class="header-box">
          <p><strong>Teléfono:</strong> ${data.client.telefono}</p>
          <p><strong>Email:</strong> ${data.client.email || '-'}</p>
          <p><strong>Tipo de piscina:</strong> ${data.client.tipo_piscina}</p>
        </div>
      </div>

      <h2>Datos Técnicos de la Piscina</h2>
      <table>
        <tr>
          <th>Largo</th>
          <td>${data.largoPiscina} m</td>
          <th>Ancho</th>
          <td>${data.anchoPiscina} m</td>
        </tr>
        <tr>
          <th>Profundidad mínima</th>
          <td>${data.profundidadMin} m</td>
          <th>Profundidad máxima</th>
          <td>${data.profundidadMax} m</td>
        </tr>
        <tr>
          <th>Profundidad promedio</th>
          <td>${data.profundidadAvg} m</td>
          <th>Área</th>
          <td>${data.areaPiscina} m²</td>
        </tr>
        <tr>
          <th>Volumen</th>
          <td>${data.volumenPiscina} m³</td>
          <th>Tipo de revestimiento</th>
          <td>${data.tipoRevestimiento}</td>
        </tr>
      </table>

      <h2>Detalle Económico</h2>
      <table>
        <tr>
          <th>Valor por m²</th>
          <td>${formatCurrency(data.valorM2)}</td>
        </tr>
        <tr>
          <th>Mano de obra</th>
          <td>${formatCurrency(data.costoManoObra)}</td>
        </tr>
        <tr>
          <th>Materiales</th>
          <td>${formatCurrency(data.costoMateriales)}</td>
        </tr>
        <tr>
          <th>Costo base</th>
          <td>${formatCurrency(data.costoTotal)}</td>
        </tr>
        <tr>
          <th>Porcentaje de ganancia</th>
          <td>${data.porcentajeGanancia}%</td>
        </tr>
      </table>

      <table class="totals">
        <tr class="grand-total">
          <td class="label">TOTAL PROPUESTA</td>
          <td class="value">${formatCurrency(data.valorTotal)}</td>
        </tr>
      </table>

      <h2>Extras</h2>
      <table>
        <tr>
          <th>Nombre</th>
          <th>Detalle</th>
          <th>Valor</th>
        </tr>
        ${extrasRows}
      </table>

      <h2>Condiciones</h2>
      <p><strong>Fecha de inicio:</strong> ${formatFecha(data.fechaInicio)}</p>
      <p><strong>Fecha de término:</strong> ${formatFecha(data.fechaTermino)}</p>
      <p><strong>Garantía:</strong> ${data.garantia}</p>
      <p><strong>Observaciones:</strong> ${data.detalles}</p>

      <div class="footer">
        <p>Esta propuesta tiene carácter informativo y está sujeta a confirmación.</p>
      </div>

    </body>
  </html>
  `;
};
