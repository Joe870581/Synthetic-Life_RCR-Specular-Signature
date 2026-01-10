
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, CheckCircle, Wifi, ArrowRight, ShieldCheck } from 'lucide-react';

const V2TrueOathPage = () => {
  const [stage, setStage] = useState('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [qrData, setQrData] = useState<string | null>(null);

  useEffect(() => {
    if (stage === 'scanning') {
      const enableCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // In a real app, we'd use a QR scanning library here.
          // For this demo, we simulate finding a QR code after a delay.
          setTimeout(() => {
            setQrData('SOV_ANCHOR_ID::V2-CAR-001::SESSION_TOKEN_XYZ');
            setStage('authorizing');
          }, 3500);
        } catch (err) {
          console.error("Camera Error:", err);
          setStage('error');
        }
      };
      enableCamera();

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'authorizing') {
      setTimeout(() => setStage('charging'), 2000);
    }
  }, [stage]);

  const renderContent = () => {
    switch (stage) {
      case 'idle':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-black text-white mb-4">V2 Field Charging</h1>
            <p className="text-slate-400 max-w-sm mx-auto mb-8">Initiate a secure handshake with a V2-capable Sovereign Anchor to begin charging.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage('scanning')}
              className="px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl text-lg shadow-lg shadow-indigo-900/50 flex items-center gap-3 mx-auto"
            >
              <Zap size={24} />
              Initiate V2 Handshake
            </motion.button>
          </div>
        );

      case 'scanning':
        return (
          <div className="w-full max-w-md mx-auto text-center">
            <div className="aspect-square bg-black rounded-3xl overflow-hidden relative border-4 border-slate-700">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-3/4 h-3/4 border-4 border-dashed border-white/30 rounded-3xl animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-2 rounded-lg text-xs text-white/80 backdrop-blur-sm">
                Point your camera at the V2 Anchor's QR Code
              </div>
            </div>
          </div>
        );
        
      case 'authorizing':
        return (
            <div className="text-center">
                <motion.div initial={{scale:0}} animate={{scale:1}} className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-500/20">
                    <Wifi className="w-12 h-12 text-blue-400 animate-pulse" />
                </motion.div>
                <h2 className="text-2xl font-bold">Authorizing Handshake...</h2>
                <p className="text-slate-500 mt-1">V2 Anchor Detected. Verifying TrueOath.</p>
            </div>
        );

      case 'charging':
        return (
            <div className="text-center">
                <motion.div initial={{scale:0}} animate={{scale:1}} className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/20">
                    <Zap className="w-12 h-12 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold">CHARGING ACTIVE</h2>
                <p className="text-slate-500 mt-1">Governed energy corridor established.</p>
                 <button onClick={() => setStage('idle')} className="mt-8 px-6 py-3 bg-red-600/20 text-red-300 rounded-xl font-bold text-sm">
                    End Session
                </button>
            </div>
        );
        
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
            <motion.div
                key={stage}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
    </div>
  );
};

export default V2TrueOathPage;
