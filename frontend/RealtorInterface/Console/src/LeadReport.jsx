import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  User,
  Phone,
  MapPin,
  Hash,
  FileText,
  MessageSquare,
  Edit3,
  Save,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
export default function LeadReport() {
  const { phone } = useParams();
  const [leadData, setLeadData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('phone', phone)
        .single();          // one row expected

      if (error) {
        console.error('Supabase report error:', error);
        return;
      }
      setLeadData(data);
    }
    fetchReport();
  }, [phone]);

  const handleInputChange = (field, value) => {
    setLeadData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // typically you would persist changes here
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!leadData) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link to="/" className="text-white hover:text-blue-200">
                  <ArrowLeft />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Lead Report</h1>
                  <p className="text-blue-100">Comprehensive lead information and analysis</p>
                </div>
              </div>
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                  >
                    <Edit3 size={18} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                    >
                      <Save size={18} />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              Contact Information
            </h2>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={leadData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800">
                    {leadData.name}
                  </div>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800 flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" />
                    {leadData.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="text-blue-600" size={24} />
              Location Details
            </h2>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">ZIP code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={leadData.zipcode}
                    onChange={(e) => handleInputChange('zipcode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800 flex items-center gap-2">
                    <Hash size={16} className="text-blue-600" />
                    {leadData.zipcode}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              Survey Summary
            </h2>

            {isEditing ? (
              <textarea
                value={leadData.surveySummary}
                onChange={(e) => handleInputChange('surveySummary', e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-4 rounded-xl text-gray-700 leading-relaxed">
                {leadData.surveySummary}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={24} />
              Message Summary
            </h2>

            {isEditing ? (
              <textarea
                value={leadData.messageSummary}
                onChange={(e) => handleInputChange('messageSummary', e.target.value)}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-4 rounded-xl text-gray-700 leading-relaxed">
                {leadData.messageSummary}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <p className="text-gray-500 text-sm">
              Last Updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
