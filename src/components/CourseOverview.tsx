import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CourseOverviewProps {
  what_you_learn?: string[];
  requirement?: string;
}

export default function CourseOverview({ what_you_learn = [], requirement = "" }: CourseOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="border border-gray-200 p-6 md:p-8">
        <h2 className="font-roboto-condensed-bold text-2xl mb-6">What you&apos;ll learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(what_you_learn || []).map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
              <span className="font-roboto text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-roboto-condensed-bold text-2xl mb-4">Requirements</h2>
        <p className="font-roboto text-gray-700 leading-relaxed whitespace-pre-line">
          {requirement}
        </p>
      </div>
    </div>
  );
}
