import React from 'react';
import FormattedText from '@/components/formatted-text';
import Image from 'next/image';

interface StepOptionProps {
  step: string;
  selected: boolean;
  completed: boolean;
  image?: string | null;
}

const StepOption: React.FC<StepOptionProps> = ({ step, selected, completed, image }) => {
  return (
    <div
      className={`px-4 py-1 my-auto rounded-3xl text-sm min-w-[300px] 
        ${completed ? '' : selected ? 'bg-teal-200' : 'bg-teal-50'}
        ${completed && 'border-2 border-teal-200'}
      `}

      style={{
        boxShadow: '4px 4px 8px rgba(225, 246, 242, 100), -4px -4px 8px rgba(255, 255, 255, 100)',
      }}
    >
      <div className="mx-auto text-center w-full leading-8">
        <FormattedText text={step} />
        {image && <Image src={image} alt={step} width={100} height={100} />}
      </div>
    </div>
  );
};

export default StepOption; 