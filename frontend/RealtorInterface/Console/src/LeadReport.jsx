import React, { useEffect, useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  FileText,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
export default function LeadReport() {
  const { phone } = useParams();
  const [leadData, setLeadData] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${encodeURIComponent(phone)}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const contentType = res.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(
            `Unexpected response: ${contentType || 'unknown'} ${text.slice(0, 100)}`,
          );
        }
        // older API versions returned first_name/last_name
        if (!data.name && (data.first_name || data.last_name)) {
          data.name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
        }
        setLeadData(data);
      } catch (err) {
        console.error('Report fetch error:', err);
      }
    }
    fetchReport();
  }, [phone]);

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
                  <h1 className="text-3xl font-bold text-white mb-2">Relatório de Lead</h1>
                  <p className="text-blue-100">Informações e análise completas do lead</p>
                </div>
              </div>
              <div/>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="text-blue-600" size={24} />
              Informações de Contato
            </h2>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800">
                  {leadData.name}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800 flex items-center gap-2">
                  <Phone size={16} className="text-blue-600" />
                  {leadData.phone}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800 flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  {leadData.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="text-blue-600" size={24} />
              Detalhes da Localização
            </h2>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-medium text-gray-600 mb-2">ZIP code</label>
                <div className="bg-gray-50 px-4 py-3 rounded-xl font-medium text-gray-800 flex items-center gap-2">
                  <Hash size={16} className="text-blue-600" />
                  {leadData.zipcode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" size={24} />
              Resumo da Pesquisa
            </h2>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-4 rounded-xl text-gray-700 leading-relaxed">
              {leadData.surveySummary}
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={24} />
              Resumo das Mensagens
            </h2>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-4 rounded-xl text-gray-700 leading-relaxed">
              {leadData.messageSummary?.content}
            </div>
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
