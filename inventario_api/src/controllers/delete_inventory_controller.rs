use axum::{
    Json,
    extract::Path,
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::query;

use crate::database::get_pool;

pub async fn delete_product(Path(id): Path<i32>) -> impl IntoResponse {
    let pool = match get_pool().await {
        Ok(connect) => connect,
        Err(error) => {
            eprintln!(
                "{}: Error en la BD: {}",
                StatusCode::INTERNAL_SERVER_ERROR,
                error
            );
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "Error al conectar con la BD"})),
            );
        }
    };

    let result = query!(
        r#"DELETE FROM inventory WHERE id = $1"#,
        id
    )
    .execute(&pool)
    .await;

    match result {
        Ok(_) => {
            println!("{}: Producto eliminado del inventario", StatusCode::OK);
            (
                StatusCode::OK,
                Json(json!({"message": "Producto eliminado exitosamente"}))
            )
        },
        Err(error) => {
            eprintln!(
                "{}: Error al eliminar: {}",
                StatusCode::INTERNAL_SERVER_ERROR,
                error
            );
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "Error al eliminar el producto"}))
            )
        }
    }
}
