import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './PremiumResource.module.css';

export default function PremiumResource() {
  return (
    <div className={styles.container}>
      {/* Real Book Background Image */}
      <div className="absolute inset-0 z-0 opacity-30">
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
          alt="Premium Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary" />
      </div>

      <motion.div 
        className={`${styles.content} relative z-10 backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.iconWrapper}>
          <Lock size={64} className="text-accent mb-4" />
          <div className="absolute -top-4 -right-8 bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Premium</div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">Premium <span className="text-accent italic">Resource</span></h1>
        <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
          The resource you are looking for is part of our premium institutional collection.
        </p>
        
        <div className="flex items-start gap-4 bg-white/10 p-6 rounded-3xl mb-8 text-left border border-white/10 backdrop-blur-md">
          <ShieldCheck size={24} className="text-accent flex-shrink-0 mt-1" />
          <p className="text-white/80 text-sm leading-relaxed font-medium">This title requires an active institutional license or a premium individual subscription to access.</p>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          <a href="mailto:wgmasvix@gmail.com?subject=Premium Resource Inquiry" className="flex items-center justify-center gap-3 bg-accent text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-lg">
            <Mail size={20} />
            Contact Us for Access
          </a>
          <Link to="/library" className="flex items-center justify-center gap-3 bg-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors border border-white/10">
            <ArrowLeft size={20} />
            Return to Library
          </Link>
        </div>

        <div className="pt-8 border-t border-white/10 text-left">
          <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-3">
            <HelpCircle size={16} />
            <span>Why am I seeing this?</span>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">
            DARE Digital Library partners with global publishers to provide high-quality educational content. 
            Some resources are restricted based on licensing agreements.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
