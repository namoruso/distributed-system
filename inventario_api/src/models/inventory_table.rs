use sqlx::PgPool;

pub async fn inventory_table(pool: &PgPool) -> Result<(), sqlx::Error> {
    
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            stock INTEGER NOT NULL,
            minimun INTEGER NOT NULL,
            maximun INTEGER NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            status boolean DEFAULT TRUE NOT NULL
        )"
    )
    .execute(pool)
    .await?;

    Ok(())
}