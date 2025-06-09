import { Paths } from '@/lib/constants';
import { ShieldPlus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface RevisionSectionProps {
  classroomId: string;
}

const RevisionSection: React.FC<RevisionSectionProps> = ({ classroomId }) => {
  
  return (
    <div className="px-4 md:px-8">
      <p className="text-lg md:text-xl font-bold mb-3 md:mb-4">
        Revision and Practice
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
        <div className="bg-lime-100 p-4 md:p-6 rounded-2xl flex flex-col gap-3 md:gap-4 mx-auto h-full justify-center w-full">  
          <p className="text-lime-700 text-base md:text-lg font-bold text-center">
            Remember Everything
          </p>
          <p className="text-lime-700 text-center text-sm md:text-base">
            Improve your memory by practicing new concepts and those you've missed before
          </p>
          <Link 
            href={`${Paths.Classroom}${classroomId}/revision/knowledge`} 
            className="bg-lime-700 text-white px-3 md:px-4 py-2 rounded-md text-center flex flex-row items-center justify-center text-sm md:text-base">
            <ShieldPlus className="w-4 h-4 md:w-6 md:h-6 mr-2" />
            Strengthen Knowledge
          </Link>
        </div>
        <div className="bg-teal-100 p-4 md:p-6 rounded-2xl flex flex-col gap-3 md:gap-4 mx-auto h-full justify-center w-full">  
          <p className="text-teal-700 text-base md:text-lg font-bold text-center">
            Solve Anything
          </p>
          <p className="text-teal-700 text-center text-sm md:text-base">
            Work through questions that you've missed before and practice problem solving
          </p>
          <Link 
            href={`${Paths.Classroom}${classroomId}/revision/step-solve`} 
            className="bg-teal-700 text-white px-3 md:px-4 py-2 rounded-md text-center flex flex-row items-center justify-center text-sm md:text-base">
            <ShieldPlus className="w-4 h-4 md:w-6 md:h-6 mr-2" />
            Strengthen Evaluation
          </Link>
        </div>
        <div className="hidden bg-gray-100 p-4 md:p-6 rounded-2xl md:flex flex-col gap-3 md:gap-4 mx-auto h-full justify-center w-full md:col-span-2  lg:col-span-1">  
          <p className="text-gray-700 text-base md:text-lg font-bold text-center">
            Reason It Out
          </p>
          <p className="text-gray-700 text-center text-sm md:text-base">
            Practice reasoning exercises and revisit questions you've missed before
          </p>
          <div 
            className="bg-gray-300 text-gray-700 px-3 md:px-4 py-2 rounded-md text-center flex flex-row items-center justify-center text-sm md:text-base">
            {/* <ShieldPlus className="w-4 h-4 md:w-6 md:h-6 mr-2" /> */}
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};
          
export default RevisionSection;