# ใบงานการทดลอง Software Testing Part 1
# API Documentation ด้วย Swagger และ Automated Testing ด้วย Newman
## ระบบจองห้องพักออนไลน์ (Hotel Booking System)

**วิชา:** การออกแบบและพัฒนาซอฟต์แวร์ 1 (Software Design and Development 1)  
**Repository สำหรับการทดลอง:** `https://github.com/surachai-p/booking-app-demo-2025.git`  หรือใช้ Repository งานของตนเองที่ทำส่ง


---

## วัตถุประสงค์การเรียนรู้

1. อธิบายหลักการ API Documentation และความสำคัญของ Swagger/OpenAPI ได้
2. ติดตั้งและตั้งค่า `swagger-jsdoc` + `swagger-ui-express` ใน Express.js ได้
3. เขียน JSDoc Comment เพื่อสร้าง Swagger Documentation ครอบคลุมทุก Endpoint ได้
4. ทดสอบ API ผ่าน Swagger UI โดยตรงในเบราว์เซอร์ได้
5. สร้าง Newman Collection จาก Node.js script และรัน Automated Test ผ่าน CLI ได้
6. อธิบายความสัมพันธ์ระหว่าง Swagger และ Newman ในกระบวนการพัฒนา API ได้

---

## ภาพรวม API ที่ใช้ในการทดสอบ (System Under Test)

**Base URL:** `http://localhost:3001`  
**Frontend URL:** `http://localhost:5173`

| Method | Endpoint | Auth | คำอธิบาย |
|--------|----------|:---:|---------|
| POST | `/api/login` | ❌ | เข้าสู่ระบบ รับ JWT Token |
| POST | `/api/bookings` | ❌ | สร้างการจองใหม่ |
| GET | `/api/bookings` | ✅ JWT | ดึงข้อมูลการจองทั้งหมด |
| GET | `/api/bookings/:id` | ✅ JWT | ดึงข้อมูลการจองตาม ID |
| PUT | `/api/bookings/:id` | ✅ JWT | แก้ไขข้อมูลการจอง |
| DELETE | `/api/bookings/:id` | ✅ JWT | ลบข้อมูลการจอง |

> **Admin Account:** username: `admin` / password: `admin123`

---

---

## ส่วนที่ 1 — API Documentation ด้วย Swagger

---

### 🔷 ทฤษฎีที่เกี่ยวข้อง

#### 1.A Swagger และ OpenAPI Specification คืออะไร

**Swagger** คือชุดเครื่องมือสำหรับสร้าง ออกแบบ และแสดงผล REST API Documentation โดยอ้างอิงมาตรฐาน **OpenAPI Specification (OAS)** ซึ่งเป็น format กลางที่ทุกระบบเข้าใจได้

**วิวัฒนาการของ Swagger → OpenAPI:**

```
ปี 2010  Swagger 1.0       — Tony Tam สร้างที่ Wordnik
         │
ปี 2014  Swagger 2.0       — กลายเป็น Standard ที่ใช้กันทั่วโลก
         │
ปี 2016  OpenAPI 3.0       — SmartBear บริจาคให้ Linux Foundation
         │                   เปลี่ยนชื่อ Spec เป็น "OpenAPI"
         │                   แต่ Tools ยังใช้ชื่อ "Swagger"
         ▼
ปัจจุบัน OpenAPI 3.x       — มาตรฐานอุตสาหกรรม
         (swagger-jsdoc, swagger-ui-express ใช้ใบงานนี้)
```

> 💡 **สรุปง่ายๆ:** "Swagger" คือชื่อ Tools, "OpenAPI" คือชื่อ Specification — ปัจจุบันใช้สลับกันได้

---

#### 1.B ทำไมต้องมี API Documentation

ลองนึกภาพว่าต้องใช้ API ที่ไม่มีเอกสารเลย:

```
นักพัฒนา Frontend:  "POST /api/bookings ต้องส่ง field อะไรบ้าง?"
นักพัฒนา Backend:   "ดูใน code เองเลย..."
                          ↓
                   ใช้เวลา 30 นาทีอ่าน code
                          ↓
                 ส่ง field ผิด → 400 Bad Request
                          ↓
                   ถามอีกรอบ → เสียเวลาทั้งทีม
```

**Swagger แก้ปัญหานี้ด้วยการเป็น "Single Source of Truth":**
<img src="images/swagger-architech.png" width="80%">

---

#### 1.C โครงสร้าง OpenAPI Specification

Swagger Document ประกอบด้วย 3 ส่วนหลัก:

```
OpenAPI Document
├── info          — ชื่อ API, เวอร์ชัน, คำอธิบาย
├── servers       — Base URL (เช่น http://localhost:3001)
├── components    — Schema ที่ใช้ซ้ำ (เช่น Booking object)
│   ├── securitySchemes
│   │   └── bearerAuth   ← บอกว่า API ใช้ JWT Bearer
│   └── schemas
│       ├── Booking       ← โครงสร้างข้อมูลการจอง
│       └── LoginRequest  ← โครงสร้าง request body login
└── paths         — Endpoints ทั้งหมด
    ├── /api/login
    │   └── post
    │       ├── summary      — "เข้าสู่ระบบ"
    │       ├── requestBody  — body ที่ต้องส่ง
    │       └── responses    — 200, 401, 400
    └── /api/bookings
        ├── get              — GET all bookings (requires bearerAuth)
        └── post             — Create booking (no auth)
```

---

#### 1.D ความสัมพันธ์ระหว่าง Swagger กับ Newman

---

> 📌 **รูปที่ 1 — ภาพรวม Swagger + Newman ใน API Development Workflow**

![Swagger - newman](images/swagger-newman.png)
---

