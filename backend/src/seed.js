import "dotenv/config";

import "./config/dns.js";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Customer from "./models/Customer.js";
import Mechanic from "./models/Mechanic.js";
import Booking from "./models/Booking.js";

const names = ["Gaurav Rawat","Rahul Sharma","Aman Verma","Priya Singh","Neha Kapoor","Rohit Kumar","Ankit Joshi","Simran Kaur","Vikas Yadav","Karan Mehta"];
const brands = ["Hyundai","Maruti","Tata","Honda","Toyota","Mahindra","Kia","Volkswagen"];
const models = ["Creta","Swift","Nexon","City","Fortuner","Thar","Seltos","Polo"];
const categories = [
  ["Periodic Service","Maintenance"],
  ["Oil Change","Maintenance"],
  ["Brake Service","Brakes"],
  ["AC Service","AC & Cooling"],
  ["Battery Replacement","Electrical"],
  ["Tyre Service","Tyres"],
  ["Engine Diagnostics","Diagnostics"]
];
const statuses = ["PENDING","ASSIGNED","MECHANIC_ON_THE_WAY","IN_PROGRESS","COMPLETED","CANCELLED"];
const mechanicStatuses = ["AVAILABLE","BUSY","OFFLINE","ON_THE_WAY"];

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function phone(i) { return `98${String(10000000 + i).slice(-8)}`; }

await connectDB();
await Promise.all([User.deleteMany({}), Customer.deleteMany({}), Mechanic.deleteMany({}), Booking.deleteMany({})]);

const password = await bcrypt.hash("Admin@12345", 10);
await User.create({ name: "Operations Admin", email: "admin@instantmechanic.com", password, role: "ADMIN" });

const customers = [];
for (let i = 1; i <= 60; i++) {
  const name = `${pick(names)} ${i}`;
  customers.push({
    name,
    email: `customer${i}@example.com`,
    phone: phone(i),
    address: `${i} Service Road, Gurugram`
  });
}
const customerDocs = await Customer.insertMany(customers);

const mechanics = [];
for (let i = 1; i <= 25; i++) {
  mechanics.push({
    name: `${pick(names)} Mechanic ${i}`,
    phone: `97${String(10000000 + i).slice(-8)}`,
    email: `mechanic${i}@instantmechanic.com`,
    specialization: pick(["Engine","Electrical","Brakes","AC","General Service"]),
    status: pick(mechanicStatuses),
    jobsCompleted: Math.floor(Math.random() * 250),
    location: { lat: 28.40 + Math.random() * 0.15, lng: 76.95 + Math.random() * 0.18 }
  });
}
const mechanicDocs = await Mechanic.insertMany(mechanics);

const bookings = [];
for (let i = 1; i <= 600; i++) {
  const service = pick(categories);
  const scheduledAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000 + Math.floor(Math.random() * 86400000));
  const status = pick(statuses);
  const mechanic = status === "PENDING" || status === "CANCELLED" ? null : pick(mechanicDocs);
  bookings.push({
    bookingId: `BK-${String(10000 + i)}`,
    customer: pick(customerDocs)._id,
    mechanic: mechanic?._id || null,
    vehicle: {
      registrationNumber: `HR ${Math.floor(10 + Math.random()*90)} ${String.fromCharCode(65 + Math.floor(Math.random()*26))}${String.fromCharCode(65 + Math.floor(Math.random()*26))} ${String(1000 + i).slice(-4)}`,
      brand: pick(brands),
      model: pick(models),
      year: 2016 + Math.floor(Math.random() * 10)
    },
    service: { name: service[0], category: service[1] },
    status,
    amount: 799 + Math.floor(Math.random() * 9000),
    scheduledAt
  });
}
await Booking.insertMany(bookings);

console.log("Seed complete: 1 admin, 60 customers, 25 mechanics, 600 bookings");
console.log("Login: admin@instantmechanic.com / Admin@12345");
await mongoose.disconnect();
