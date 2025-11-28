use axum::{Router, middleware, routing::{get, post, put}};

use crate::{controllers::inventory_controller::{add_new_product, get_all_products, get_product_by_id}, middleware::{headers_content_validation, worker_validate}};
use crate::middleware::{cors_config, user_validate};
use crate::controllers::update_inventory_controller::{change_by_id, update_product_by_id};

pub fn api_router() -> Router{

    let content_routes_users = Router::new()
        .route("/update/:id/:mode", put(change_by_id))
        .layer(middleware::from_fn(headers_content_validation));
    
    let user_routes = Router::new()
        .route("/:id", get(get_product_by_id))
        .route("/all", get(get_all_products))
        .merge(content_routes_users)
        .layer(middleware::from_fn(user_validate));


    let worker_routes = Router::new()
        .route("/add", post(add_new_product))
        .route("/update/:id", put(update_product_by_id))
        .layer(middleware::from_fn(worker_validate))
        .layer(middleware::from_fn(headers_content_validation));
    
    Router::new()
        .merge(user_routes)
        .merge(worker_routes)
        .layer(cors_config())
}