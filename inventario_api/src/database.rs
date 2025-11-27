use sqlx::{PgPool, postgres::PgPoolOptions};
use crate::models::inventory_table::inventory_table;

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
        Err(error) => {
            eprintln!("Error en la BD: {}", error);
            return
        }
    }
}

pub async fn get_pool() -> Result<PgPool,sqlx::Error> {
    let db_user = std::env::var("DB_USER").expect("Error el usuario de la DB");
    let db_password = std::env::var("DB_PASSWORD").expect("Error la contraseña de la DB");
    let db_host = std::env::var("DB_HOST").expect("Error el host de la DB");
    let db_database = std::env::var("DB_DATABASE").expect("Error la DB");
    let db_port = std::env::var("DB_PORT").expect("Error el puerto de la DB");
    let db_url = format!("postgresql://{}:{}@{}:{}/{}",db_user,db_password,db_host,db_port,db_database);

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