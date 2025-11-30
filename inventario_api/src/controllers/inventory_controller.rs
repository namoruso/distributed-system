use axum::{
    Json,
    extract::{Path, rejection::JsonRejection},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{Error, query, query_as};

use crate::{
    database::get_pool,
    models::data::{InventoryPayload, Products},
};

pub async fn add_new_product(
    payload: Result<Json<InventoryPayload>, JsonRejection>,
) -> impl IntoResponse {
    let data = match payload {
        Ok(value) => value,
        Err(error) => {
            eprintln!("{}: Error en el json: {}", StatusCode::BAD_REQUEST, error);
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({"message": "Datos faltantes".to_string()})),
            );
        }
    };

    let values = match data.validate() {
        Ok(value) => value,
        Err(error) => {
            eprintln!("{}: Error en los datos: {}", StatusCode::BAD_REQUEST, error);
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({"message": error.to_string()})),
            );
        }
    };

    let status_product = data.status.unwrap_or(true);

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
                Json(json!({"message": "Error al guardar los datos"})),
            );
        }
    };

    let result = query!(
        r#"
        INSERT INTO inventory (name, sku, stock, maximun, minimun, status) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, name, sku
        "#,
        data.name,
        data.sku,
        values[0],
        values[1] as i64,
        values[2],
        status_product
    )
    .fetch_one(&pool)
    .await;

    match result {
        Ok(record) => {
            let res = json!({
                "id": record.id,
                "name": record.name,
                "sku": record.sku,
                "message": "Se ha creado el producto exitosamente".to_string()
            });
            println!("{}: Producto creado", StatusCode::CREATED);
            return (StatusCode::CREATED, Json(res));
        }
        Err(error) => {
            eprintln!(
                "{}: Error en la BD: {}",
                StatusCode::INTERNAL_SERVER_ERROR,
                error
            );
            if let Error::Database(db_err) = &error {
                if db_err.code().as_deref() == Some("23505") {
                    return (
                        StatusCode::CONFLICT,
                        Json(json!({"message": "Sku ya existente"})),
                    );
                }
            }
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "Error al guardar los datos"})),
            );
        }
    }
}

pub async fn get_product_by_id(id: Path<i32>) -> impl IntoResponse {
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
                Json(json!({"message": "Error al guardar los datos"})),
            );
        }
    };

    let result = query_as!(
        Products,
        r#"
        SELECT id, name, sku, stock, minimun, maximun, created_at, updated_at, status FROM inventory WHERE id = $1
        "#,
        *id
    )
    .fetch_one(&pool)
    .await;

    match result {
        Ok(record) => {
            if !record.status {
                return (
                    StatusCode::OK,
                    Json(json!({"message": "Producto inexistente"})),
                );
            }

            println!("{}: Producto obtenido", StatusCode::OK);
            return (StatusCode::OK, Json(json!(record)));
        }
        Err(error) => {
            eprintln!("{}: Error en la BD: {}", StatusCode::NOT_FOUND, error);
            return (
                StatusCode::NOT_FOUND,
                Json(json!({"message": "Error al obtener los datos o producto inexistente"})),
            );
        }
    }
}

pub async fn get_all_products() -> impl IntoResponse {
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
                Json(json!({"message": "Error al obtener los datos"})),
            );
        }
    };

    let result = query_as!(
        Products,
        r#"
        SELECT id, name, sku, stock, minimun, maximun, created_at, updated_at, status FROM inventory WHERE status != false
        "#,
    )
    .fetch_all(&pool)
    .await;

    match result {
        Ok(record) => {
            println!("{}: Productos obtenidos", StatusCode::OK);
            return (StatusCode::OK, Json(json!(record)));
        }
        Err(error) => {
            eprintln!(
                "{}: Error en la BD: {}",
                StatusCode::INTERNAL_SERVER_ERROR,
                error
            );
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "Error al obtener los datos"})),
            );
        }
    }
}

pub async fn get_product_by_sku(Path(sku): Path<String>) -> impl IntoResponse {
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

    let result = query_as!(
        Products,
        r#"
        SELECT id, name, sku, stock, minimun, maximun, created_at, updated_at, status FROM inventory WHERE sku = $1
        "#,
        sku
    )
    .fetch_one(&pool)
    .await;

    match result {
        Ok(record) => {
            if !record.status {
                return (
                    StatusCode::OK,
                    Json(json!({"message": "Producto inexistente"})),
                );
            }

            println!("{}: Producto obtenido por SKU: {}", StatusCode::OK, sku);
            return (StatusCode::OK, Json(json!(record)));
        }
        Err(error) => {
            eprintln!("{}: Error en la BD: {}", StatusCode::NOT_FOUND, error);
            return (
                StatusCode::NOT_FOUND,
                Json(json!({
                    "message": "Producto no encontrado en inventario",
                    "sku": sku
                })),
            );
        }
    }
}