> 📌 **รูปที่ 2 — เปรียบเทียบการทำงานของ Swagger UI vs Newman**
![Swagger - newman](images/swagger-newman-compair.png)



---

**ตารางเปรียบเทียบ Swagger UI กับ Newman:**

| ด้าน | Swagger UI | Newman |
|------|-----------|--------|
| วิธีใช้งาน | คลิกผ่านเบราว์เซอร์ (Manual) | รันผ่าน Terminal (Automated) |
| จำนวน Request ต่อครั้ง | 1 Request | ทั้ง Collection ทีเดียว |
| ตรวจสอบผล | มนุษย์อ่านเอง | Script ตรวจสอบอัตโนมัติ |
| เหมาะกับ | สำรวจ API, แชร์กับทีม, Onboard | CI/CD, Regression Test |
| Output | หน้าเว็บ Interactive | Terminal + HTML Report |
| ต้องการ Browser | ✅ | ❌ |
| รันใน Pipeline ได้ | ❌ | ✅ |

---

#### 1.E เครื่องมือที่ใช้ใน Express.js

**`swagger-jsdoc`** — อ่าน JSDoc Comment (`@swagger`) จาก source code แล้วสร้าง OpenAPI JSON object

**`swagger-ui-express`** — รับ OpenAPI JSON แล้ว serve เป็น HTML Interactive UI ที่ path `/api-docs`

```javascript
// ภาพรวมการทำงานใน server.js
const spec = swaggerJsdoc(options);        // 1. อ่าน @swagger comments → สร้าง spec
app.use('/api-docs', swaggerUi(spec));     // 2. serve spec เป็น Interactive HTML UI
app.post('/api/login', loginHandler);     // 3. Endpoints จริงยังทำงานปกติ ไม่ถูก Swagger แตะ
```

---

### 1.1 การติดตั้ง Swagger

```bash
cd backend

# ติดตั้ง 2 packages:
# swagger-jsdoc     — อ่าน JSDoc comment สร้าง OpenAPI spec
# swagger-ui-express — serve Swagger UI ที่ /api-docs
npm install swagger-jsdoc swagger-ui-express

# ตรวจสอบว่าติดตั้งสำเร็จ
npm list swagger-jsdoc swagger-ui-express
```

ผลลัพธ์ที่ควรเห็น:

```
backend@1.0.0
├── swagger-jsdoc@6.x.x
└── swagger-ui-express@5.x.x
```

---

### 1.2 กิจกรรมที่ 1 — ตั้งค่า Swagger ใน server.js

เปิดไฟล์ `backend/server.js` แล้วเพิ่ม code ต่อไปนี้:

#### ขั้นที่ 1 — Import (ต่อจาก require เดิม)

```javascript
// เพิ่มหลังบรรทัด require เดิม
const swaggerJsdoc = require('swagger-jsdoc');       // อ่าน JSDoc comment → สร้าง spec
const swaggerUi    = require('swagger-ui-express');   // serve spec เป็น Interactive UI
```

#### ขั้นที่ 2 — กำหนด Swagger Options (ต่อจาก const PORT = ...)

```javascript
// ─────────────────────────────────────────────────────────────
// Swagger / OpenAPI Configuration
// ─────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Hotel Booking API',
      version:     '1.0.0',
      description: 'REST API สำหรับระบบจองห้องพักออนไลน์ — ใบงาน Lab02A',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development Server' }
    ],
    components: {
      // Security Scheme — บอก Swagger ว่า API ใช้ Bearer JWT
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
      // Schema — โครงสร้างข้อมูลที่ใช้ซ้ำใน Request/Response
      schemas: {
        Booking: {
          type: 'object',
          required: ['fullname', 'email', 'phone', 'checkin', 'checkout', 'roomtype', 'guests'],
          properties: {
            id:         { type: 'integer', example: 1 },
            fullname:   { type: 'string',  example: 'สมชาย ใจดี' },
            email:      { type: 'string',  format: 'email', example: 'somchai@example.com' },
            phone:      { type: 'string',  example: '0812345678' },
            checkin:    { type: 'string',  format: 'date',  example: '2026-12-01' },
            checkout:   { type: 'string',  format: 'date',  example: '2026-12-03' },
            roomtype:   { type: 'string',  enum: ['standard', 'deluxe', 'suite'], example: 'standard' },
            guests:     { type: 'integer', minimum: 1, maximum: 4, example: 2 },
            status:     { type: 'string',  example: 'pending' },
            comment:    { type: 'string',  example: 'ต้องการห้องชั้นล่าง' },
            created_at: { type: 'string',  example: '2026-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  },
  // บอก swagger-jsdoc ให้อ่าน @swagger comment จากไฟล์เหล่านี้
  apis: ['./server.js'],
};

// สร้าง OpenAPI spec จาก options และ @swagger comments ในไฟล์
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Mount Swagger UI ที่ path /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log('📄 Swagger UI: http://localhost:3001/api-docs');
```

#### ขั้นที่ 3 — เพิ่ม JSDoc Comment ให้แต่ละ Endpoint

เพิ่ม comment **เหนือ** แต่ละ `app.method(...)` ดังนี้:

---

**POST /api/login:**

```javascript
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     description: ตรวจสอบ username/password และคืนค่า JWT Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ — คืน JWT Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:       { type: integer, example: 1 }
 *                     username: { type: string,  example: admin }
 *                     role:     { type: string,  example: admin }
 *       400:
 *         description: ไม่ได้ส่ง username หรือ password
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
app.post('/api/login', (req, res) => { /* โค้ดเดิม */ });
```

---

**POST /api/bookings:**

```javascript
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: สร้างการจองใหม่
 *     description: สร้างข้อมูลการจองห้องพัก — ไม่ต้องการ Authentication
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: สร้างการจองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 */
app.post('/api/bookings', (req, res) => { /* โค้ดเดิม */ });
```

