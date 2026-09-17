export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  // Для GitHub Pages: если запрос к API невозможен, имитируем успех для некоторых методов
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "Ошибка сервера" }));
      throw new Error(data.error || "Ошибка запроса");
    }
    return res.json();
  } catch (err) {
    console.warn(`API Error for ${url}, attempting mock:`, err);
    
    // Имитация для статической версии (GitHub Pages)
    if (typeof window !== 'undefined') {
      const mockData = getMockData(url, options);
      if (mockData !== null) return mockData as T;
    }
    throw err;
  }
}

function getMockData(url: string, options?: RequestInit): any {
  const method = options?.method || 'GET';
  
  if (url.includes('/api/auth/me')) {
    const user = localStorage.getItem('user');
    return user ? { user: JSON.parse(user) } : null;
  }
  
  if (url.includes('/api/programs')) {
    return JSON.parse(localStorage.getItem('mock_programs') || '[]');
  }

  if (url.includes('/api/children')) {
    if (method === 'GET') return JSON.parse(localStorage.getItem('mock_children') || '[]');
    if (method === 'POST') {
      const body = JSON.parse(options?.body as string);
      const list = JSON.parse(localStorage.getItem('mock_children') || '[]');
      const newItem = { ...body, id: Date.now() };
      list.push(newItem);
      localStorage.setItem('mock_children', JSON.stringify(list));
      return newItem;
    }
  }

  // Для других эндпоинтов возвращаем пустые массивы или null, чтобы не ломать UI
  if (url.includes('/api/bookings')) return JSON.parse(localStorage.getItem('mock_bookings') || '[]');
  if (url.includes('/api/subscriptions')) return JSON.parse(localStorage.getItem('mock_subscriptions') || '[]');
  if (url.includes('/api/schedule')) return JSON.parse(localStorage.getItem('mock_schedule') || '[]');
  
  return null;
}

