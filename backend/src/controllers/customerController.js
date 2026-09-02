import Customer from "../models/Customer.js";

export async function getCustomers(req, res) {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json({ success: true, data: customers });
}

export async function getCustomer(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  res.json({ success: true, data: customer });
}