---

**GET /api/bookings:**

```javascript
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: ดึงข้อมูลการจองทั้งหมด
 *     description: ต้องการ JWT Token — กด Authorize ที่มุมบนขวาก่อนทดลองใช้
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการจองทั้งหมด เรียงจากใหม่ไปเก่า
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       403:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 */
app.get('/api/bookings', authenticateToken, (req, res) => { /* โค้ดเดิม */ });
```

---

**GET /api/bookings/:id:**

```javascript
/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: ดึงข้อมูลการจองตาม ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของการจอง
 *         example: 1
 *     responses:
 *       200:
 *         description: ข้อมูลการจอง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.get('/api/bookings/:id', authenticateToken, (req, res) => { /* โค้ดเดิม */ });
```

---

**PUT /api/bookings/:id:**

```javascript
/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลการจอง
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ คืนข้อมูลที่อัปเดตแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.put('/api/bookings/:id', authenticateToken, (req, res) => { /* โค้ดเดิม */ });
```

---

**DELETE /api/bookings/:id:**

```javascript
/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: ลบข้อมูลการจอง
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: ลบข้อมูลสำเร็จ }
 *                 id:      { type: string, example: "1" }
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.delete('/api/bookings/:id', authenticateToken, (req, res) => { /* โค้ดเดิม */ });
```

---

### 1.3 กิจกรรมที่ 2 — ทดลองใช้ Swagger UI

รัน Backend และเปิด Swagger UI:

```bash
cd backend
npm run dev
```

เปิดเบราว์เซอร์ไปที่ **http://localhost:3001/api-docs**

---

> 📌 **รูปที่ 3 — ขั้นตอนการใช้ Swagger UI ทดสอบ Protected API**

![Swagger UI](images/swagger-UI-testing.png)
---

**ทดลองตามลำดับ:**

**ขั้นที่ 1 — Login และคัดลอก Token**

1. หา **POST /api/login** → คลิก **Try it out**
2. ใส่ Request body: `{ "username": "admin", "password": "admin123" }`
3. กด **Execute** → ตรวจสอบ Response Code `200`
4. **คัดลอก token** จาก Response body

```
Response Code         : 200
Token (15 ตัวแรก)     : eyJhbGciOiJIUzI1...
```

### 📸 แทรกภาพหน้าจอ Swagger UI — POST /api/login Response ที่นี่
![Swagger UI — POST /api/login Response](<images/Swagger UI — POST.png>)
---

**ขั้นที่ 2 — ตั้งค่า Authorization**

1. กดปุ่ม **Authorize 🔒** มุมบนขวา
2. วาง token ในช่อง **Value**
3. กด **Authorize** → **Close**

---

**ขั้นที่ 3 — ทดสอบทุก Endpoint**

| Endpoint | Method | Auth | Expected Code | Actual Code |
|----------|--------|:----:|:------------:|:-----------:|
| `/api/bookings` | POST | ❌ | 201 | |
| `/api/bookings` | GET | ✅ | 200 | |
| `/api/bookings/1` | GET | ✅ | 200 หรือ 404 | |
| `/api/bookings/1` | PUT | ✅ | 200 หรือ 404 | |
| `/api/bookings/1` | DELETE | ✅ | 200 หรือ 404 | |

### 📸 แทรกภาพหน้าจอ Swagger UI — GET /api/bookings Response ที่นี่
![Swagger UI-POST /api/bookings response]('images/swagger-UI-Response.png')
![Swagger UI-POST /api/bookings response](images/:api:bookings.png)
![Swagger UI-POST /api/bookings response](images/:api:bookings..png)
![Swagger UI-POST /api/bookings response](images/:api:bookings:1.png)
![Swagger UI-POST /api/bookings response](images/:api:bookings:1..png)
![Swagger UI-POST /api/bookings response](images/api:bookings:1.png)
---

**ขั้นที่ 4 — ทดสอบกรณีไม่มี Token**

กดปุ่ม **Authorize** → **Logout** → **Close** แล้วลอง GET /api/bookings ใหม่:

```
Response Code เมื่อไม่มี Token : 401
Error message ที่ได้รับ        : ไม่ได้ส่ง Token มาด้วย
```

---

### 🔧 แบบฝึกหัดที่ 1 — ปรับแต่ง Swagger Documentation

> **เป้าหมาย:** เพื่อให้นักศึกษาเข้าใจโครงสร้าง JSDoc Comment และ OpenAPI Schema

---

**ข้อ 1.1 — เพิ่ม Schema ใหม่และใช้ `$ref`**

ใน `swaggerOptions.components.schemas` ที่อยู่ในไฟล์ server.js เพิ่ม `LoginResponse`:

```javascript
LoginResponse: {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      description: '___________'  // ← แก้ไข description เป็นการระบุว่า แก้ไข Login Response description โดยใคร
    },
    user: {
      type: 'object',
      properties: {
        id:       { type: 'integer' },
        username: { type: 'string' },
        role:     { type: 'string', enum: ['admin', 'user'] }
      }
    }
  }
}
```

อัปเดต Comment ของ POST /api/login ให้ response 200 ใช้ `$ref: '#/components/schemas/LoginResponse'` แทนการเขียนเดิม

```
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:       { type: integer, example: 1 }
 *                     username: { type: string,  example: admin }
 *                     role:     { type: string,  example: admin }
 
```
**แทนด้วย**
```
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
```

📸 แทรกภาพหน้าจอ Swagger UI ที่แสดง Schema `LoginResponse` ใน Models section:
![Swagger UI-POST LoginResponse](images/LoginResponse.png)
> ___

---

**ข้อ 1.2 — เพิ่ม Health Check Endpoint**

