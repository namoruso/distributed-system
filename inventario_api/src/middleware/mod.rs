pub mod token;

use axum::{body::Body, http::{HeaderValue, Method, Request, StatusCode, header}, middleware::Next, response::{IntoResponse, Response}};
use axum_extra::headers::{Authorization, HeaderMapExt, authorization::Bearer};
use tower_http::cors::{CorsLayer};

use crate::middleware::token::get_token_data;

pub fn cors_config() -> CorsLayer {
    let cors = CorsLayer::new()
    .allow_origin([
        "http://localhost:5002".parse::<HeaderValue>().unwrap(),
        "http://localhost:5173".parse::<HeaderValue>().unwrap(),
        "http://localhost:8001".parse::<HeaderValue>().unwrap()
    ])
    .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION, header::ACCEPT])
    .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS]);

    return cors;
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
            eprintln!("{}: Error: rol incorrecto", StatusCode::UNAUTHORIZED);  
            return Ok((StatusCode::UNAUTHORIZED, "Error: You do not have authorization").into_response())
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