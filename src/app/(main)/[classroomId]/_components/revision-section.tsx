import { Paths } from '@/lib/constants';
import { ShieldPlus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface RevisionSectionProps {
  classroomId: string;
}

const RevisionSection: React.FC<RevisionSectionProps> = ({ classroomId }) => {
  
  return (
    <div className="px-8">
      <p className="text-lg font-bold mb-4">
        Revision and Practice
      </p>
      <div className="grid grid-cols-3 gap-8 mb-8">
        <div className="bg-lime-100 p-6 rounded-2xl flex flex-col gap-4 mx-auto h-full justify-center">  
          <p className="text-lime-700 text-lg font-bold text-center">
            Remember Everything
          </p>
          <p className="text-lime-700 text-center">
            Improve your memory by practicing new concepts and those you’ve missed before
          </p>
          <Link 
            href={`${Paths.Classroom}${classroomId}/revision/knowledge`} 
            className="bg-lime-700 text-white px-4 py-2 rounded-md text-center flex flex-row items-center justify-center">
            <ShieldPlus className="w-6 h-6 mr-2" />
            Strengthen Knowledge
          </Link>
        </div>
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-4 mx-auto h-full justify-center">  
          <p className="text-gray-700 text-lg font-bold text-center">
            Solve Anything
          </p>
          <p className="text-gray-700 text-center">
            Work through questions that you’ve missed before and practice problem solving
          </p>
          <div 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-center flex flex-row items-center justify-center">
            {/* <ShieldPlus className="w-6 h-6 mr-2" /> */}
            Coming Soon
          </div>
        </div>
        <div className="bg-gray-100 p-6 rounded-2xl flex flex-col gap-4 mx-auto h-full justify-center">  
          <p className="text-gray-700 text-lg font-bold text-center">
            Reason It Out
          </p>
          <p className="text-gray-700 text-center">
            Practice reasoning exercises and revisit questions you’ve missed before
          </p>
          <div 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-center flex flex-row items-center justify-center">
            {/* <ShieldPlus className="w-6 h-6 mr-2" /> */}
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};
          
export default RevisionSection;