เพิ่มใน `server.js`:

```javascript
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: ตรวจสอบสถานะของ Server
 *     description: ใช้สำหรับ Health Check — ไม่ต้องการ Authentication
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server ทำงานปกติ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string,  example: ok }
 *                 uptime:  { type: number,  example: 120.5 }
 *                 time:    { type: string,  example: '2026-01-01T00:00:00.000Z' }
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),    // จำนวนวินาทีที่ server รันมา
    time:   new Date().toISOString()
  });
});
```

📸 แทรกภาพหน้าจอ Swagger UI ที่แสดง /api/health endpoint และ Response จริง:
![Swagger UI-health check](<images/เพิ่ม Health Check Endpoint.png>)
> ___

---

**ข้อ 1.3 — ทดสอบ Token หมดอายุผ่าน Swagger UI**

แก้ `expiresIn` ชั่วคราวใน `server.js`:

```javascript
// แก้ชั่วคราว — token หมดอายุใน 5 วินาที
{ expiresIn: '1h' }
```

Login ใน Swagger UI → Authorize → รอ 6 วินาที → ลอง GET /api/bookings:

```
Response Code หลัง token หมดอายุ : 401
Error message                    : Token หมดอายุหรือไม่ถูกต้อง
ข้อแตกต่างระหว่าง 401 กับ 403   : 
401 Unauthorized
ผู้ใช้ยังไม่ได้ยืนยันตัวตน หรือ Token ไม่ถูกต้อง/หมดอายุ
403 Forbidden
ผู้ใช้ยืนยันตัวตนแล้ว แต่ไม่มีสิทธิ์เข้าถึง resource
```

> แก้กลับเป็น `'1h'` ก่อนทำส่วนที่ 2

---

---

## ส่วนที่ 2 — API Automation ด้วย Newman

---

### 🔷 ทฤษฎีที่เกี่ยวข้อง

#### 2.A สถาปัตยกรรมการทำงานของ Newman

---

> 📌 **รูปที่ 4 — สถาปัตยกรรมการทำงานของ Newman CLI**
>

![newman Architecture](images/newman-architecture.png)

---

**Newman vs การรัน Postman ด้วยมือ:**

```
การทดสอบด้วยมือ (Postman GUI):
  นักทดสอบ → เปิด Postman → คลิก Send → อ่านผล → คลิก Send อีก → ...
  ใช้เวลา: ~10 นาที / 7 requests
  ปัญหา: เบื่อ, ลืมลำดับ, ผลไม่ consistent ระหว่างคนทดสอบ

Newman (Automated):
  Terminal: npx newman run ... → รัน 7 requests → ตรวจ assertions → สรุปผล
  ใช้เวลา: ~3–5 วินาที / 7 requests
  ผลลัพธ์: เหมือนกันทุกครั้ง, บันทึกเป็น Report ได้, รันใน CI/CD ได้
```

---

#### 2.B Chai Assertion Library

Newman ใช้ **Chai.js** ในการเขียน assertions ใน `pm.test()`:

```javascript
// รูปแบบ BDD ที่อ่านเข้าใจง่ายเหมือนภาษาอังกฤษ
pm.expect(value).to.equal(expected);           // เท่ากับ
pm.expect(value).to.be.a('string');            // เป็น type นี้
pm.expect(value).to.have.property('key');      // มี property นี้
pm.expect(value).to.include.all.keys(...);     // มี keys เหล่านี้ครบ (มีเพิ่มได้)
pm.expect(value).to.have.all.keys(...);        // มี keys เหล่านี้ครบ (ห้ามเกิน)
pm.expect(array).to.be.an('array');            // เป็น array
pm.expect(number).to.be.above(0);             // มากกว่า 0
pm.expect(number).to.be.below(2000);          // น้อยกว่า 2000
pm.expect(string).to.not.be.empty;            // ไม่ว่าง
pm.expect(object).to.not.have.property('x');  // ไม่มี property นี้
```

#### 2.C ลำดับการส่งต่อข้อมูลระหว่าง Requests

```
Newman เริ่มรัน Collection
         │
         ▼
Request 1: POST /api/login
  → pm.environment.set('token', d.token)     ← บันทึก token
         │
         ▼
Request 2: POST /api/bookings
  → pm.environment.set('bookingId', d.id)    ← บันทึก id ที่สร้าง
         │
         ▼
Request 3: GET  /api/bookings          ← ใช้ {{token}}
Request 4: GET  /api/bookings          ← ไม่มี token (Negative Test)
Request 5: GET  /api/bookings/{{bookingId}}   ← ใช้ทั้งสองตัวแปร
Request 6: PUT  /api/bookings/{{bookingId}}
Request 7: DELETE /api/bookings/{{bookingId}}
  → pm.environment.unset('bookingId')        ← ล้างค่าหลัง Delete
         │
         ▼
สรุปผล: X passed, Y failed, Z ms
```

---

### 2.1 การติดตั้ง Newman

```bash
# ติดตั้ง newman และ newman-reporter-htmlextra แบบ local
# --save-dev = เก็บใน devDependencies (ใช้เฉพาะตอน develop/test)
npm install --save-dev newman newman-reporter-htmlextra

# ตรวจสอบการติดตั้ง (npx ค้นหาใน ./node_modules/.bin/ ก่อน PATH)
npx newman --version
```

> ⚠️ **อย่าใช้ `npm install -g`** — จะเกิด Error `EACCES: permission denied` บน macOS/Linux
> การใช้ `--save-dev` + `npx` ไม่ต้องการสิทธิ์พิเศษและล็อกเวอร์ชันไว้ใน `package.json`

---

### 2.2 กิจกรรมที่ 3 — สร้างไฟล์ Collection ด้วย Node.js Script

