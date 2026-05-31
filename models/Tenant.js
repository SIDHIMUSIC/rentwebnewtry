import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paidAt: { type: Date },
  transactionId: { type: String },
}, { timestamps: true })

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  roomNumber: { type: String, required: true, trim: true },
  rentAmount: { type: Number, required: true },
  depositAmount: { type: Number, default: 0 },
  joinDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  address: { type: String, trim: true },
  idProof: { type: String },
  payments: [PaymentSchema],
  notes: { type: String },
}, { timestamps: true })

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)
