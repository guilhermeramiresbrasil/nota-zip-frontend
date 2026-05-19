import React from 'react';
import { Check } from 'lucide-react';
import { registerValidation } from '../logics/validations/registerValidation';

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements = registerValidation.getPasswordRequirements();

  return (
    <div className="space-y-2">
      {requirements.map((requirement) => {
        const isMet = registerValidation.checkRequirement(password, requirement);
        return (
          <div key={requirement} className="flex items-center gap-2 text-sm">
            <Check
              className={`h-4 w-4 ${
                isMet ? 'text-green-600' : 'text-gray-300'
              }`}
            />
            <span className={isMet ? 'text-green-700' : 'text-gray-500'}>
              {requirement}
            </span>
          </div>
        );
      })}
    </div>
  );
};