> 💡 ใช้ Node.js script แทน `cat` heredoc เพื่อให้ทำงานได้บน **Windows, macOS, Linux** ทุก OS

**สร้างไฟล์ `create-newman-files.js`** ในโฟลเดอร์ root ของโปรเจกต์:

```javascript
// create-newman-files.js
// รันด้วย: node create-newman-files.js
// ใช้ได้บน Windows, macOS, Linux ทุกเครื่องที่มี Node.js

const fs   = require('fs');
const path = require('path');

// สร้างโฟลเดอร์ newman และ reports ถ้ายังไม่มี
fs.mkdirSync('newman',  { recursive: true });
fs.mkdirSync('reports', { recursive: true });

// ─────────────────────────────────────────────────────────────
// 1. Environment — เก็บค่าตัวแปรที่ใช้ร่วมกันทุก Request
// ─────────────────────────────────────────────────────────────
const env = {
  id: 'hotel-booking-local-env',
  name: 'Hotel Booking - Local',
  values: [
    { key: 'baseUrl',   value: 'http://localhost:3001', type: 'default', enabled: true },
    { key: 'token',     value: '',                      type: 'default', enabled: true },
    { key: 'bookingId', value: '',                      type: 'default', enabled: true }
  ],
  _postman_variable_scope: 'environment'
};

// ─────────────────────────────────────────────────────────────
// 2. Collection — 7 Requests พร้อม pm.test() ครบชุด
// ─────────────────────────────────────────────────────────────
const collection = {
  info: {
    name: 'Hotel Booking API Tests',
    description: 'Automated API Tests สำหรับ Hotel Booking System — Lab02A',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [

    // ── Request 1: POST /api/login ───────────────────────────
    {
      name: '1. POST /api/login',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has token and user info", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("token");',
        '  pm.expect(d.token).to.be.a("string").and.not.empty;',
        '  pm.expect(d.user).to.have.property("role", "admin");',
        '  pm.expect(d.user).to.not.have.property("password");',
        '  pm.environment.set("token", d.token);',    // บันทึก token → ใช้ใน Request 3–7
        '});',
        'pm.test("Response time is less than 2000ms", function() {',
        '  pm.expect(pm.response.responseTime).to.be.below(2000);',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'admin123' }) },
        url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api', 'login'] }
      }
    },

    // ── Request 2: POST /api/bookings ────────────────────────
    {
      name: '2. POST /api/bookings',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 201 Created", function() {',
        '  pm.response.to.have.status(201);',
        '});',
        'pm.test("Has id and status defaults to pending", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("id");',
        '  pm.expect(d.id).to.be.a("number").and.above(0);',
        '  pm.expect(d.status).to.equal("pending");',
        '  pm.environment.set("bookingId", d.id);',  // บันทึก bookingId → ใช้ใน Request 5–7
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            fullname: 'นักศึกษา ทดสอบ Newman', email: 'newman@test.com',
            phone: '0812345678', checkin: '2026-12-01', checkout: '2026-12-03',
            roomtype: 'standard', guests: 2
          })
        },
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api', 'bookings'] }
      }
    },

    // ── Request 3: GET /api/bookings (with token) ────────────
    {
      name: '3. GET /api/bookings (with token)',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response is an array", function() {',
        '  pm.expect(pm.response.json()).to.be.an("array");',
        '});',
        'pm.test("Each booking has all required fields", function() {',
        '  const arr = pm.response.json();',
        '  if (arr.length > 0) {',
        '    pm.expect(arr[0]).to.include.all.keys(',  // include ≠ have — มีเพิ่มได้
        '      "id", "fullname", "email", "phone",',
        '      "checkin", "checkout", "roomtype",',
        '      "guests", "status", "created_at"',
        '    );',
        '  }',
        '});'
      ]}}],
      request: {
        method: 'GET',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api', 'bookings'] }
      }
    },

    // ── Request 4: GET /api/bookings (NO token — Negative) ───
    {
      name: '4. GET /api/bookings (NO token - Negative)',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Returns 401 without token", function() {',
        '  pm.response.to.have.status(401);',
        '});',
        'pm.test("Has error message about login", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("error");',
        '  pm.expect(d.error).to.include("เข้าสู่ระบบ");',
        '  pm.expect(d).to.not.have.property("id");',  // ไม่รั่ว booking data
        '});'
      ]}}],
      request: {
        method: 'GET', header: [],
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api', 'bookings'] }
      }
    },

    // ── Request 5: GET /api/bookings/:id ─────────────────────
    {
      name: '5. GET /api/bookings/:id',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Returned id matches requested id", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.id).to.equal(parseInt(pm.environment.get("bookingId")));',
        '  pm.expect(d.email).to.be.a("string").and.not.empty;',
        '});'
      ]}}],
      request: {
        method: 'GET',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}']
        }
      }
    },

    // ── Request 6: PUT /api/bookings/:id ─────────────────────
    {
      name: '6. PUT /api/bookings/:id',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Updated fields are saved correctly", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.comment).to.equal("Updated by Newman test");',
        '  pm.expect(d.roomtype).to.equal("deluxe");',
        '  pm.expect(d).to.have.property("id");',
        '});'
      ]}}],
      request: {
        method: 'PUT',
        header: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type',  value: 'application/json' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            fullname: 'นักศึกษา ทดสอบ Newman (Updated)', email: 'newman-updated@test.com',
            phone: '0898765432', checkin: '2026-12-01', checkout: '2026-12-05',
            roomtype: 'deluxe', guests: 3, comment: 'Updated by Newman test'
          })
        },
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}']
        }
      }
    },

    // ── Request 7: DELETE /api/bookings/:id ──────────────────
    {
      name: '7. DELETE /api/bookings/:id',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has message and deleted id", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("message");',
        '  pm.expect(d.id.toString()).to.equal(pm.environment.get("bookingId").toString());',
        '  pm.environment.unset("bookingId");',  // ล้าง bookingId หลัง Delete สำเร็จ
        '});'
      ]}}],
      request: {
        method: 'DELETE',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: {
          raw: '{{baseUrl}}/api/bookings/{{bookingId}}',
          host: ['{{baseUrl}}'], path: ['api', 'bookings', '{{bookingId}}']
        }
      }
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// 3. เขียนไฟล์ทั้งสอง
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join('newman', 'hotel-booking-env.json'),
  JSON.stringify(env, null, 2),    // null, 2 = indent 2 spaces ทำให้อ่านง่าย
  'utf8'
);
console.log('✅ สร้าง newman/hotel-booking-env.json เรียบร้อย');

fs.writeFileSync(
  path.join('newman', 'hotel-booking-collection.json'),
  JSON.stringify(collection, null, 2),
  'utf8'
);
console.log('✅ สร้าง newman/hotel-booking-collection.json เรียบร้อย');
```

