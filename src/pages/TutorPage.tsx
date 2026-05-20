import React from 'react';
import Chat from '../components/Chat';
import { motion } from 'motion/react';

export default function TutorPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          >
            Digital Academic Research Assistant
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-tight">
            Consult <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">DARA</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Zimbabwe's premier AI Learning Companion, fully integrated with Education 5.0 for a future-ready education.
          </p>
        </div>
        
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
           <Chat />
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-emerald-700 font-bold text-xl">01</span>
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-3 text-emerald-700">Heritage-Based</h3>
            <p className="text-slate-600 leading-relaxed">Expertly aligned with Zimbabwe's Heritage-Based Curriculum, ensuring local relevance and cultural pride.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-blue-700 font-bold text-xl">02</span>
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-3 text-emerald-700">Industrialization Focus</h3>
            <p className="text-slate-600 leading-relaxed">Bridging the gap between theory and industry. Ask DARA how to turn your project into a business.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-amber-700 font-bold text-xl">03</span>
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-3 text-emerald-700">24/7 Innovation</h3>
            <p className="text-slate-600 leading-relaxed">Available anytime to brainstorm, troubleshoot, and guide your path toward innovative excellence.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
