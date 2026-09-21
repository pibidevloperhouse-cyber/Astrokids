import mongoose from 'mongoose';

const BenefitSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
  },
  { _id: false }
);

const TimeRangeSchema = new mongoose.Schema(
  {
    morningFrom: String,
    morningTo: String,
    eveningFrom: String,
    eveningTo: String,
  },
  { _id: false }
);

const TempleTimesSchema = new mongoose.Schema(
  {
    temple: {
      morningOpen: String,
      eveningClose: String,
    },
    puja: TimeRangeSchema,
    aarti: TimeRangeSchema,
  },
  { _id: false }
);

const ServicesSchema = new mongoose.Schema(
  {
    virtualDarshan: { type: Boolean, default: false },
    pujaBooking: { type: Boolean, default: false },
    vrView: { type: Boolean, default: false },
    virtualChadhavaPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const TempleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    subLocation: { type: String },
    mainDeity: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    blessingTags: [{ type: String }],
    shortDescription: String,
    longDescription: String,
    history: String,
    benefits: [BenefitSchema],
    timings: TempleTimesSchema,
    services: ServicesSchema,
    images: [{ type: String }],
    googleMapsUrl: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

const Temple = mongoose.models.Temple || mongoose.model('Temple', TempleSchema);
export default Temple;