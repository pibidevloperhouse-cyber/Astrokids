'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BookingForm() {
    const searchParams = useSearchParams();
    const { id } = useParams();

    const serviceType = searchParams.get('service') || 'Service Booking';
    const templeName = searchParams.get('templeName') || 'Temple';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        poojaDate: '',
        poojaTime: '',
        details: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const finalPoojaTime = formData.poojaDate && formData.poojaTime ? `${formData.poojaDate}T${formData.poojaTime}` : '';
            const res = await fetch('/api/send-temple-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    poojaTime: finalPoojaTime,
                    serviceType,
                    templeName
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Your booking request has been sent successfully!');
                setFormData({ name: '', email: '', phone: '', poojaDate: '', poojaTime: '', details: '' });
            } else {
                toast.error(data.error || 'Failed to send request. Please try again.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] py-12 px-5">
            <ToastContainer position="top-right" />
            <div className="max-w-2xl mx-auto">
                <Link
                    href={`/temples/${id}`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors mb-6"
                >
                    <ArrowLeft size={16} />
                    Back to Temple
                </Link>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                    <div className="relative z-10 mb-8">
                        <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-orange-100 text-orange-600 border border-orange-200">
                            {serviceType}
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">{templeName}</h1>
                        <p className="text-gray-500 text-sm">Please fill out the details below to request this service.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800"
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pooja Date *</label>
                                <input
                                    type="date"
                                    name="poojaDate"
                                    required
                                    value={formData.poojaDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pooja Time *</label>
                                <input
                                    type="time"
                                    name="poojaTime"
                                    required
                                    value={formData.poojaTime}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details / Special Requests</label>
                            <textarea
                                name="details"
                                rows="4"
                                value={formData.details}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-800 resize-none"
                                placeholder="Any specific requirements for the pooja..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <BookingForm />
        </Suspense>
    );
}
