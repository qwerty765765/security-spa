// Начальные данные
let securityObjects = [
  {
    id: 1,
    name: 'Жилой комплекс «Безопасный дом»',
    type: 'Комплексная система',
    address: 'ул. Ленина, 15',
    cameras: 48,
    staff: 12,
    status: 'maintenance',
    description: 'Полный комплекс мер безопасности включает видеонаблюдение по периметру, контроль доступа в подъезды и на парковку, круглосуточное патрулирование территории.',
    emergency_contacts: '+7 (495) 123-45-67'
  },
  {
    id: 2,
    name: 'Бизнес-центр "Кристалл"',
    type: 'Контроль доступа',
    address: 'пр. Мира, 78',
    cameras: 24,
    staff: 8,
    status: 'active',
    description: 'Современная система контроля доступа с биометрией',
    emergency_contacts: '+7 (495) 987-65-43'
  },
  {
    id: 3,
    name: 'Торговый центр "Гранд"',
    type: 'Охранная сигнализация',
    address: 'ул. Садовая, 42',
    cameras: 8,
    staff: 6,
    status: 'maintenance',
    description: 'Модернизация системы сигнализации',
    emergency_contacts: '+7 (495) 555-12-34'
  }
];

let nextId = 4;

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API Request:', req.method, req.url);

  try {
    // Получаем путь из URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(part => part !== '');
    
    // Убираем 'api' и 'security' из пути
    const id = pathParts.length > 2 ? pathParts[2] : null;
    
    console.log('ID:', id);

    // GET /api/security - получить все объекты
    if (req.method === 'GET' && !id) {
      console.log('Returning all objects:', securityObjects.length);
      return res.status(200).json(securityObjects);
    }
    
    // GET /api/security/:id - получить объект по ID
    if (req.method === 'GET' && id) {
      const object = securityObjects.find(obj => obj.id === parseInt(id));
      if (!object) {
        return res.status(404).json({ message: 'Объект не найден' });
      }
      return res.status(200).json(object);
    }
    
    // POST /api/security - создать новый объект
    if (req.method === 'POST') {
      const data = req.body;
      const newObject = {
        id: nextId++,
        ...data,
        cameras: parseInt(data.cameras) || 0,
        staff: parseInt(data.staff) || 0
      };
      securityObjects.push(newObject);
      console.log('Created new object:', newObject);
      return res.status(201).json(newObject);
    }
    
    // PUT /api/security/:id - обновить объект
    if (req.method === 'PUT' && id) {
      const index = securityObjects.findIndex(obj => obj.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Объект не найден' });
      }
      
      const updatedObject = {
        ...securityObjects[index],
        ...req.body,
        id: parseInt(id),
        cameras: parseInt(req.body.cameras) || securityObjects[index].cameras,
        staff: parseInt(req.body.staff) || securityObjects[index].staff
      };
      
      securityObjects[index] = updatedObject;
      console.log('Updated object:', updatedObject);
      return res.status(200).json(updatedObject);
    }
    
    // DELETE /api/security/:id - удалить объект
    if (req.method === 'DELETE' && id) {
      const index = securityObjects.findIndex(obj => obj.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Объект не найден' });
      }
      
      securityObjects.splice(index, 1);
      console.log('Deleted object with id:', id);
      return res.status(200).json({ message: 'Объект удален' });
    }
    
    // Если метод не поддерживается
    console.log('Method not found:', req.method, req.url);
    return res.status(404).json({ message: 'Маршрут не найден' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
