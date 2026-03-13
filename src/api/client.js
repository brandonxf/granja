const API_URL = 'https://granja-production.up.railway.app/api';

// Helper para manejar respuestas
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data;
};

// Obtener token del localStorage
const getToken = () => localStorage.getItem('adminToken');

// API de Productos
export const productsAPI = {
  // Obtener todos los productos
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/products${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  // Obtener un producto por ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
  },

  // Crear producto
  create: async (productData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  // Actualizar producto
  update: async (id, productData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  // Eliminar producto
  delete: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await fetch(`${API_URL}/products/categories/all`);
    return handleResponse(response);
  },

  // Crear categoría
  createCategory: async (categoryData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });
    return handleResponse(response);
  }
};

// API de Autenticación
export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  // Verificar token
  verify: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  }
};

// API de Upload
export const uploadAPI = {
  // Subir imagen
  uploadImage: async (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  // Subir múltiples imágenes
  uploadImages: async (files) => {
    const token = getToken();
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  // Eliminar imagen
  deleteImage: async (filename) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ filename })
    });
    return handleResponse(response);
  }
};

export default API_URL;

// API de Pedidos
export const ordersAPI = {
  create: async (orderData) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },
  getById: async (id) => {
    const response = await fetch(`${API_URL}/orders/${id}`);
    return handleResponse(response);
  },
  getAll: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },
  updateStatus: async (id, status) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  getStats: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/orders/stats/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  }
};
