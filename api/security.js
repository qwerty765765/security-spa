// Импортируем данные из db.json
const db = require('../db.json');

// Копируем данные для работы
let securityObjects = db.security || [];
let nextId = securityObjects.length > 0 
  ? Math.max(...securityObjects.map(obj => obj.id)) + 1 
  : 1;

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Получаем ID из URL: /api/security/123
  const urlParts = req.url.split('/');
  const id = urlParts[urlParts.length - 1];
  const isNumericId = !isNaN(parseInt(id)) && id !== 'security';

  try {
    // GET /api/security - получить все объекты
    if (req.method === 'GET' && (!isNumericId || urlParts.length === 3)) {
      return res.status(200).json(securityObjects);
    }
    
    // GET /api/security/:id - получить объект по ID
    if (req.method === 'GET' && isNumericId) {
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
      return res.status(201).json(newObject);
    }
    
    // PUT /api/security/:id - обновить объект
    if (req.method === 'PUT' && isNumericId) {
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
      return res.status(200).json(updatedObject);
    }
    
    // DELETE /api/security/:id - удалить объект
    if (req.method === 'DELETE' && isNumericId) {
      const index = securityObjects.findIndex(obj => obj.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Объект не найден' });
      }
      
      securityObjects.splice(index, 1);
      return res.status(200).json({ message: 'Объект удален' });
    }
    
    // Если метод не поддерживается
    return res.status(405).json({ message: 'Метод не поддерживается' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
}
