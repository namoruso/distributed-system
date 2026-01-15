export const validarMonto = (monto) => {
  return typeof monto === 'number' && monto > 0 && isFinite(monto);
};

export const valTar = (numTarjeta) => {
  if (!numTarjeta || numTarjeta.length < 13) {
    return { valido: false, msg: 'Número de tarjeta inválido' };
  }

  let suma = 0;
  let doble = false;

  for (let i = numTarjeta.length - 1; i >= 0; i--) {
    let digito = parseInt(numTarjeta[i]);

    if (doble) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }

    suma += digito;
    doble = !doble;
  }

  const valido = suma % 10 === 0;
  return { valido, msg: valido ? 'Tarjeta válida' : 'Tarjeta inválida' };
};

export const obtMarca = (numTarjeta) => {
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(numTarjeta)) return 'visa';
  if (/^5[1-5][0-9]{14}$/.test(numTarjeta)) return 'mastercard';
  if (/^3[47][0-9]{13}$/.test(numTarjeta)) return 'amex';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(numTarjeta)) return 'discover';
  return 'unknown';
};

// Verifica el código de seguridad
export const valCvv = (cvv, marca) => {
  const longExpected = marca === 'amex' ? 4 : 3;
  const esValido = /^\d+$/.test(cvv) && cvv.length === longExpected;
  return {
    valido: esValido,
    msg: esValido ? 'CVV válido' : `CVV debe tener ${longExpected} dígitos`
  };
};

// Chequea si la tarjeta está vencida 
export const valVen = (fecha) => {
  const [mes, ano] = fecha.split('/');

  if (!mes || !ano || mes.length !== 2 || ano.length !== 2) {
    return { valido: false, msg: 'Formato debe ser MM/YY' };
  }

  const mesNum = parseInt(mes);
  const anoNum = parseInt(ano);
  const anoActual = new Date().getFullYear() % 100;
  const mesActual = new Date().getMonth() + 1;

  if (mesNum < 1 || mesNum > 12) {
    return { valido: false, msg: 'Mes debe estar entre 01 y 12' };
  }

  const vencido = anoNum < anoActual || (anoNum === anoActual && mesNum < mesActual);

  return {
    valido: !vencido,
    msg: vencido ? 'Tarjeta vencida' : 'Fecha válida'
  };
};

export const genRef = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `pay_${ts}${rnd}`;
};

export const mapEst = (estPago) => {
  const mapeo = {
    pendiente: 'PENDIENTE',
    completado: 'PAGADO',
    fallido: 'FALLIDO',
  };
  return mapeo[estPago] || 'PENDIENTE';
};

// Simula un pago
export const simPago = (numTarjeta = '', porcentajeExito = 80) => {
  // Tarjetas que siempre tienen éxito
  const tarjExito = [
    '4111111111111111',  // Visa test card
  ];

  // Tarjetas que siempre fallan
  const tarjFallo = [
    '4000000000000002',
    '5555555555554444',
  ];

  const numLimpio = numTarjeta.replace(/\s/g, '');

  // Si está en la lista de éxito, siempre retorna true
  if (tarjExito.includes(numLimpio)) {
    return true;
  }

  // Si está en la lista de fallo, siempre retorna false
  if (tarjFallo.includes(numLimpio)) {
    return false;
  }

  // Para otras tarjetas, usa el porcentaje de éxito
  if (porcentajeExito < 0 || porcentajeExito > 100) {
    porcentajeExito = 80;
  }

  return Math.random() * 100 < porcentajeExito;
};
