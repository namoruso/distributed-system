use sqlx::{PgPool, postgres::PgPoolOptions};

use crate::models::inventory_table::inventory_table;

pub async fn init_db()  {

    let pool = get_pool().await;
    match pool {
        Ok(connect) => {
            println!("Conexión inicial exitosa a postgres");
            if let Err(e) = inventory_table(&connect).await {
                eprintln!("Error al configurar la base de datos: {}", e);
                return;
            } 
        }
        Err(error) => {
            eprintln!("Error en la BD: {}", error);
            return
        }
    }

}

pub async fn get_pool() -> Result<PgPool,sqlx::Error> {
    let db_url = std::env::var("DATABASE_URL").expect("Error al obtener la URL de la DB");
    let pool = PgPoolOptions::new()
    .max_connections(5)  
    .idle_timeout(std::time::Duration::from_secs(300)) 
    .acquire_timeout(std::time::Duration::from_secs(5)) 
    .connect(&db_url)
    .await
    .expect("Fallo al conectar a la DB");

    Ok(pool)
}