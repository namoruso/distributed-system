use axum::{
    Router,
};
use inventario_api::{database::init_db, routes::api_router};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    init_db().await;

    let app = Router::new().nest("/api/inventory", api_router());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}