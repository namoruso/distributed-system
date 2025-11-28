pub mod token;

use axum::{body::Body, http::{Method, Request, StatusCode, header::CONTENT_TYPE}, middleware::Next, response::{IntoResponse, Response}};
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

pub async fn headers_content_validation(req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
    let headers = req.headers();

    let validate_content = headers.get(CONTENT_TYPE)
    .map(|val| val.as_bytes().to_ascii_lowercase()) 
    .map(|val| val == b"application/json")
    .unwrap_or(false);

    if !validate_content {
        eprintln!("{}: Headers errorneos",StatusCode::UNAUTHORIZED);
        return Ok((StatusCode::UNAUTHORIZED, "headers erroneos o faltantes").into_response()) 
    }

    let response = next.run(req).await;
    return Ok(response)
}

pub async fn user_validate(req: Request<Body>, next: Next) -> Result<Response, StatusCode> {
    return validate_request(req, next, &["admin".to_string(), "user".to_string()]).await;
}

pub async fn worker_validate(req: Request<Body>, next: Next) -> Result<Response, StatusCode>{
    return validate_request(req, next, &["admin".to_string()]).await;
}

async fn validate_request(req: Request<Body>, next: Next, rols: &[String])  -> Result<Response, StatusCode> {
    let headers = req.headers();
    let auth = headers.typed_get::<Authorization<Bearer>>();

    match get_token_data(auth) {
       Ok(info) => {
        if !rols.contains(&info.rol) {
            eprintln!("{}: Error rol erroneo", StatusCode::UNAUTHORIZED);  
            return Ok((StatusCode::UNAUTHORIZED, "Error: No posee autorización").into_response())
        }
        let response = next.run(req).await;
        return Ok(response)
       },
       Err(error) =>  {
            eprintln!("{}: {}", StatusCode::UNAUTHORIZED, error.to_string());  
            return Ok((StatusCode::UNAUTHORIZED, error.to_string()).into_response())
       }
    };
}