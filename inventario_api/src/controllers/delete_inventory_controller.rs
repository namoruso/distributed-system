use axum::{
    Extension, Json, extract::Path, http::StatusCode, response::IntoResponse
};
use serde_json::json;
use sqlx::{PgPool, query};

pub async fn delete_product(Extension(pool): Extension<PgPool>, Path(id): Path<i32>) -> impl IntoResponse {

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
                Json(json!({"message": "Product successfully removed"}))
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
                Json(json!({"message": "Error deleting product"}))
            )
        }
    }
}
