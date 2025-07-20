import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-4" />
        <p className="text-amber-200">{message}</p>
      </div>
    </div>
  );
};

export default Loading; 