'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  // savedProfile = what's actually saved (shown in the preview <p> tag)
  const [savedProfile, setSavedProfile] = useState({ name: '', email: '' })
  // profileForm = draft values in the input fields (not shown in preview until saved)
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })

  // Fetch current admin profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/temple/auth/profile')
        const data = await res.json()
        if (res.ok && data.admin) {
          setSavedProfile({ name: data.admin.name, email: data.admin.email })
          setProfileForm({ name: data.admin.name, email: data.admin.email })
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      }
    }
    fetchProfile()
  }, [])

  // Save profile — only updates preview (<p> tag) AFTER successful backend save
  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) {
      setProfileMsg({ type: 'error', text: 'Name cannot be empty' })
      return
    }
    setProfileSaving(true)
    setProfileMsg({ type: '', text: '' })
    try {
      const res = await fetch('/api/temple/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileForm.name.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      // Only now update the display preview
      setSavedProfile({ name: data.admin.name, email: data.admin.email })
      setProfileForm({ name: data.admin.name, email: data.admin.email })
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    setPasswordMsg({ type: '', text: '' })
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill all password fields' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirm password do not match' })
      return
    }
    setPasswordSaving(true)
    try {
      const res = await fetch('/api/temple/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update password')
      setPasswordMsg({ type: 'success', text: 'Password updated successfully' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message })
    } finally {
      setPasswordSaving(false)
    }
  }

  const toggleShow = (field) =>
    setShowPasswords(p => ({ ...p, [field]: !p[field] }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your admin profile and security</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <User size={16} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Profile</h2>
            <p className="text-xs text-gray-400">Update your admin display name</p>
          </div>
        </div>

        {/* Avatar preview — uses savedProfile, NOT profileForm */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {savedProfile.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {savedProfile.name || 'Loading...'}
            </p>
            <p className="text-sm text-gray-400">
              {savedProfile.email || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Input fields — uses profileForm (draft) */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Your name"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              value={profileForm.email}
              readOnly
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
        </div>

        {profileMsg.text && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            profileMsg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {profileMsg.text}
          </div>
        )}

        <button
          onClick={handleProfileSave}
          disabled={profileSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E2A3A] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a4f] disabled:opacity-50 transition-colors"
        >
          <Save size={15} />
          {profileSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock size={16} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Change Password</h2>
            <p className="text-xs text-gray-400">Keep your account secure</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
              />
              <button type="button" onClick={() => toggleShow('current')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showPasswords.current ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              />
              <button type="button" onClick={() => toggleShow('new')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showPasswords.new ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              />
              <button type="button" onClick={() => toggleShow('confirm')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showPasswords.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordForm.confirmPassword && (
              <p className={`text-xs mt-1 ${
                passwordForm.newPassword === passwordForm.confirmPassword
                  ? 'text-green-500'
                  : 'text-red-400'
              }`}>
                {passwordForm.newPassword === passwordForm.confirmPassword
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </p>
            )}
          </div>
        </div>

        {passwordMsg.text && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            passwordMsg.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <button
          onClick={handlePasswordSave}
          disabled={passwordSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E2A3A] text-white rounded-lg text-sm font-medium hover:bg-[#2a3a4f] disabled:opacity-50 transition-colors"
        >
          <Lock size={15} />
          {passwordSaving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}