**รัน script เพื่อสร้างไฟล์:**

```bash
node create-newman-files.js
```

ผลลัพธ์ที่ควรเห็น:

```
✅ สร้าง newman/hotel-booking-env.json เรียบร้อย
✅ สร้าง newman/hotel-booking-collection.json เรียบร้อย
```

**ตรวจสอบไฟล์ที่สร้าง:**

```bash
ls newman/
# hotel-booking-collection.json
# hotel-booking-env.json
```

> **Environment Variables ที่ใช้:**
>
> | Variable | ค่าเริ่มต้น | คำอธิบาย |
> |----------|------------|---------|
> | `baseUrl` | `http://localhost:3001` | URL ของ Backend |
> | `token` | _(ว่าง)_ | JWT Token — Request 1 จะ set ให้อัตโนมัติ |
> | `bookingId` | _(ว่าง)_ | ID การจอง — Request 2 จะ set ให้อัตโนมัติ |

---

### 2.3 กิจกรรมที่ 4 — ทำความเข้าใจ Test Scripts

**หลักการสำคัญที่ต้องเข้าใจก่อนรัน:**

```javascript
// ── include.all.keys vs have.all.keys ─────────────────────────
// include: ตรวจว่ามี keys เหล่านี้ครบ แต่มี keys เพิ่มได้ (เช่น comment)
pm.expect(obj).to.include.all.keys("id", "fullname", "email");  // ✅ แม้ obj มี comment ด้วย

// have: ตรวจว่ามี keys เหล่านี้เท่านั้น ห้ามมีเกิน
pm.expect(obj).to.have.all.keys("id", "fullname");  // ❌ Fail ถ้า obj มี email ด้วย

// ── parseInt เมื่อเปรียบเทียบ id ──────────────────────────────
// environment.get() คืน string เสมอ แม้เก็บเป็น number
pm.expect(d.id).to.equal(parseInt(pm.environment.get("bookingId")));
//               ↑ d.id เป็น number    ↑ ต้องแปลงก่อน ไม่งั้น "1" !== 1

// ── ทำไมต้อง unset ──────────────────────────────────────────
pm.environment.unset("bookingId");
// ถ้าไม่ล้าง แล้วรัน Collection รอบที่ 2:
// Request 5 จะหา booking id เก่าที่ถูกลบไปแล้ว → 404 → Test Fail
```

**นักศึกษาเขียน Test เพิ่มเติม (ต้องกรอกก่อนรัน Newman):**

```javascript
// เพิ่มใน Request 5 (GET /api/bookings/:id) ใน create-newman-files.js
pm.test("____________________________", function() {
  const d = pm.response.json();
  pm.expect(d.fullname).____________________________; // ตรวจสอบ fullname ไม่ว่าง
});

// เพิ่มใน Request 6 (PUT /api/bookings/:id) ใน create-newman-files.js
pm.test("____________________________", function() {
  const d = pm.response.json();
  pm.expect(d.guests).____________________________; // ตรวจสอบ guests = 3
});
```

---

### 2.4 กิจกรรมที่ 5 — รัน Collection ด้วย Newman

```bash
# ────────────────────────────────────────────────────────────
# Newman flags:
#   -e    = ไฟล์ Environment
#   -r    = Reporter ที่ต้องการ (cli, htmlextra, junit)
#   --reporter-htmlextra-export = path ของ HTML Report
# ────────────────────────────────────────────────────────────

# รันพื้นฐาน
npx newman run newman/hotel-booking-collection.json \
  -e newman/hotel-booking-env.json

# รันพร้อม HTML Report
npx newman run newman/hotel-booking-collection.json \
  -e newman/hotel-booking-env.json \
  -r cli,htmlextra \
  --reporter-htmlextra-export ./reports/api-test-report.html \
  --reporter-htmlextra-title "Hotel Booking API Test Report"
```

**บันทึกผลการรัน Newman:**

```
Collection Name    : Hotel Booking API Tests
Total Requests     : 6
Total Assertions   : 11
Passed             : 11
Failed             : 0
Duration           : 239 ms
Average Resp. Time :11 ms
```

![หน้าจอ Newman Terminal Output]('images/Newman Terminal.png')
### 📸 แทรกภาพหน้าจอ newman-reporter-htmlextra Report (ไฟล์ api-test-report.html)  ที่นี่

![หน้าจอ Newman Report](<images/Newman Report.png>)
---

### 🔧 แบบฝึกหัดที่ 2 — แก้ไขและทดลอง Newman Collection

> **เป้าหมาย:** เพื่อให้นักศึกษาเข้าใจโครงสร้าง Collection 

---

**ข้อ 2.1 — แก้ไขข้อมูลให้เป็นของตัวเอง**

