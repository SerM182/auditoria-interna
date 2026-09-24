const sharepointData = [{"@odata.etag":"\"1\"","ItemInternalId":"1","ID":1,"Title":"Registro Auditoría","field_1":[{"@odata.type":"#Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference","Id":-1,"Value":"PROY-001 Ejemplo"}],"field_1@odata.type":"#Collection(Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference)","field_1#Id":[-1],"field_1#Id@odata.type":"#Collection(Int64)","field_2":"1900-01-24","field_3":1.0,"field_4":"Obras","field_5":"Falta de responsable ambiental.","field_6":"Se contratará a un responsable.","field_7":"2026-10-01","field_8":"Búsqueda iniciada.","field_9":"Ninguna.","field_10":"1900-01-18","field_11":"2026-01-02","field_12":"Eficaz.","field_13":"Brullo","field_14":[{"@odata.type":"#Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference","Id":0,"Value":"Pendiente"}],"field_14@odata.type":"#Collection(Microsoft.Azure.Connectors.SharePoint.SPListExpandedReference)","field_14#Id":[0],"field_14#Id@odata.type":"#Collection(Int64)","Modified":"2026-09-24T17:18:49Z","Created":"2026-09-24T17:18:49Z"}];

const registros = sharepointData.map((item) => {
  const extractValue = (val) => {
    if (Array.isArray(val) && val.length > 0) return val[0].Value;
    if (typeof val === 'object' && val !== null) return val.Value;
    return val;
  };

  return {
    id: item.ID || item.Id || item.id || Math.random(),
    codigoProyecto: extractValue(item.field_1 || item.codigoProyecto),
    fecha: item.field_2 || item.fecha,
    nHallazgos: item.field_3 || item.nHallazgos,
    gerenciaResponsable: item.field_4 || item.gerenciaResponsable,
    descripcionHallazgo: item.field_5 || item.descripcionHallazgo,
    descripcionAccionCorrectiva: item.field_6 || item.descripcionAccionCorrectiva,
    fechaImplementacionCorreccion: item.field_7 || item.fechaImplementacionCorreccion,
    seguimientosAcciones: item.field_8 || item.seguimientosAcciones,
    observaciones: item.field_9 || item.observaciones,
    fechaVerificacionImplementacion: item.field_10 || item.fechaVerificacionImplementacion,
    fechaEvaluacionEficacia: item.field_11 || item.fechaEvaluacionEficacia,
    evaluacionEficacia: item.field_12 || item.evaluacionEficacia,
    responsable: item.field_13 || item.responsable,
    estadoObservacion: extractValue(item.field_14 || item.estadoObservacion),
    createdAt: item.Created || item.fecha || new Date().toISOString(),
  };
});

console.log(JSON.stringify(registros, null, 2));
