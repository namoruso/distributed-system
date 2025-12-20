use axum::{ Extension, Router, middleware, routing::{delete, get, post, put}};
use sqlx::{Pool, Postgres};

use crate::controllers::{
    inventory_controller::get_product_by_sku,
    update_inventory_controller::{change_by_id, update_product_by_id},
    delete_inventory_controller::delete_product,
};
use crate::middleware::{cors_config, user_validate};

use crate::{
    controllers::inventory_controller::{add_new_product, get_all_products, get_product_by_id},
    middleware::worker_validate,
};

pub fn api_router(pool: Pool<Postgres>) -> Router {

    let user_routes = Router::new()
        .route("/:id", get(get_product_by_id))
        .route("/sku/:sku", get(get_product_by_sku))
        .route("/all", get(get_all_products))
        .route("/update/:id/:mode", put(change_by_id))
        .layer(middleware::from_fn(user_validate));

    let admin_routes = Router::new()
        .route("/add", post(add_new_product))
        .route("/update/:id", put(update_product_by_id))
        .route("/delete/:id", delete(delete_product))
        .layer(middleware::from_fn(worker_validate));

    Router::new()
        .merge(user_routes)
        .merge(admin_routes)
        .layer(Extension(pool))
        .layer(cors_config())
}
