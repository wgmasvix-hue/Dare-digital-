import React from 'react';
import Chat from '../components/Chat';

export default function TutorPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DARA AI Tutor</h1>
          <p className="text-lg text-gray-600">
            Your personal Zimbabwean learning assistant, powered by DARE.
            Get help with any subject, from Heritage Studies to Advanced Mathematics.
          </p>
        </div>
        
        <Chat />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-emerald-600 mb-2">Heritage-Based</h3>
            <p className="text-sm text-gray-600">Aligned with Zimbabwe's Heritage-Based Curriculum and Education 5.0.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-emerald-600 mb-2">Exam Focused</h3>
            <p className="text-sm text-gray-600">Get help with ZIMSEC exam techniques and structured answer formats.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-emerald-600 mb-2">24/7 Support</h3>
            <p className="text-sm text-gray-600">DARA is always available to answer your questions and explain complex topics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
