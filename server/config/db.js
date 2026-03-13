import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDatabase() {
  try {
    // Crear tabla de administradores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de categorías
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'kg',
        featured BOOLEAN DEFAULT false,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pendiente',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de items del pedido
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL
      )
    `);

    // Migración: agregar cancel_reason si no existe
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT`);

    // Verificar si existe un admin por defecto
    const adminExists = await pool.query('SELECT * FROM admins LIMIT 1');
    if (adminExists.rows.length === 0) {
      // Crear admin por defecto (contraseña: admin123)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admins (email, password, name) VALUES ($1, $2, $3)',
        ['admin@granjaverde.com', hashedPassword, 'Administrador']
      );
      console.log('✅ Admin por defecto creado: admin@granjaverde.com / admin123');
    }

    // Insertar categorías por defecto si no existen
    const categoriesExist = await pool.query('SELECT * FROM categories LIMIT 1');
    if (categoriesExist.rows.length === 0) {
      await pool.query(`
        INSERT INTO categories (name, description) VALUES 
        ('Verduras', 'Verduras frescas de nuestra granja'),
        ('Frutas', 'Frutas orgánicas de temporada'),
        ('Huevos', 'Huevos de gallinas libres'),
        ('Lácteos', 'Productos lácteos frescos'),
        ('Otros', 'Otros productos de la granja')
      `);
      console.log('✅ Categorías por defecto creadas');
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

export default pool;
