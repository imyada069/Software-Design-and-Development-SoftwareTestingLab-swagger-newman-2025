const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "mysecretkey";


// ===============================
// Middleware ตรวจสอบ Token
// ===============================
const authenticateToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: "ไม่ได้ส่ง Token มาด้วย"
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {

    if (err) {
      return res.status(401).json({
        message: "Token หมดอายุหรือไม่ถูกต้อง"
      });
    }

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
      description: 'REST API สำหรับระบบจองห้องพักออนไลน์ — Lab02A'
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
      },

      schemas: {

        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                username: { type: 'string' },
                role: { type: 'string', enum: ['admin','user'] }
              }
            }
          }
        },

        Booking: {
          type: 'object',
          properties: {

            id: { type: 'integer', example: 1 },

            fullname: {
              type: 'string',
              example: 'สมชาย ใจดี'
            },

            email: {
              type: 'string',
              example: 'somchai@example.com'
            },

            phone: {
              type: 'string',
              example: '0812345678'
            },

            checkin: {
              type: 'string',
              example: '2026-12-01'
            },

            checkout: {
              type: 'string',
              example: '2026-12-03'
            },

            roomtype: {
              type: 'string',
              enum: ['standard','deluxe','suite']
            },

            guests: {
              type: 'integer',
              example: 2
            }

          }
        }

      }

    }

  },

  apis: ['./server.js']

};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// =====================================================
// LOGIN API
// =====================================================

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
 *             required: [username,password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login สำเร็จ
 */

app.post('/api/login', (req,res)=>{

  const { username, password } = req.body;

  if(!username || !password){
    return res.status(400).json({
      message:"กรุณากรอก username และ password"
    });
  }

  if(username !== "admin" || password !== "admin123"){
    return res.status(401).json({
      message:"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
    });
  }

  const token = jwt.sign(
    { id:1, username:"admin", role:"admin" },
    SECRET_KEY,
    { expiresIn:'1h' }   // ใช้ทดสอบ Token หมดอายุ
  );

  res.json({
    token,
    user:{
      id:1,
      username:"admin",
      role:"admin"
    }
  });

});


// =====================================================
// GET BOOKINGS (Protected)
// =====================================================

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: ดูรายการจองห้องพัก
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการจองทั้งหมด
 */

app.get('/api/bookings', authenticateToken,(req,res)=>{

  res.json([
    {
      id:1,
      fullname:"สมชาย ใจดี",
      roomtype:"standard",
      guests:2
    }
  ]);

});


// =====================================================
// HEALTH CHECK
// =====================================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: ตรวจสอบสถานะของ Server
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server ทำงานปกติ
 */

app.get('/api/health',(req,res)=>{

  res.json({
    status:"ok",
    uptime:process.uptime(),
    time:new Date().toISOString()
  });

});


// =====================================================
// START SERVER
// =====================================================

const PORT = 3001;

app.listen(PORT,()=>{

  console.log(`🚀 Server running`);
  console.log(`Swagger UI → /api-docs`);

});