เปิดไฟล์ `create-newman-files.js` แก้ไขข้อมูลใน Request 2 (POST /api/bookings) ให้ใช้ข้อมูลของนักศึกษาเอง:


```javascript
raw: JSON.stringify({
  fullname: 'ชื่อ-นามสกุลนักศึกษา',           // ← แก้ตรงนี้
  email:    'รหัสนักศึกษา@university.ac.th',  // ← แก้ตรงนี้
  phone:    '0812345678',
  checkin:  '2026-12-01', 
  checkout: '2026-12-03',
  roomtype: 'standard',   
  guests: 2
})
```

**รัน script ใหม่เพื่อสร้างไฟล์ที่อัปเดตแล้ว จากนั้นรัน Newman:**

```bash
node create-newman-files.js
npx newman run newman/hotel-booking-collection.json -e newman/hotel-booking-env.json

npx newman run newman/hotel-booking-collection.json \
  -e newman/hotel-booking-env.json \
  -r cli,htmlextra \
  --reporter-htmlextra-export ./reports/api-test-report.html \
  --reporter-htmlextra-title "Hotel Booking API Test Report"
```

📸 ตรวจสอบหน้า Report แทรกภาพหน้าจอที่เห็นชื่อนักศึกษา:

![หน้าจอ Newman Report ที่แก้ไขข้อมูลแล้ว](<images/Newman report-edit.png>)
> ___

---

**ข้อ 2.2 — ทดสอบ Error Handling**

แก้ `hotel-booking-env.json` เปลี่ยน `baseUrl` เป็น port ที่ไม่มีอยู่

แล้วรันตามขั้นตอนการสร้างไฟล์ create-newman-files.js และทดสอบ newman

```json
"value": "http://localhost:9999"
```

```bash
npx newman run newman/hotel-booking-collection.json -e newman/hotel-booking-env.json
```



บันทึกผล:
📸 หน้าจอผล Error:

![หน้าจอ Newman Error](<images/Newman Error1.png>)
![หน้าจอ Newman Error](<images/Newman Error2.png>)
![หน้าจอ Newman Error](<images/Newman Error3.png>)
![หน้าจอ Newman Error](<images/Newman Error4.png>)

> 💡 **จุดประสงค์:** Environment Variable `baseUrl` ส่งผลต่อทุก Request — นี่คือเหตุผลที่ต้องใช้ตัวแปรแทนการพิมพ์ URL ซ้ำ

แก้ `baseUrl` กลับเป็นค่าเดิม และสร้างไฟล์ create-newman-files.js ใหม่ ก่อนทำการทดลองในข้อถัดไป


---

**ข้อ 2.3 — เพิ่ม Assertion และนับผล**

ใน `create-newman-files.js` เพิ่ม test ใน Request 1:

```javascript
'pm.test("user.id is a positive number", function() {',
'  const d = pm.response.json();',
'  pm.expect(d.user.id).to.be.a("number").and.above(0);',
'});'
```

```bash
node create-newman-files.js
npx newman run newman/hotel-booking-collection.json -e newman/hotel-booking-env.json
```

```
Assertions ก่อนเพิ่ม : 11
Assertions หลังเพิ่ม : 12
```

---

**ข้อ 2.4 — ออกแบบ Negative Test เพิ่มเอง**

เพิ่ม Request ที่ 8 ใน `item` array ใน `create-newman-files.js`

เพิ่ม Request ใหม่ใน Collection ชื่อ `"8. POST /api/login — Wrong Password"` โดยส่ง password ผิด แล้วเขียน test ตรวจสอบว่าต้องได้ 401


```javascript
{
  name: '8. POST /api/login — Wrong Password',
  event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
    // เขียน pm.test() ตรวจสอบ Status 401 และ error message ที่นี่
    '____________________________',
    '____________________________',
  ]}}],
  request: {
    method: 'POST',
    header: [{ key: 'Content-Type', value: 'application/json' }],
    body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'wrongpassword' }) },
    url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api', 'login'] }
  }
}
```

📸 แทรกภาพหน้าจอ Newman ที่แสดง Request 8 ผ่าน (Pass):

![ภาพหน้าจอ Newman Request 8 ผ่าน](<images/Request 8 ผ่าน.png>)
> ___

---

---

## แบบทดสอบ
1. สร้าง API เพิ่มเติม เพื่อรองรับการ CheckIn โดยมีการระบุ ID ของการจอง เพื่อใช้ CheckIn และใช้การจำลองข้อมูล JSON (ทำ Mockup) เพื่อส่ง Response ผลการ CheckIn กลับไป (นักศึกษาออกแบบ API ของตนเอง และให้เพิ่ม Comment ใน Code ให้ใส่ชื่อ และรหัสนักศึกษาเพื่อระบุว่าแก้ไขโดยใคร)
   ```
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
  
   ```
  
   
