import { DataTypes } from 'sequelize';
import sequelize from '../config/bd.js';

const Pago = sequelize.define(
  'Pago',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    idPedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del pedido (orders-service)',
    },
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID del usuario que paga',
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto a pagar',
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
      defaultValue: 'pendiente',
      comment: 'Estado actual del pago',
    },
    metodo: {
      type: DataTypes.STRING,
      defaultValue: 'tarjeta',
      comment: 'Método de pago (tarjeta, transferencia, etc)',
    },
    marcaTarjeta: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Marca de tarjeta (visa, mastercard, amex, discover)',
    },
    ultimos4Digitos: {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: 'Últimos 4 dígitos',
    },
    nombreTitular: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nombre del titular',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Email de confirmación',
    },
    referencia: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Referencia de la transacción',
    },
    fechaPago: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de finalización del pago',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'pagos',
    timestamps: true,
  }
);

export default Pago;
