use std::env;

use axum::Router;
use inventario_api::routes::api_router;
use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    let port = std::env::var("PORT").expect("Error al obtener el port");
    let db_url = env::var("DATABASE_URL").expect("Error al obtener el url");

    let pool = PgPoolOptions::new()
    .max_connections(5)  
    .connect(&db_url)
    .await.expect("Error al conectar a la base de datos");

    println!("Conexión exitosa a la base de datos");

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}",port)).await.unwrap();
    let app = Router::new().nest("/api/inventory", api_router(pool));
    println!("Corriendo en: http://localhost:{}",port);
    axum::serve(listener, app).await.unwrap();

}