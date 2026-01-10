import express from 'express';
import { verificarToken } from '../middleware/auth.js';
import {
  procesar,
  listar,
  obtener,
  porPedido,
  actualizar,
  estadisticas,
} from '../controllers/pagoCtrl.js';

// Rutas de pagos
const router = express.Router();

router.post('/procesar', verificarToken, procesar);
router.get('/mis-pagos', verificarToken, listar);
router.get('/estadisticas', verificarToken, estadisticas);
router.get('/:id', verificarToken, obtener);
router.get('/pedido/:idPedido', porPedido);
router.put('/:id', verificarToken, actualizar);

export default router;
