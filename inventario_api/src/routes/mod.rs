use axum::{Router, routing::{get, post, put}};

use crate::controllers::inventory_controller::{add_new_product, get_all_products, get_product_by_id};
use crate::controllers::update_inventory_controller::{change_by_id, update_product_by_id};

pub fn api_router() -> Router{
    Router::new()
    .route("/add", post(add_new_product))
    .route("/:id", get(get_product_by_id))
    .route("/all", get(get_all_products))
    .route("/update/:id", put(update_product_by_id))
    .route("/update/:id/:mode", put(change_by_id))
}