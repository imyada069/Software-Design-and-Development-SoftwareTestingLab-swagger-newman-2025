// create-newman-files.js
// Run: node create-newman-files.js

const fs = require("fs");
const path = require("path");

// สร้างโฟลเดอร์
fs.mkdirSync("newman", { recursive: true });
fs.mkdirSync("reports", { recursive: true });

// ───────── ENV ─────────
const env = {
  id: "hotel-env",
  name: "Hotel Booking Local",
  values: [
    { key: "baseUrl", value: "http://127.0.0.1:3001", enabled: true }, // ✅ แก้ localhost
    { key: "token", value: "", enabled: true },
    { key: "bookingId", value: "", enabled: true }
  ]
};

// ───────── COLLECTION ─────────
const collection = {
  info: {
    name: "Hotel Booking API Tests",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },

  item: [

    // 1 LOGIN
    {
      name: "1. POST Login",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200',()=>pm.response.to.have.status(200));",
            "let d=pm.response.json();",
            "pm.environment.set('token',d.token);",
            "pm.test('Token exists',()=>pm.expect(d.token).to.be.a('string').and.not.empty);",
            'pm.test("user.id is a positive number", function() {',
            '  const d = pm.response.json();',
            '  pm.expect(d.user.id).to.be.a("number").and.above(0);',
            '});'
          ]
        }
      }],
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            username: "admin",
            password: "admin123"
          })
        },
        url: {
          raw: "{{baseUrl}}/api/login",
          host: ["{{baseUrl}}"],
          path: ["api","login"]
        }
      }
    },

    // 2 CREATE BOOKING (แก้เป็นข้อมูลคุณ)
    {
      name: "2. POST Booking",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 201',()=>pm.response.to.have.status(201));",
            "let d=pm.response.json();",
            "pm.environment.set('bookingId',d.id);",
            "pm.test('Booking created',()=>pm.expect(d).to.have.property('id'));"
          ]
        }
      }],
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            fullname: "Yada Klawekla",              // ✅ ใส่ชื่อคุณ
            email: "650xxxxx@university.ac.th",     // ✅ ใส่รหัส
            phone: "0812345678",
            checkin: "2026-12-01",
            checkout: "2026-12-03",
            roomtype: "standard",
            guests: 2
          })
        },
        url: {
          raw: "{{baseUrl}}/api/bookings",
          host: ["{{baseUrl}}"],
          path: ["api","bookings"]
        }
      }
    },

    // 3 GET ALL
    {
      name: "3. GET Bookings",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200',()=>pm.response.to.have.status(200));",
            "pm.test('Array response',()=>pm.expect(pm.response.json()).to.be.an('array'));"
          ]
        }
      }],
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: {
          raw: "{{baseUrl}}/api/bookings",
          host: ["{{baseUrl}}"],
          path: ["api","bookings"]
        }
      }
    },

    // 4 GET BY ID
    {
      name: "4. GET Booking By ID",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200',()=>pm.response.to.have.status(200));",
            "let d=pm.response.json();",
            "pm.test('Correct id',()=>pm.expect(d.id).to.eql(parseInt(pm.environment.get('bookingId'))));"
          ]
        }
      }],
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: {
          raw: "{{baseUrl}}/api/bookings/{{bookingId}}",
          host: ["{{baseUrl}}"],
          path: ["api","bookings","{{bookingId}}"]
        }
      }
    },

    // 5 UPDATE
    {
      name: "5. PUT Booking",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200',()=>pm.response.to.have.status(200));",
            "let d=pm.response.json();",
            "pm.test('Guests updated',()=>pm.expect(d.guests).to.eql(3));" 
          ]
        }
      }],
      request: {
        method: "PUT",
        header: [
          { key: "Authorization", value: "Bearer {{token}}" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            fullname: "Updated Yada",
            email: "update@test.com",
            phone: "0899999999",
            checkin: "2026-12-01",
            checkout: "2026-12-05",
            roomtype: "deluxe",
            guests: 3
          })
        },
        url: {
          raw: "{{baseUrl}}/api/bookings/{{bookingId}}",
          host: ["{{baseUrl}}"],
          path: ["api","bookings","{{bookingId}}"]
        }
      }
    },

    // 6 DELETE
    {
      name: "6. DELETE Booking",
      event: [{
        listen: "test",
        script: {
          exec: [
            "pm.test('Status 200',()=>pm.response.to.have.status(200));",
            "pm.environment.unset('bookingId');" 
          ]
        }
      }],
      request: {
        method: "DELETE",
        header: [{ key: "Authorization", value: "Bearer {{token}}" }],
        url: {
          raw: "{{baseUrl}}/api/bookings/{{bookingId}}",
          host: ["{{baseUrl}}"],
          path: ["api","bookings","{{bookingId}}"]
        }
      }
    },

    // 8 NEGATIVE TEST: WRONG PASSWORD (แก้ error เป็น message แล้ว!)
    {
      name: '8. POST /api/login — Wrong Password',
      event: [{ 
        listen: 'test', 
        script: { 
          type: 'text/javascript', 
          exec: [
            "pm.test('Status 401 Unauthorized', function () { pm.response.to.have.status(401); });",
            "pm.test('Has error message', function () { var jsonData = pm.response.json(); pm.expect(jsonData).to.have.property('message'); });"
          ]
        }
      }],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'wrongpassword' }) },
        url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api', 'login'] }
      }
    }

  ]
};

// ───────── WRITE FILE ─────────
fs.writeFileSync(
  path.join("newman","hotel-booking-env.json"),
  JSON.stringify(env,null,2)
);

fs.writeFileSync(
  path.join("newman","hotel-booking-collection.json"),
  JSON.stringify(collection,null,2)
);

console.log("✅ Newman files created successfully");