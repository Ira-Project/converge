import React from 'react';
import { type Activity } from '../../types';
import { getMetaDataFromActivityType } from '../../../../../lib/utils/activityUtils';
import Image from 'next/image';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { cn, formatDateShort } from '@/lib/utils';
import { type ActivityType, Paths, Roles } from '@/lib/constants';

interface ActivityCardProps {
  activity: Activity;
  role: Roles;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, role }) => {
  const { id, typeText, topic, dueDate } = activity;
  const { url, iconImage, title, colour, description } = getMetaDataFromActivityType(typeText as ActivityType ?? undefined, id);

  return (
    <div className="border rounded-2xl p-4 md:p-6 w-[280px] md:w-[400px] flex-shrink-0">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div>
          <Image src={iconImage} alt={title} width={50} height={50} className="md:w-[60px] md:h-[60px]" />
        </div>
      </div>
      <div className={cn(
        "flex text-sm md:text-md my-auto font-bold",
        {
          "text-amber-700": colour === "amber",
          "text-rose-700": colour === "rose",
          "text-lime-700": colour === "lime",
          "text-teal-700": colour === "teal",
          "text-fuchsia-700": colour === "fuchsia",
          "text-blue-700": colour === "blue",
        }
      )}> 
        {title}
      </div>
      <h4 className="font-medium text-base md:text-lg mt-2 mb-3 md:mb-4 flex items-center">
        {topic?.name ?? "No topic"}
      </h4>
      
      <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 h-[50px] md:h-[60px] line-clamp-3">{description}</p>
      <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
        {dueDate ? formatDateShort(new Date(dueDate)) : "No due date"}
      </div>
      <div className="flex gap-2 md:gap-3 my-auto items-start vertical-align-middle">
        <Link href={`${url}${Paths.LiveActivity}`} className="p-0 underline text-xs my-auto">
          { role === Roles.Teacher ? "Preview" : "Start Activity"}
        </Link>
        <Link href={url} className="my-auto mx-1 md:mx-2">
          <ExternalLinkIcon className="w-4 h-4 md:w-5 md:h-5" />
        </Link>
      </div>
    </div>
  );
};

export default ActivityCard;