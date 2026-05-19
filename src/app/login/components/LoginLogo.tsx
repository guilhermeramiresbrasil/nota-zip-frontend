import React from 'react';
import { Wallet } from 'lucide-react';

export const LoginLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
        <Wallet className="h-8 w-8 text-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
        Nota Zip
      </span>
    </div>
  );
};
