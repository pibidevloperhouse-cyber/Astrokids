'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const CITIES = [
  'Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Salem',
  'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi',
  'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Kanchipuram',
  'Udhagamandalam (Ooty)', 'Hosur', 'Nagercoil', 'Kanyakumari',
  'Kumbakonam', 'Karur', 'Rajapalayam', 'Pudukkottai', 'Namakkal',
  'Cuddalore', 'Villupuram', 'Virudhunagar', 'Mayiladuthurai',
  'Nagapattinam', 'Ariyalur', 'Perambalur', 'Krishnagiri',
  'Dharmapuri', 'Tiruvannamalai', 'Kallakurichi', 'Chengalpattu',
  'Tenkasi', 'Tirupattur', 'Nilgiris'
]
const STATES = ['Tamil Nadu']
const BLESSING_TAGS = ['Inner Peace', 'Timely Marriage', 'Joyful Parenthood', 'Career Growth', 'Health & Wellness', 'Wealth & Prosperity', 'Education & Knowledge', 'Family Harmony', 'Protection & Safety', 'Spiritual Awakening', 'Business Success', 'Safe Travel']

export default function AddTemplePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    subLocation: '',
    mainDeity: '',
    status: 'Active',
    blessingTags: [],
    shortDescription: '',
    longDescription: '',
    history: '',
    benefits: [{ title: '', description: '' }],
    timings: {
      temple: { morningOpen: '', eveningClose: '' },
      puja: { morningFrom: '', morningTo: '', eveningFrom: '', eveningTo: '' },
      aarti: { morningFrom: '', morningTo: '', eveningFrom: '', eveningTo: '' }
    },
    services: {
      virtualDarshan: false,
      pujaBooking: false,
      vrView: false,
      virtualChadhavaPrice: ''
    },
    images: [],
    googleMapsUrl: '',
    coordinates: { lat: '', lng: '' }
  })

  // Generic field update
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  // Nested field update
  const setNested = (section, field, value) =>
    setForm(f => ({ ...f, [section]: { ...f[section], [field]: value } }))

  const setTiming = (type, field, value) =>
    setForm(f => ({
      ...f,
      timings: { ...f.timings, [type]: { ...f.timings[type], [field]: value } }
    }))

  const setService = (field, value) =>
    setForm(f => ({ ...f, services: { ...f.services, [field]: value } }))

  // Blessing tags toggle
  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      blessingTags: f.blessingTags.includes(tag)
        ? f.blessingTags.filter(t => t !== tag)
        : [...f.blessingTags, tag]
    }))
  }

  // Benefits
  const addBenefit = () =>
    setForm(f => ({ ...f, benefits: [...f.benefits, { title: '', description: '' }] }))

  const removeBenefit = (i) =>
    setForm(f => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }))

  const setBenefit = (i, field, value) =>
    setForm(f => ({
      ...f,
      benefits: f.benefits.map((b, idx) => idx === i ? { ...b, [field]: value } : b)
    }))

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    try {
      if (!supabase) throw new Error('Supabase not initialized')
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { data, error } = await supabase.storage.from('temples').upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('temples').getPublicUrl(fileName)
      if (publicUrl) {
        setForm(f => ({ ...f, images: [...f.images, publicUrl] }))
      }
    } catch (err) {
      console.error(err)
      setError('Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (i) =>
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))


  // Submit
  const handleSubmit = async () => {
    if (!form.name || !form.city || !form.state || !form.mainDeity) {
      setError('Please fill all required fields')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/temple/temples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.push('/temple-admin/temples')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Temple</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to add a new temple</p>
        </div>
        <div className="flex gap-3">
          <Link href="/temple-admin/temples"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-[#1E2A3A] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a4f] disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Temple'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <Section title="Basic Information" subtitle="Primary details about the temple">
        <div className="space-y-4">
          <div>
            <Label>Temple Name *</Label>
            <Input
              placeholder="e.g. Kashi Vishwanath Temple"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <Select value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>State *</Label>
              <Select value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select State</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <Label>Sub-location</Label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-gray-500" />
              <input
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-500"
                placeholder="e.g. Shyampur, Haridwar"
                value={form.subLocation}
                onChange={e => set('subLocation', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Main Deity *</Label>
              <Input
                placeholder="e.g. Lord Shiva"
                value={form.mainDeity}
                onChange={e => set('mainDeity', e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Blessing Tags */}
      <Section title="Blessing Tags" subtitle="Select all applicable blessings this temple is known for">
        <div className="flex flex-wrap gap-2">
          {BLESSING_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${form.blessingTags.includes(tag)
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Section>

      {/* 3. Descriptions */}
      <Section title="Descriptions" subtitle="Provide detailed information about the temple">
        <div className="space-y-4">
          <div>
            <Label>Short Description *</Label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none placeholder:text-gray-500"
              placeholder="A brief one-line description..."
              value={form.shortDescription}
              onChange={e => set('shortDescription', e.target.value)}
            />
          </div>
          <div>
            <Label>Long Description</Label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Detailed description of the temple..."
              value={form.longDescription}
              onChange={e => set('longDescription', e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* 4. Temple History */}
      <Section title="Temple History" subtitle="Historical background of the temple">
        <textarea
          rows={5}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="Write the temple's history here..."
          value={form.history}
          onChange={e => set('history', e.target.value)}
        />
      </Section>

      {/* 5. Benefits */}
      <Section title="Benefits of the Temple" subtitle="Add key spiritual benefits for devotees">
        <div className="space-y-3">
          {form.benefits.map((benefit, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Benefit {i + 1}</span>
                {form.benefits.length > 1 && (
                  <button onClick={() => removeBenefit(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <Input
                placeholder="Benefit title (e.g. Relief from Difficulties)"
                value={benefit.title}
                onChange={e => setBenefit(i, 'title', e.target.value)}
              />
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Describe this benefit..."
                value={benefit.description}
                onChange={e => setBenefit(i, 'description', e.target.value)}
              />
            </div>
          ))}
          <button
            onClick={addBenefit}
            className="flex items-center gap-2 text-orange-500 text-sm font-medium hover:text-orange-600"
          >
            <Plus size={16} /> Add Benefit
          </button>
        </div>
      </Section>

      {/* 6. Timings */}
      <Section title="Timings of Temple" subtitle="Set opening, puja and aarti timings">
        <div className="space-y-4">

          {/* Temple Opening */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Temple Opening</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Morning Open</Label>
                <Input type="time" value={form.timings.temple.morningOpen}
                  onChange={e => setTiming('temple', 'morningOpen', e.target.value)} />
              </div>
              <div>
                <Label>Evening Close</Label>
                <Input type="time" value={form.timings.temple.eveningClose}
                  onChange={e => setTiming('temple', 'eveningClose', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Puja Timing */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Puja Timing</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Morning From</Label>
                <Input type="time" value={form.timings.puja.morningFrom}
                  onChange={e => setTiming('puja', 'morningFrom', e.target.value)} />
              </div>
              <div>
                <Label>Morning To</Label>
                <Input type="time" value={form.timings.puja.morningTo}
                  onChange={e => setTiming('puja', 'morningTo', e.target.value)} />
              </div>
              <div>
                <Label>Evening From</Label>
                <Input type="time" value={form.timings.puja.eveningFrom}
                  onChange={e => setTiming('puja', 'eveningFrom', e.target.value)} />
              </div>
              <div>
                <Label>Evening To</Label>
                <Input type="time" value={form.timings.puja.eveningTo}
                  onChange={e => setTiming('puja', 'eveningTo', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Aarti Timing */}
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Aarti Timing</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Morning From</Label>
                <Input type="time" value={form.timings.aarti.morningFrom}
                  onChange={e => setTiming('aarti', 'morningFrom', e.target.value)} />
              </div>
              <div>
                <Label>Morning To</Label>
                <Input type="time" value={form.timings.aarti.morningTo}
                  onChange={e => setTiming('aarti', 'morningTo', e.target.value)} />
              </div>
              <div>
                <Label>Evening From</Label>
                <Input type="time" value={form.timings.aarti.eveningFrom}
                  onChange={e => setTiming('aarti', 'eveningFrom', e.target.value)} />
              </div>
              <div>
                <Label>Evening To</Label>
                <Input type="time" value={form.timings.aarti.eveningTo}
                  onChange={e => setTiming('aarti', 'eveningTo', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. Services */}
      <Section title="Services at this Temple" subtitle="Select available services (display only)">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Virtual Darshan</p>
              <p className="text-xs text-gray-400">Online temple viewing experience</p>
            </div>
            <Toggle
              checked={form.services.virtualDarshan}
              onChange={v => setService('virtualDarshan', v)}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Puja Booking</p>
              <p className="text-xs text-gray-400">Book personalised puja at the temple</p>
            </div>
            <Toggle
              checked={form.services.pujaBooking}
              onChange={v => setService('pujaBooking', v)}
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">VR View</p>
              <p className="text-xs text-gray-400">Virtual reality temple experience</p>
            </div>
            <Toggle
              checked={form.services.vrView}
              onChange={v => setService('vrView', v)}
            />
          </div>
          <div>
            <Label>Virtual Chadhava Starting Price (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 21"
              value={form.services.virtualChadhavaPrice}
              onChange={e => setService('virtualChadhavaPrice', e.target.value)}
            />
          </div>
        </div>
      </Section>

      {/* 8. Images */}
      <Section title="Temple Images" subtitle="Upload photos of the temple">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {form.images.map((url, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={url} className="w-24 h-24 object-cover rounded-lg" alt="" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >×</button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors">
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <p className="text-xs text-gray-400">Supported: JPG, PNG, WEBP. Max 5MB per image.</p>
        </div>
      </Section>

      {/* 9. Location */}
      <Section title="Temple Location" subtitle="Enter coordinates from Google Maps">
        <div className="space-y-4">

          {/* Step by step instruction */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-blue-600 uppercase">How to get coordinates</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click "Open in Google Maps" button below</li>
              <li>The temple will be searched automatically</li>
              <li>Right-click on the temple pin on the map</li>
              <li>Coordinates will appear on the first line (e.g. 9.9195, 78.1197)</li>
              <li>Click on them — they will be auto-copied</li>
              <li>Paste them into the Latitude + Longitude fields here</li>
            </ol>
          </div>

          {/* Open Google Maps Button */}
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(`${form.name} ${form.city} ${form.state} India`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              !form.name
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Open in Google Maps
          </a>

          {/* Coordinates Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude *</Label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 9.9195"
                value={form.coordinates.lat}
                onChange={e => setNested('coordinates', 'lat', e.target.value)}
              />
            </div>
            <div>
              <Label>Longitude *</Label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 78.1197"
                value={form.coordinates.lng}
                onChange={e => setNested('coordinates', 'lng', e.target.value)}
              />
            </div>
          </div>

          {/* Live Preview Map */}
          {form.coordinates.lat && form.coordinates.lng && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Preview</p>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  src={`https://maps.google.com/maps?q=${form.coordinates.lat},${form.coordinates.lng}&z=15&output=embed`}
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                📍 {form.coordinates.lat}, {form.coordinates.lng}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Bottom Save */}
      <div className="flex justify-end gap-3 pb-6">
        <Link href="/temple-admin/temples"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2 bg-[#1E2A3A] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a4f] disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Temple'}
        </button>
      </div>
    </div>
  )
}

// Reusable components
function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Label({ children }) {
  return <label className="block text-xs font-medium text-gray-600 mb-1">{children}</label>
}

function Input({ ...props }) {
  return (
    <input
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
      {...props}
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      {...props}
    >
      {children}
    </select>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}
