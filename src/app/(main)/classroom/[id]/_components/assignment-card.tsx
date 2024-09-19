import { CalendarIcon, LockClosedIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Paths, Roles } from "@/lib/constants";
import Image from 'next/image'
import Link from "next/link";


export function AssignmentCard({
  topic,
  dueDate,
  imageUrl,
  isLive,
  id,
  isLocked,
  role
}: {
  topic: string,
  dueDate?: Date,
  imageUrl?: string,
  isLive: boolean,
  isLocked?: boolean,
  id: string,
  role: Roles
}) {

  const locked = isLocked ?? (role === Roles.Student && (!isLive));
  
  return (
    <div className="mb-4">
      {
        locked ?
        <div className="opacity-60">
          <CardContent
            topic={topic}
            dueDate={dueDate}
            imageUrl={imageUrl}
            locked={locked}
            isLive={isLive} />
        </div>
          :
          <Link href={`${Paths.Assignment}${id}`}>
            <CardContent
              topic={topic}
              dueDate={dueDate}
              imageUrl={imageUrl}
              locked={locked}
              isLive={isLive} />
        </Link>
      }
    </div>
  );
}

function CardContent({
  topic,
  dueDate,
  imageUrl,
  isLive,
  locked,
}: {
  topic: string,
  dueDate?: Date,
  imageUrl?: string,
  isLive: boolean,
  locked: boolean,
}) {
  
  return (
    <>
      <Card className="flex flex-row h-60 w-full p-5 gap-8">
        <div className="flex flex-col">
          <p className="text-2xl font-semibold justify-start">
            {topic}
          </p>
          <p className="jusify-end mt-auto">
            { dueDate ?
              <span className="flex flex-row gap-2 my-auto text-muted-foreground text-sm">
                <span className="my-auto">
                  <CalendarIcon />
                </span>
                <span className="my-auto">
                  {`Due: ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(dueDate)}`}
                </span>
              </span>
              :
              <span className="flex flex-row gap-2 my-auto text-muted-foreground text-sm">
                <span className="my-auto">
                  <CalendarIcon />
                </span>
                <span className="my-auto">
                  {'No due date'}
                </span>
              </span>
            }
          </p>
        </div>
        <div className="flex flex-col ml-auto">
          {
            locked ?
            <div className="flex flex-row ml-auto font-bold gap-2 text-md">
                <LockClosedIcon 
                  className="my-auto"
                  width={20} 
                  height={20} />
                  LOCKED
              </div>
            :
            isLive ?
              <p className="ml-auto bg-red-500 text-white rounded-md py-1 px-2 text-sm font-bold">
                LIVE
              </p>
            :
              <p className="ml-auto rounded-md border-2 py-1 px-2 text-sm font-bold text-muted-foreground">
                PREVIEW
              </p>
          }
          <div className="ml-auto my-auto justify-end">
            {
              imageUrl && 
              <Image 
                className="p-8"
                src={imageUrl} 
                alt={topic}  
                width={200}
                height={200}
              />
            }
          </div>
        </div>
      </Card>
    </>
  );
}


