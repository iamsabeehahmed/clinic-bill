import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  createdAt: Date;
}

const PatientSchema = new Schema<IPatient>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
