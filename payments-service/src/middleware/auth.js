import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log("JWT_SECRET usado:", process.env.JWT_SECRET);

  if (!token) {
    return res.status(401).json({ msg: 'Token requerido' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);

    const idRaw = decodificado.sub ?? decodificado.id ?? null;
    const id = typeof idRaw === 'string' && !isNaN(idRaw) ? parseInt(idRaw, 10) : idRaw;

    req.usuario = {
      id,
      correo: decodificado.correo ?? decodificado.email ?? null,
      rol: decodificado.rol ?? decodificado.role ?? null,
      raw: decodificado,
    };

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido o expirado', error: err.message });
  }
};
