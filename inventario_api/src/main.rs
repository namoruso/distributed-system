use axum::{
    Router,
};
use inventario_api::{database::init_db, routes::api_router};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let port = std::env::var("PORT").expect("Error al obtener el port");

    let app = Router::new().nest("/api/inventory", api_router());

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}",port)).await.unwrap();
    println!("Corriendo en: http://localhost:{}",port);
    init_db().await;
    axum::serve(listener, app).await.unwrap();
}