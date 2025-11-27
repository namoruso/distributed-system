use std::io::{Error, ErrorKind};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct InventoryPayload {
    pub name: String,
    pub stock: Option<i32>,
    pub minimun: Option<i32>,
    pub maximun: Option<i32>,
    pub status: Option<bool>
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Products {
    pub id: i32,
    pub name: String,
    pub stock: i32,
    pub minimun: i32,
    pub maximun: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub status: bool,
}

#[derive(Debug, Deserialize)]
pub struct StockUpdate {
    pub update: i32
}

impl InventoryPayload {
    pub fn validate(&self) -> Result<Vec<i32>, Error> {

        let min = self.minimun.unwrap_or(0);
        let stock = self.stock.unwrap_or(min);
        let max = self.maximun.unwrap_or(min+1);

        if min > max || stock > max || stock < min {
            return Err(Error::new(
                ErrorKind::InvalidData,
                "El mínimo no puede ser mayor al stock o el stock y minimo no pueden ser mayor que el máximo",
            ));
        }

        if max <= 0 {
            return Err(Error::new(
                ErrorKind::InvalidData,
                "No pueden tener valores negativos o un máximo igual a 0",
            ));
        }

        Ok(vec![stock, max, min])
    }
}