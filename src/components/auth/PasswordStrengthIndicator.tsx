import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaMet = [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-rose-500';
  let labelColor = 'text-rose-600';

  if (criteriaMet === 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-orange-500';
    labelColor = 'text-orange-600';
  } else if (criteriaMet === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    labelColor = 'text-amber-600';
  } else if (criteriaMet === 3) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-blue-600';
    labelColor = 'text-blue-600';
  } else if (criteriaMet === 4) {
    strengthLabel = 'Very Strong';
    strengthColor = 'bg-emerald-600';
    labelColor = 'text-emerald-700';
  }

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-[11px] font-mono">Password strength:</span>
        <span className={`font-semibold font-mono text-[11px] ${labelColor}`}>{strengthLabel}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${criteriaMet >= 1 ? strengthColor : 'bg-slate-200'}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${criteriaMet >= 2 ? strengthColor : 'bg-slate-200'}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${criteriaMet >= 3 ? strengthColor : 'bg-slate-200'}`} />
        <div className={`h-full rounded-full transition-all duration-300 ${criteriaMet >= 4 ? strengthColor : 'bg-slate-200'}`} />
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-500 font-sans">
        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : ''}`}>
          {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : ''}`}>
          {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
          <span>Uppercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-medium' : ''}`}>
          {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
          <span>Number (0-9)</span>
        </div>
        <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-700 font-medium' : ''}`}>
          {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-300" />}
          <span>Special symbol</span>
        </div>
      </div>
    </div>
  );
};
