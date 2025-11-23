'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

type DisputeFormData = {
  username: string;
  mobile: string;
  category: 'Dispute' | 'Enquiry';
  description: string;
};

export default function DisputeForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DisputeFormData>();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/session=([^;]+)/);
    if (match) {
      try {
        const session = JSON.parse(decodeURIComponent(match[1]));
        if (session.role === 'customer') setIsCustomer(true);
        else setIsCustomer(false);
      } catch { setIsCustomer(false); }
    } else {
      setIsCustomer(false);
    }
  }, []);

  const onSubmit = async (data: DisputeFormData) => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus(result.error || 'Failed to submit dispute.');
      }
    } catch {
      setStatus('Failed to submit dispute.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Name</label>
        <input
          className="w-full border p-2"
          {...register('username', { required: 'Username is required' })}
        />
        {errors.username && <span className="text-red-600 text-sm">{errors.username.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1">Mobile Number</label>
        <input
          className="w-full border p-2"
          type="tel"
          {...register('mobile', { required: 'Mobile number is required' })}
        />
        {errors.mobile && <span className="text-red-600 text-sm">{errors.mobile.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1">Category</label>
        <select
          className="w-full border p-2"
          {...register('category', { required: 'Category is required' })}
          defaultValue="Enquiry"
        >
          <option value="Dispute">Dispute</option>
          <option value="Enquiry">Enquiry</option>
        </select>
        {errors.category && <span className="text-red-600 text-sm">{errors.category.message as string}</span>}
      </div>
      <div>
        <label className="block mb-1">Enquires / Dispute Description</label>
        <textarea
          className="w-full border p-2"
          rows={4}
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && <span className="text-red-600 text-sm">{errors.description.message as string}</span>}
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {status === 'success' && <div className="text-green-600 mt-2">Dispute submitted successfully!</div>}
      {status && status !== 'success' && <div className="text-red-600 mt-2">{status}</div>}
    </form>
  );
}
