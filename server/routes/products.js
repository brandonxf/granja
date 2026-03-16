import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const { category, featured, active } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND p.category_id = $${params.length}`;
    }

    if (featured === 'true') {
      query += ` AND p.featured = true`;
    }

    if (active !== 'false') {
      query += ` AND p.active = true`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, stock, unit, featured } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category_id, image_url, stock, unit, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, price, category_id, image_url, stock || 0, unit || 'kg', featured || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, stock, unit, featured, active } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category_id = $4, 
           image_url = $5, stock = $6, unit = $7, featured = $8, active = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, description, price, category_id, image_url, stock, unit, featured, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Obtener todas las categorías
router.get('/categories/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Crear categoría (solo admin)
router.post('/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name, description, active) VALUES ($1, $2, true) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Fallback sin columna active
    try {
      const { name, description } = req.body;
      const result = await pool.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      res.status(201).json(result.rows[0]);
    } catch (e) {
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }
});

// Editar categoría
router.put('/categories/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar categoría' });
  }
});

// Activar/desactivar categoría
router.patch('/categories/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Agregar columna active si no existe
    await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true');
    const result = await pool.query(
      'UPDATE categories SET active = NOT COALESCE(active, true) WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
});

// Eliminar categoría
router.delete('/categories/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Verificar si tiene productos
    const products = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(products.rows[0].count) > 0) {
      return res.status(400).json({ error: `No se puede eliminar: tiene ${products.rows[0].count} producto(s) asociado(s)` });
    }
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// Limpiar URLs viejas de filesystem (temporal)
router.post('/cleanup-images', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE products 
      SET image_url = NULL 
      WHERE image_url IS NOT NULL 
      AND image_url NOT LIKE 'http%'
    `);
    res.json({ message: `${result.rowCount} producto(s) actualizados` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
