import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders — crear pedido (público, desde el carrito)
router.post('/', async (req, res) => {
  const { customer_name, customer_phone, items, total, notes } = req.body;
  if (!customer_name || !items?.length || !total) {
    return res.status(400).json({ error: 'Faltan datos del pedido' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query(
      `INSERT INTO orders (customer_name, customer_phone, total, notes, status)
       VALUES ($1, $2, $3, $4, 'pendiente') RETURNING *`,
      [customer_name, customer_phone || '', total, notes || '']
    );
    const order = orderRes.rows[0];
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );
    }
    await client.query('COMMIT');
    res.json({ order_id: order.id, status: order.status });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear pedido' });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id — seguimiento público de pedido
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'product_name', p.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal,
          'image_url', p.image_url
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
});

// GET /api/orders — lista todos (admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'product_name', p.name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'subtotal', oi.subtotal
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// PATCH /api/orders/:id/status — actualizar estado (admin)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    const { rows } = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// GET /api/orders/stats/summary — estadísticas (admin)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const [totals, byStatus, byDay, topProducts] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(total), 0) as avg_order,
          COUNT(CASE WHEN status='pendiente' THEN 1 END) as pending
        FROM orders
      `),
      pool.query(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(total),0) as revenue
        FROM orders GROUP BY status ORDER BY count DESC
      `),
      pool.query(`
        SELECT DATE(created_at) as day, COUNT(*) as orders, COALESCE(SUM(total),0) as revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `),
      pool.query(`
        SELECT p.name, p.image_url, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        GROUP BY p.id, p.name, p.image_url
        ORDER BY total_sold DESC
        LIMIT 5
      `)
    ]);

    res.json({
      totals: totals.rows[0],
      byStatus: byStatus.rows,
      byDay: byDay.rows,
      topProducts: topProducts.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
