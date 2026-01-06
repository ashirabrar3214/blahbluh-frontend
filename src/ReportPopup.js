import React, { useState } from 'react';

const REPORT_REASONS = [
  "Hate Speech",
  "Racism",
  "Violence",
  "Inappropriate Behavior",
  "Nude Selling",
  "Asking Personal Info",
  "Others"
];

export default function ReportPopup({ onCancel, onSubmit, isSubmitting }) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl scale-100">
        <h3 className="text-lg font-bold text-white text-center mb-4">Report</h3>
        <p className="text-zinc-400 text-sm mb-4 text-center">
          Please select a reason for reporting.
        </p>
        
        <div className="space-y-2 mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {REPORT_REASONS.map((reason) => (
            <label key={reason} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-white/5 cursor-pointer hover:bg-zinc-800 transition-colors">
              <span className="text-sm text-zinc-200">{reason}</span>
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 focus:ring-blue-600 focus:ring-2"
              />
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-2xl bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(selectedReason)}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}