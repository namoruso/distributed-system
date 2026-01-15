import { Pago } from '../models/index.js';
import {
  simPago,
  genRef,
  validarMonto,
  valTar,
  valCvv,
  valVen,
  obtMarca
} from '../utils/helpers.js';
import { notifPago } from '../services/ordenSvc.js';

// Procesa un pago con tarjeta
export const procesar = async (req, res) => {
  

  const { idPedido, monto, numTarjeta, cvv, vencimiento, nombreTitular, email } = req.body;
  const idUsuario = req.usuario.id;

  

  if (!idPedido || !monto) {
    console.log(' Validation failed: Missing idPedido or monto');
    console.log('  idPedido value:', idPedido, 'type:', typeof idPedido);
    console.log('  monto value:', monto, 'type:', typeof monto);
    return res.status(400).json({ err: 'Pedido y monto requeridos' });
  }

  if (!validarMonto(monto)) {
    console.log('Validation failed: Invalid monto');
    console.log('  monto value:', monto, 'validarMonto result:', validarMonto(monto));
    return res.status(400).json({ err: 'Monto debe ser mayor a 0' });
  }

  if (!numTarjeta || !cvv || !vencimiento || !nombreTitular) {
    console.log('Validation failed: Missing card data', {
      hasNumTarjeta: !!numTarjeta,
      hasCvv: !!cvv,
      hasVencimiento: !!vencimiento,
      hasNombreTitular: !!nombreTitular
    });
    return res.status(400).json({ err: 'Faltan datos de la tarjeta' });
  }

  const numLim = numTarjeta.replace(/\s/g, '');
  const resVal = valTar(numLim);
  if (!resVal.valido) {
    console.log('Validation failed: Invalid card number');
    return res.status(400).json({ err: 'Número de tarjeta inválido' });
  }

  const marca = obtMarca(numLim);
  const resCvv = valCvv(cvv, marca);
  if (!resCvv.valido) {
    console.log('Validation failed: Invalid CVV');
    return res.status(400).json({ err: resCvv.msg });
  }

  const resVen = valVen(vencimiento);
  if (!resVen.valido) {
    console.log('Validation failed: Invalid expiry date');
    return res.status(400).json({ err: resVen.msg });
  }

  try {
    const pago = await Pago.create({
      idPedido,
      idUsuario,
      monto,
      metodo: 'tarjeta',
      marcaTarjeta: marca,
      ultimos4Digitos: numLim.slice(-4),
      nombreTitular: nombreTitular,
      email: email || null,
      estado: 'pendiente',
    });

    // Intenta procesar el pago 
    const exitoso = simPago(numLim);

    if (exitoso) {
      pago.estado = 'completado';
      pago.fechaPago = new Date();
      pago.referencia = genRef();
      await pago.save();

      try {
        await notifPago(idPedido, 'completado');
      } catch (errOrd) {
        console.error('No se notificó orden:', errOrd.message);
      }

      return res.status(201).json({
        exito: true,
        id: pago.id,
        monto: pago.monto,
        estado: 'Pago realizado',
        metodo: {
          ult4: pago.ultimos4Digitos,
          marca: pago.marcaTarjeta,
          titular: pago.nombreTitular,
        },
        referencia: pago.referencia,
        fechaPago: pago.fechaPago,
        idPedido,
      });
    } else {
      pago.estado = 'fallido';
      await pago.save();

      return res.status(402).json({
        exito: false,
        error: 'Tarjeta rechazada',
        motivo: 'Fondos insuficientes o datos incorrectos',
        id: pago.id,
      });
    }
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

// Trae historial de pagos del usuario
export const listar = async (req, res) => {
  const idUsuario = req.usuario.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ err: 'Paginación inválida' });
  }

  try {
    const { count, rows } = await Pago.findAndCountAll({
      where: { idUsuario },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totPags = Math.ceil(count / limit);

    const pagosF = rows.map(p => ({
      id: p.id,
      monto: p.monto,
      estado: p.estado,
      metodo: {
        ult4: p.ultimos4Digitos,
        marca: p.marcaTarjeta,
        titular: p.nombreTitular,
      },
      descripcion: `Pago para pedido #${p.idPedido}`,
      fecha: p.createdAt,
    }));

    return res.json({
      datos: pagosF,
      paginacion: {
        total: count,
        pagina: page,
        limite: limit,
        totalPaginas: totPags,
      },
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

// Trae detalles de un pago en particular
export const obtener = async (req, res) => {
  const { id } = req.params;
  const idUsuario = req.usuario.id;

  try {
    const pago = await Pago.findByPk(id);

    if (!pago) {
      return res.status(404).json({ err: 'Pago no encontrado' });
    }

    if (pago.idUsuario !== idUsuario) {
      return res.status(403).json({ err: 'No autorizado' });
    }

    return res.json({
      id: pago.id,
      monto: pago.monto,
      estado: pago.estado,
      metodo: {
        ult4: pago.ultimos4Digitos,
        marca: pago.marcaTarjeta,
      },
      descripcion: `Pago para pedido #${pago.idPedido}`,
      pagado: pago.estado === 'completado',
      referencia: pago.referencia,
      fecha: pago.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

// Trae todos los pagos de un pedido
export const porPedido = async (req, res) => {
  const { idPedido } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  if (page < 1 || limit < 1) {
    return res.status(400).json({ err: 'Paginación inválida' });
  }

  try {
    const { count, rows } = await Pago.findAndCountAll({
      where: { idPedido },
      limit,
      offset,
      order: [['fechaPago', 'DESC']],
    });

    const totPags = Math.ceil(count / limit);

    const pagosF = rows.map(p => ({
      id: p.id,
      monto: p.monto,
      estado: p.estado,
      metodo: {
        ult4: p.ultimos4Digitos,
        marca: p.marcaTarjeta,
      },
      fecha: p.createdAt,
    }));

    return res.json({
      datos: pagosF,
      paginacion: {
        total: count,
        pagina: page,
        limite: limit,
        totalPaginas: totPags,
      },
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

export const estadisticas = async (req, res) => {
  try {
    const total = await Pago.count();
    const completados = await Pago.count({ where: { estado: 'completado' } });
    const pendientes = await Pago.count({ where: { estado: 'pendiente' } });
    const fallidos = await Pago.count({ where: { estado: 'fallido' } });

    const montoTot = await Pago.sum('monto');
    const montoComp = await Pago.sum('monto', {
      where: { estado: 'completado' },
    });

    const tasaExito = total > 0 ? ((completados / total) * 100).toFixed(2) : 0;

    return res.json({
      resumen: {
        totalPagos: total,
        completados,
        pendientes,
        fallidos,
      },
      montos: {
        total: parseFloat(montoTot) || 0,
        completado: parseFloat(montoComp) || 0,
      },
      metricas: {
        tasaExito: `${tasaExito}%`,
        tasaRechazo: `${(100 - parseFloat(tasaExito)).toFixed(2)}%`,
        promTrans: total > 0 ? (montoTot / total).toFixed(2) : 0,
      }
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};

// Cambia estado de pago y avisa a órdenes
export const actualizar = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const idUsuario = req.usuario.id;

  const estVal = ['pendiente', 'completado', 'fallido'];

  if (!estado || !estVal.includes(estado)) {
    return res.status(400).json({ err: 'Estado inválido' });
  }

  try {
    const pago = await Pago.findByPk(id);

    if (!pago) {
      return res.status(404).json({ err: 'Pago no encontrado' });
    }

    if (pago.idUsuario !== idUsuario) {
      return res.status(403).json({ err: 'No autorizado' });
    }

    const estAnt = pago.estado;
    pago.estado = estado;

    if (estado === 'completado' && !pago.fechaPago) {
      pago.fechaPago = new Date();
      pago.referencia = genRef();
    }

    await pago.save();

    if (estAnt !== estado && estado === 'completado') {
      try {
        await notifPago(pago.idPedido, estado);
      } catch (errOrd) {
        console.warn('Orden no notificada:', errOrd.message);
      }
    }

    return res.json({
      id: pago.id,
      monto: pago.monto,
      estado,
      metodo: {
        ult4: pago.ultimos4Digitos,
        marca: pago.marcaTarjeta,
      },
      pagado: estado === 'completado',
      actualizado: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
};
