use crate::{
    database::get_pool,
    models::data::{InventoryPayload, Products, StockUpdate},
};
use axum::{
    Json,
    extract::{Path, rejection::JsonRejection},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{query, query_as};

pub async fn update_product_by_id(
    Path(id): Path<i32>,
    payload: Result<Json<InventoryPayload>, JsonRejection>,
) -> impl IntoResponse {
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

    let data = match payload {
        Ok(value) => value,
        Err(_) => {
            eprintln!("{}: Error en el json", StatusCode::BAD_REQUEST);
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({"message": "Datos faltantes o tipos erroneos".to_string()})),
            );
        }
    };

    let values = match data.validate() {
        Ok(value) => value,
        Err(e) => {
            eprintln!("{}: Error en los datos", StatusCode::BAD_REQUEST);
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({"message": e.to_string()})),
            );
        }
    };

    let status_product = data.status.unwrap_or(true);

    let result = query!(
        r#"
        UPDATE inventory SET name = $1,
        stock = $2,
        maximun = $3,
        minimun = $4,
        status = $5,
        updated_at = NOW() WHERE id = $6
        RETURNING id, name, stock, maximun, minimun, status, updated_at
        "#,
        data.name,
        values[0],
        values[1] as i64,
        values[2],
        status_product,
        id
    )
    .fetch_one(&pool)
    .await;

    match result {
        Ok(record) => {
            let res = json!({
                "id": record.id,
                "name": record.name,
                "stock": record.stock,
                "maximun": record.maximun,
                "minimun": record.minimun,
                "status": record.status,
                "updated_at": record.updated_at,
                "message": "Se ha actualizado el producto exitosamente".to_string()
            });

            println!("{}: Producto actualizado: {}", StatusCode::OK, record.id);
            return (StatusCode::OK, Json(res));
        }
        Err(error) => {
            eprintln!("{}: Error en la BD: {}", StatusCode::NOT_FOUND, error);
            return (
                StatusCode::NOT_FOUND,
                Json(json!({"message": "Error al actualizar los datos o producto inexistente"})),
            );
        }
    }
}

pub async fn change_by_id(
    Path((id, mode)): Path<(i32, String)>,
    payload: Result<Json<StockUpdate>, JsonRejection>,
) -> impl IntoResponse {
    if mode != "increase" && mode != "decrease" {
        eprintln!(
            "{}: Error en el modo del cambio de stock",
            StatusCode::NOT_FOUND
        );
        return (
            StatusCode::NOT_FOUND,
            Json(json!({"message": "Error al obtener el modo"})),
        );
    }

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
        SELECT * FROM inventory WHERE id = $1
        "#,
        id
    )
    .fetch_one(&pool)
    .await;

    let data = match result {
        Ok(record) => {
            if !record.status {
                return (
                    StatusCode::NOT_FOUND,
                    Json(json!({"message": "Producto inexistente"})),
                );
            }
            record
        }
        Err(error) => {
            eprintln!("{}: Error en la BD: {}", StatusCode::NOT_FOUND, error);
            return (
                StatusCode::NOT_FOUND,
                Json(json!({"message": "Error al obtener los datos o producto inexistente"})),
            );
        }
    };

    let update_stock_value = match payload {
        Ok(value) => value,
        Err(_) => {
            eprintln!("{}: Error en el json", StatusCode::BAD_REQUEST);
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({"message": "Datos faltantes o tipos erroneos".to_string()})),
            );
        }
    };

    let mut _new_stock = 0;

    match mode.as_str() {
        "increase" => {
            _new_stock = update_stock_value.update + data.stock;
            if (_new_stock as i64) > data.maximun {
                eprintln!("{}: Error en los datos", StatusCode::BAD_REQUEST);
                return (
                    StatusCode::BAD_REQUEST,
                    Json(json!({"message": "El stock no puede superar el maximo"})),
                );
            }
        }
        "decrease" => {
            _new_stock = data.stock - update_stock_value.update;
            if _new_stock < data.minimun {
                eprintln!("{}: Error en los datos", StatusCode::BAD_REQUEST);
                return (
                    StatusCode::BAD_REQUEST,
                    Json(json!({"message": "No hay stock disponible"})),
                );
            }
        }
        _ => {
            eprintln!(
                "{}: Error en el modo del cambio de stock",
                StatusCode::NOT_FOUND
            );
            return (
                StatusCode::NOT_FOUND,
                Json(json!({"message": "Error al obtener el modo"})),
            );
        }
    }

    let update = query!(
        r#"
        UPDATE inventory SET
        stock = $1,
        updated_at = NOW() WHERE id = $2
        RETURNING id, name
        "#,
        _new_stock,
        id
    )
    .fetch_one(&pool)
    .await;

    match update {
        Ok(record) => {
            let res = json!({
                "id": record.id,
                "name": record.name,
                "message": "Se ha actualizado el stock exitosamente".to_string()
            });

            println!("{}: Stock actualizado: {}", StatusCode::OK, record.id);
            return (StatusCode::OK, Json(res));
        }
        Err(error) => {
            eprintln!(
                "{}: Error en la BD: {}",
                StatusCode::INTERNAL_SERVER_ERROR,
                error
            );
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message": "Error al  actualizar los datos o producto inexistente"})),
            );
        }
    }
}
