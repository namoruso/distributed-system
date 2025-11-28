pub mod token;

use axum::{body::Body, http::{Method, Request, StatusCode}, middleware::Next, response::{IntoResponse, Response}};
use axum_extra::headers::{Authorization, HeaderMapExt, authorization::Bearer};
use tower_http::cors::{Any, CorsLayer};

use crate::middleware::token::get_token_data;

pub fn cors_config() -> CorsLayer {
    let cors = CorsLayer::new()
    .allow_origin(Any)
    .allow_headers(Any)
    .allow_methods([Method::GET, Method::POST, Method::PUT]);

    return cors;
}

pub async fn user_validate(mut req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
    let req_data = req.headers().typed_get::<Authorization<Bearer>>();

    match get_token_data(req_data) {
       Ok(info) => {
            if info.rol != "worker" && info.rol != "user" {
              return Ok((StatusCode::UNAUTHORIZED, "Rol erroneo").into_response())  
            }
            req.extensions_mut().insert(info.rol);
            let response = next.run(req).await;
            return Ok(response)
       },
       Err(error) =>  return Ok((StatusCode::UNAUTHORIZED, error.to_string()).into_response())
    };
}

pub async fn worker_validate(mut req: Request<Body>, next: Next) -> Result<Response, StatusCode>{
    let req_data = req.headers().typed_get::<Authorization<Bearer>>();

    match get_token_data(req_data) {
       Ok(info) => {
        if info.rol != "worker" {
            return Ok((StatusCode::UNAUTHORIZED, "Error: No posee autorización").into_response())
        }
        req.extensions_mut().insert(info.rol);
        let response = next.run(req).await;
        return Ok(response)
       },
       Err(error) =>  return Ok((StatusCode::UNAUTHORIZED, error.to_string()).into_response())
    };
}