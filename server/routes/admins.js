import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware: solo super_admin
function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Solo super_admin puede realizar esta acción' });
  next();
}

// GET /api/admins — listar todos (admin+)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, last_name, phone, role, created_at FROM admins ORDER BY id ASC'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Error al obtener administradores' }); }
});

// GET /api/admins/me — perfil propio
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, last_name, phone, role, created_at FROM admins WHERE id=$1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Error al obtener perfil' }); }
});

// PATCH /api/admins/me — editar perfil propio
router.patch('/me', authenticateToken, async (req, res) => {
  const { name, last_name, email, phone, password } = req.body;
  try {
    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE admins SET name=$1, last_name=$2, email=$3, phone=$4, password=$5 WHERE id=$6',
        [name, last_name || '', email, phone || '', hashed, req.user.id]
      );
    } else {
      await pool.query(
        'UPDATE admins SET name=$1, last_name=$2, email=$3, phone=$4 WHERE id=$5',
        [name, last_name || '', email, phone || '', req.user.id]
      );
    }
    const { rows } = await pool.query(
      'SELECT id, email, name, last_name, phone, role, created_at FROM admins WHERE id=$1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Error al actualizar perfil' }); }
});

// POST /api/admins — crear admin (super_admin only)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { name, last_name, email, phone, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  const validRoles = ['admin', 'super_admin'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Rol inválido' });
  try {
    const exists = await pool.query('SELECT id FROM admins WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'Ya existe un admin con ese email' });
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO admins (name, last_name, email, phone, password, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, name, last_name, phone, role, created_at',
      [name, last_name || '', email, phone || '', hashed, role]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Error al crear administrador' }); }
});

// PATCH /api/admins/:id — editar admin (super_admin only)
router.patch('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { name, last_name, email, phone, role, password } = req.body;
  const validRoles = ['admin', 'super_admin'];
  if (role && !validRoles.includes(role)) return res.status(400).json({ error: 'Rol inválido' });
  try {
    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE admins SET name=$1, last_name=$2, email=$3, phone=$4, role=$5, password=$6 WHERE id=$7',
        [name, last_name || '', email, phone || '', role, hashed, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE admins SET name=$1, last_name=$2, email=$3, phone=$4, role=$5 WHERE id=$6',
        [name, last_name || '', email, phone || '', role, req.params.id]
      );
    }
    const { rows } = await pool.query(
      'SELECT id, email, name, last_name, phone, role, created_at FROM admins WHERE id=$1',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Error al actualizar administrador' }); }
});

// DELETE /api/admins/:id — eliminar admin (super_admin only), requiere motivo
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { reason } = req.body;
  if (!reason?.trim()) return res.status(400).json({ error: 'El motivo de eliminación es obligatorio' });
  if (parseInt(req.params.id) === 1) return res.status(403).json({ error: 'No se puede eliminar al administrador principal' });
  if (parseInt(req.params.id) === req.user.id) return res.status(403).json({ error: 'No puedes eliminarte a ti mismo' });
  try {
    // Guardar motivo antes de eliminar
    await pool.query('UPDATE admins SET cancel_reason=$1 WHERE id=$2', [reason, req.params.id]);
    await pool.query('DELETE FROM admins WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Error al eliminar administrador' }); }
});

export default router;