2. สร้าง API เพิ่มเติม เพื่อรองรับการ CheckOut โดยมีการระบ ID ของการ CheckIn เพื่อใช้ทำการ CheckOut และใช้การจำลองข้อมูล JSON (ทำ Mockup) เพื่อส่งรายละเอียดของการ CheckOut กลับไป (นักศึกษาออกแบบ API และ JSON ของตนเอง และให้เพิ่ม Comment ใน Code ให้ใส่ชื่อ และรหัสนักศึกษาเพื่อระบุว่าแก้ไขโดยใคร)
   ```
   // ===============================
// CHECK-OUT
// ===============================
/**
 * @swagger
 * /api/checkins/{id}/checkout:
 * post:
 * summary: ทำรายการ Check-out โดยระบุ ID ของการ Check-in
 * tags: [CheckInOut]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: รหัสการ Check-in
 * responses:
 * 200:
 * description: คืนค่ารายละเอียดการ Check-out กลับไป (Mockup JSON)
 */
// แก้ไขโดย: ญาดา แกล้วกล้า, รหัสนักศึกษา: 68030069
app.post('/api/checkins/:id/checkout', authenticateToken, (req, res) => {
  const checkInId = req.params.id;
  
  // จำลองข้อมูล JSON (Mockup) สำหรับรายละเอียดการ CheckOut ตามที่โจทย์กำหนด
  const responseData = {
    message: "Check-out process initiated successfully",
    checkOutId: `CO-${checkInId}`,
    checkInId: checkInId,
    checkOutTime: new Date().toISOString(), // ดึงเวลาปัจจุบัน
    additionalCharges: 500, // สมมติว่ามีค่าใช้จ่ายเพิ่มเติมเช่น ค่ามินิบาร์
    status: "Pending-Confirmation" // รอการยืนยัน
  };

  res.status(200).json(responseData);
});
   ```
   
3. สร้าง API เพิ่มเติม เพื่อรองรับการ ConfirmCheckOut (เพิ่ม Comment ใน Code ให้ใส่ชื่อ และรหัสนักศึกษาเพื่อระบุว่าแก้ไขโดยใคร)

   ```
   // ===============================
// CONFIRM CHECK-OUT
// ===============================
/**
 * @swagger
 * /api/checkouts/{id}/confirm:
 * post:
 * summary: ยืนยันการทำรายการ Check-out
 * tags: [CheckInOut]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * description: รหัสการ Check-out
 * responses:
 * 200:
 * description: ยืนยันการ Check-out สำเร็จ
 */
// แก้ไขโดย: ญาดา แกล้วกล้า, รหัสนักศึกษา: 68030069
app.post('/api/checkouts/:id/confirm', authenticateToken, (req, res) => {
  const checkOutId = req.params.id;
  
  // จำลองข้อมูล JSON (Mockup) เพื่อส่งผลการยืนยันกลับไป
  const responseData = {
    message: "Check-out confirmed successfully",
    checkOutId: checkOutId,
    confirmTime: new Date().toISOString(),
    status: "Completed",
    paymentStatus: "Paid",
    thankYouMessage: "Thank you for staying with us!"
  };

  res.status(200).json(responseData);
});
   ```
      
4. แก้ไข Swagger และ Newman เพื่อทดสอบการทำงาน
   ```
   บันทึกรูปผลการทำงานของ Swagger
   ```
   
   ```
   บันทึกรูปผลการทำงานของ newman
   ```
   

## คำถามท้ายการทดลอง

**ข้อ 1.** Swagger UI และ Newman ต่างกันอย่างไรในการทดสอบ API ควรใช้เครื่องมือใดในสถานการณ์ใด?

```
คำตอบ:
Swagger UI เป็นเครื่องมือสำหรับแสดงเอกสาร API และสามารถทดสอบ API ได้แบบ Interactive ผ่านหน้าเว็บ เหมาะสำหรับการทดลองเรียก API ทีละ endpoint และใช้ในการอธิบายโครงสร้าง API ให้ผู้พัฒนาเข้าใจ
ส่วน Newman เป็นเครื่องมือสำหรับรันชุดทดสอบ (Collection) ของ Postman แบบอัตโนมัติผ่าน Command Line เหมาะสำหรับการทดสอบซ้ำ ๆ และใช้ในระบบ CI/CD

```

**ข้อ 2.** `$ref: '#/components/schemas/Booking'` ใน JSDoc Comment หมายความว่าอะไร มีประโยชน์อย่างไรเมื่อเทียบกับการเขียน schema inline?

```
คำตอบ:
$ref: '#/components/schemas/Booking' หมายถึงการอ้างอิง schema ที่ชื่อว่า Booking ซึ่งถูกกำหนดไว้ในส่วน components/schemas ของ Swagger
ข้อดีคือช่วยลดการเขียน schema ซ้ำ ทำให้โค้ดเป็นระเบียบ แก้ไขง่าย และสามารถนำ schema เดิมไปใช้ซ้ำได้หลายที่ ต่างจากการเขียน inline ที่ต้องเขียนใหม่ทุกครั้งและอาจเกิดความผิดพลาดได้

```


**ข้อ 3.** ถ้าต้องการให้ Newman รัน Collection ซ้ำ 5 รอบ จะเพิ่ม flag อะไรในคำสั่ง และผลลัพธ์ที่ควรระวังคืออะไร?

```
คำตอบ: flag ที่ใช้คือ --iteration-count 5
ผลที่ควรระวัง: อาจเกิดข้อมูลซ้ำ (duplicate data) หรือข้อมูลผิดพลาดในฐานข้อมูล เช่น มีการเพิ่มข้อมูลเดิมหลายครั้ง หรือ state ของระบบเปลี่ยนไป ทำให้ผลลัพธ์แต่ละรอบไม่เหมือนกัน

```

**ข้อ 4.** จากการทดลองในใบงานนี้ นักศึกษามองว่าควรเขียน Swagger Documentation ก่อนหรือหลัง Code API และ Newman ควรรันเมื่อไหร่ในกระบวนการพัฒนา?

```
คำตอบ:
ควรเขียน Swagger Documentation ก่อนหรือควบคู่กับการเขียน Code API เพื่อวางโครงสร้างและกำหนดรูปแบบ API ให้ชัดเจนตั้งแต่ต้น
ส่วน Newman ควรรันหลังจากพัฒนา API เสร็จในแต่ละส่วน หรือหลังมีการแก้ไขโค้ด เพื่อทดสอบความถูกต้อง และควรนำไปใช้ในขั้นตอน CI/CD เพื่อทดสอบอัตโนมัติทุกครั้งก่อน deploy

```

---




