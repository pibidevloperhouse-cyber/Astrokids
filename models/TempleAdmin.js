import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const TempleAdminSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true, collection: 'temples-admin' }
);

TempleAdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

TempleAdminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const TempleAdmin = mongoose.models.TempleAdmin || mongoose.model('TempleAdmin', TempleAdminSchema);
export default TempleAdmin;