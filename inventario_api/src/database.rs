use sqlx::{PgPool, postgres::PgPoolOptions};
use crate::models::inventory_table::inventory_table;
use std::env;

pub async fn init_db()  {

    let pool = get_pool().await;
    match pool {
        Ok(connect) => {
            println!("Conexión inicial exitosa a postgres");
            if let Err(e) = inventory_table(&connect).await {
                eprintln!("Error al crear la tabla de la base de datos: {}", e);
                return;
            } 
        }
        Err(_) => {
            return
        }
    }
}

pub async fn get_pool() -> Result<PgPool,sqlx::Error> {
    let db_url = env::var("DATABASE_URL").expect("Error al obtener el url");

    let connect = PgPoolOptions::new()
    .max_connections(5)  
    .idle_timeout(std::time::Duration::from_secs(300)) 
    .acquire_timeout(std::time::Duration::from_secs(5)) 
    .connect(&db_url)
    .await;
    
    match connect {
        Ok(pool) => Ok(pool),
        Err(err) => {
            eprintln!("Error al conectar a la DB: {}", err);
            Err(err)
        }
    }
}