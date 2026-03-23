const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "mysecretkey";

// ==========================================================
// Hotel Booking API 
// จัดทำ/แก้ไขโดย: ญาดา แกล้วกล้า, รหัสนักศึกษา: 68030069
// ==========================================================

// ===============================
// Middleware ตรวจสอบ Token
// ===============================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "ไม่ได้ส่ง Token มาด้วย" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(401).json({ message: "Token ไม่ถูกต้อง" });
    req.user = user;
    next();
  });
};

// ===============================
// Swagger Config
// ===============================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hotel Booking API',
      version: '1.0.0',
      description: 'REST API สำหรับระบบจองห้องพักออนไลน์'
    },
    servers: [
      {
        url: '/',
        description: 'Current Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===============================
// Mock Database
// ===============================
let bookings = [];
let nextId = 1;

// ===============================
// LOGIN
// ===============================
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login สำเร็จ
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "กรุณากรอก username และ password" });

  if (username !== "admin" || password !== "admin123")
    return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

  const token = jwt.sign({ id: 1, username: "admin" }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// ===============================
// GET BOOKINGS
// ===============================
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: ดูรายการจอง
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
app.get('/api/bookings', authenticateToken, (req, res) => {
  res.json(bookings);
});

// ===============================
// CREATE BOOKING
// ===============================
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: สร้างการจอง
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: สร้างสำเร็จ
 */
app.post('/api/bookings', authenticateToken, (req, res) => {
  const newBooking = { id: nextId++, ...req.body };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// ===============================
// GET BY ID
// ===============================
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: ดูการจองตาม ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
app.get('/api/bookings/:id', authenticateToken, (req, res) => {
  const booking = bookings.find(b => b.id == req.params.id);
  if (!booking) return res.status(404).json({ message: "ไม่พบข้อมูล" });
  res.json(booking);
});

// ===============================
// UPDATE
// ===============================
/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: แก้ไขการจอง
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
app.put('/api/bookings/:id', authenticateToken, (req, res) => {
  const index = bookings.findIndex(b => b.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "ไม่พบข้อมูล" });

  bookings[index] = { ...bookings[index], ...req.body };
  res.json(bookings[index]);
});

// ===============================
// DELETE
// ===============================
/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: ลบการจอง
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const index = bookings.findIndex(b => b.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "ไม่พบข้อมูล" });

  bookings.splice(index, 1);
  res.json({ message: "ลบสำเร็จ" });
});

// ===============================
// CHECK-IN
// ===============================
/**
 * @swagger
 * /api/bookings/{id}/checkin:
 *   post:
 *     summary: Check-in
 *     tags: [CheckInOut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
// แก้ไขโดย: ญาดา แกล้วกล้า, รหัสนักศึกษา: 68030069
app.post('/api/bookings/:id/checkin', authenticateToken, (req, res) => {
  res.json({
    message: "Check-in successful",
    id: req.params.id
  });
});

// ===============================
// CHECK-OUT
// ===============================
/**
 * @swagger
 * /api/checkins/{id}/checkout:
 *   post:
 *     summary: Check-out
 *     tags: [CheckInOut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
// แก้ไขโดย: ญาดา แกล้วกล้า, รหัสนักศึกษา: 68030069
app.post('/api/checkins/:id/checkout', authenticateToken, (req, res) => {
  res.json({
    message: "Check-out started",
    id: req.params.id
  });
});

// ===============================
// CONFIRM
// ===============================
/**
 * @swagger
 * /api/checkouts/{id}/confirm:
 *   post:
 *     summary: Confirm Check-out
 *     tags: [CheckInOut]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: สำเร็จ
 */
// แก้ไขโดย: ญาดา แกล้วกล้า, รหัสนักศึกษา: 68030069
app.post('/api/checkouts/:id/confirm', authenticateToken, (req, res) => {
  res.json({
    message: "Confirmed",
    id: req.params.id
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(3001, () => {
  console.log("Server running on port 3001");
  console.log("Swagger → http://localhost:3001/api-docs");
});