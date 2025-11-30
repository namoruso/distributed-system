use axum::{
    Router, middleware,
    routing::{get, post, put},
};

use crate::controllers::{
    inventory_controller::get_product_by_sku,
    update_inventory_controller::{change_by_id, update_product_by_id},
};
use crate::middleware::{cors_config, user_validate};
use crate::{
    controllers::inventory_controller::{add_new_product, get_all_products, get_product_by_id},
    middleware::{headers_content_validation, worker_validate},
};

pub fn api_router() -> Router {
    let user_read_routes = Router::new()
        .route("/:id", get(get_product_by_id))
        .route("/sku/:sku", get(get_product_by_sku))
        .route("/all", get(get_all_products));

    let user_write_routes = Router::new()
        .route("/update/:id/:mode", put(change_by_id))
        .layer(middleware::from_fn(headers_content_validation));

    let user_routes = Router::new()
        .merge(user_read_routes)
        .merge(user_write_routes)
        .layer(middleware::from_fn(user_validate));

    let admin_routes = Router::new()
        .route("/add", post(add_new_product))
        .route("/update/:id", put(update_product_by_id))
        .layer(middleware::from_fn(worker_validate))
        .layer(middleware::from_fn(headers_content_validation));

    Router::new()
        .merge(user_routes)
        .merge(admin_routes)
        .layer(cors_config())
}
