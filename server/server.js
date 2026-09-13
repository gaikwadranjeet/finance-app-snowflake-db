const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure connection pool to Snowflake
const connectionPool = snowflake.createPool({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE
}, {
  max: 10,
  min: 1
});

function executeQuery(sqlText, binds = []) {
  return new Promise((resolve, reject) => {
    connectionPool.use(async (clientConnection) => {
      clientConnection.execute({
        sqlText: sqlText,
        binds: binds,
        complete: (err, stmt, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      });
    }).catch(reject);
  });
}

// Dropdown filters endpoint
app.get('/api/filters', async (req, res) => {
  try {
    const brands = await executeQuery('SELECT DISTINCT HOTEL_BRAND FROM FINANCE WHERE HOTEL_BRAND IS NOT NULL ORDER BY HOTEL_BRAND');
    const properties = await executeQuery('SELECT DISTINCT PROPERTY_NAME FROM FINANCE WHERE PROPERTY_NAME IS NOT NULL ORDER BY PROPERTY_NAME');
    const cities = await executeQuery('SELECT DISTINCT CITY FROM FINANCE WHERE CITY IS NOT NULL ORDER BY CITY');
    const years = await executeQuery('SELECT DISTINCT FISCAL_YEAR FROM FINANCE WHERE FISCAL_YEAR IS NOT NULL ORDER BY FISCAL_YEAR DESC');

    res.json({
      brands: brands.map(r => r.HOTEL_BRAND),
      properties: properties.map(r => r.PROPERTY_NAME),
      cities: cities.map(r => r.CITY),
      years: years.map(r => r.FISCAL_YEAR)
    });
  } catch (error) {
    console.error('Error fetching filter values:', error);
    res.status(500).json({ error: error.message });
  }
});

// Query financial data endpoint
app.get('/api/financials', async (req, res) => {
  try {
    const { brand, property, city, year } = req.query;

    let query = `
      SELECT 
        RECORD_ID,
        HOTEL_BRAND,
        PROPERTY_NAME,
        CITY,
        FISCAL_YEAR,
        FISCAL_QUARTER,
        ROOM_REVENUE,
        FB_REVENUE,
        BANQUET_EVENT_REVENUE,
        TOTAL_REVENUE
      FROM FINANCE
      WHERE 1=1
    `;
    const binds = [];

    if (brand) {
      query += ` AND HOTEL_BRAND = ?`;
      binds.push(brand);
    }
    if (property) {
      query += ` AND PROPERTY_NAME = ?`;
      binds.push(property);
    }
    if (city) {
      query += ` AND CITY = ?`;
      binds.push(city);
    }
    if (year) {
      query += ` AND FISCAL_YEAR = ?`;
      binds.push(Number(year));
    }

    query += ` ORDER BY FISCAL_YEAR DESC, FISCAL_QUARTER ASC`;

    const rows = await executeQuery(query, binds);
    res.json(rows);
  } catch (error) {
    console.error('Error querying finance table:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Snowflake API server running on http://localhost:${PORT}`);
});
