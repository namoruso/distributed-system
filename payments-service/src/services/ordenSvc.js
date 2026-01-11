import axios from 'axios';

const URL_ORD = process.env.ORDERS_SERVICE_URL || 'http://localhost:8003/api';
const TIMEOUT = 5000;
const SERVICE_TOKEN = process.env.ORDERS_SERVICE_TOKEN || null;

const baseHeaders = { 'Content-Type': 'application/json' };
if (SERVICE_TOKEN) baseHeaders.Authorization = `Bearer ${SERVICE_TOKEN}`;

const config = {
  timeout: TIMEOUT,
  headers: baseHeaders,
};
export const notifPago = async (idPedido, estado) => {
  try {
    const estadoMap = {
      'pendiente': 'PENDIENTE',
      'completado': 'PAGADO',
      'fallido': 'FALLIDO'
    };

    const estOrd = estadoMap[estado] || estado.toUpperCase();

    const resp = await axios.put(
      `${URL_ORD}/orders/${idPedido}/status`,
      { status: estOrd },
      config
    );

    return resp.data;
  } catch (err) {
    console.error(`Error al notificar orden ${idPedido}:`, err.message);
    throw new Error(`No se pudo actualizar orden: ${err.message}`);
  }
};

export const obtenerOrden = async (idPedido) => {
  try {
    const resp = await axios.get(
      `${URL_ORD}/orders/${idPedido}`,
      config
    );
    return resp.data;
  } catch (err) {
    console.error(`Error al obtener orden ${idPedido}:`, err.message);
    return null;
  }
};

export const listarOrdenes = async (idUs) => {
  try {
    const resp = await axios.get(
      `${URL_ORD}/orders/user/${idUs}`,
      config
    );
    return resp.data || [];
  } catch (err) {
    console.error(`Error al listar órdenes del usuario ${idUs}:`, err.message);
    return [];
  }
};
