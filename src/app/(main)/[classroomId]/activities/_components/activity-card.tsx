import React from 'react';
import { type Activity } from '../types';
import { getMetaDataFromActivityType } from '@/lib/utils/activityUtils';
import Image from 'next/image';
import { ExternalLinkIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { cn, formatDateShort } from '@/lib/utils';
import { type ActivityType, Paths, Roles } from '@/lib/constants';

interface ActivityCardProps {
  activity: Activity;
  role: Roles;
  classroomId: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, role, classroomId }) => {
  const { id, typeText, isLive, dueDate } = activity;
  const { url, iconImage, title, tags, colour, description } = getMetaDataFromActivityType(typeText as ActivityType, id);

  const dueDatePassed = dueDate && new Date() > new Date(dueDate);

  return (
    <div className="border rounded-2xl p-6 w-[400px]">
      <div className="flex items-start justify-between mb-4">
        <div className="mb-4">
          <Image src={iconImage} alt={title} width={60} height={60} />
        </div>
        <div className="flex flex-col gap-1">
          {dueDatePassed ? (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">PAST DUE</span>
          ) : isLive && (
            <span className="bg-destructive text-white text-xs px-2 py-1 rounded">LIVE</span>
          )}
        </div>
        {/* {status === "SUBMITTED" && (
          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">SUBMITTED</span>
        )} */}
      </div>
      <h4 className="font-medium mb-2 flex items-center">
        {title}
        <Link href={`/${classroomId}/documentation/${id}`}>
          <InfoCircledIcon className="w-4 h-4 ml-2 text-gray-400" />
        </Link>
      </h4>
      <div className={cn(
        "flex gap-2 mb-3",
        {
          "text-amber-700": colour === "amber",
          "text-rose-700": colour === "rose",
          "text-lime-700": colour === "lime",
          "text-teal-700": colour === "teal",
          "text-fuchsia-700": colour === "fuchsia",
          "text-blue-700": colour === "blue",
        }
      )}> 
        {tags.map((tag, index) => (
          <span key={index} className="flex gap-2 my-auto font-bold">
            <span className="text-xs my-auto">
              {tag}
            </span>
            {index < tags.length - 1 && "·"}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mb-4 h-[60px] line-clamp-3">{description}</p>
      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-500">
          {dueDate ? formatDateShort(new Date(dueDate)) : "No due date"}
        </span>
      </div>
      <div className="flex gap-3 my-auto items-start vertical-align-middle">
        <Link href={`${url}${Paths.LiveActivity}`} className="p-0 underline text-xs my-auto">
          { role === Roles.Teacher ? "Preview" : "Start Activity"}
        </Link>
        <Link href={url} className="my-auto mx-2">
          <ExternalLinkIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default ActivityCard;