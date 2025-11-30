use axum_extra::headers::{Authorization, authorization::Bearer};
use jsonwebtoken::{DecodingKey, Validation, decode, errors::ErrorKind};
use serde::{Deserialize, Serialize};
use std::{env, io::Error};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub correo: String,
    pub rol: String,
    pub exp: usize,
}

pub fn get_token_data(auth: Option<Authorization<Bearer>>) -> Result<Claims, Error> {
    let secret_token = env::var("JWT_SECRET_KEY").expect("JWT no encontrado");
    let decoding = DecodingKey::from_secret(secret_token.as_ref());

    let jwt = match auth {
        Some(header) => header.token().to_owned(),
        None => {
            return Err(Error::new(
                std::io::ErrorKind::PermissionDenied,
                "Token faltante o formato incorrecto",
            ));
        }
    };

    match decode::<Claims>(&jwt, &decoding, &Validation::default()) {
        Ok(token_data) => Ok(token_data.claims),
        Err(error) => {
            let error_message;

            match *error.kind() {
                ErrorKind::ExpiredSignature => error_message = "Token expirado",
                ErrorKind::InvalidSignature => error_message = "Firma del token invalida",
                _ => error_message = "Error en el token o campos faltantes",
            }
            return Err(Error::new(
                std::io::ErrorKind::PermissionDenied,
                error_message,
            ));
        }
    }
}
