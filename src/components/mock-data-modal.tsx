'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';

export function MockDataModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem('govtracker-mock-data-modal-seen');
    
    if (!hasSeenModal) {
      // Delay modal opening to ensure page content renders first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleContinue = () => {
    // Mark modal as seen in localStorage
    localStorage.setItem('govtracker-mock-data-modal-seen', 'true');
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleContinue} showCloseButton={false}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to GovTracker PH
        </h2>
        
        <div className="text-gray-700 mb-6 space-y-3">
          <p>
            This website is currently being run on{' '}
            <span className="font-bold">mock data</span>.
          </p>
          
          <p>
            If you want to collaborate, email me at:{' '}
            <span className="font-bold text-blue-600">mannlesterm@gmail.com</span>
          </p>
        </div>
        
        <button
          onClick={handleContinue}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Press to continue
        </button>
      </div>
    </Modal>
  );
}
