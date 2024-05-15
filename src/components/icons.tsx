import { forwardRef, type SVGProps } from "react";
import { cn } from "@/lib/utils";

const AnimatedSpinner = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      {...props}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn(className)}
    >
      <g className="animated-spinner">
        <rect x="11" y="1" width="2" height="5" opacity=".14" />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(30 12 12)"
          opacity=".29"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(60 12 12)"
          opacity=".43"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(90 12 12)"
          opacity=".57"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(120 12 12)"
          opacity=".71"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(150 12 12)"
          opacity=".86"
        />
        <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" />
      </g>
    </svg>
  ),
);
AnimatedSpinner.displayName = "AnimatedSpinner";

const CreditCard = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      {...props}
      viewBox="0 0 24 24"
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
      <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
  ),
);
CreditCard.displayName = "CreditCard";

const GoogleIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    className={cn(className)}
    width={21}
    height={20}
    fill="none"
    ref={ref}
    {...props}
  >
    <path fill="url(#a)" d="M.5 0h20v20H.5z" />
    <defs>
      <pattern
        id="a"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <use xlinkHref="#b" transform="scale(.00195)" />
      </pattern>
      <image
        xlinkHref="data:image/png;base64,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"
        id="b"
        width={512}
        height={512}
      />
    </defs>
  </svg>
  ),
);
GoogleIcon.displayName = "GoogleIcon";

export { AnimatedSpinner, CreditCard, GoogleIcon };

export {
  EyeOpenIcon,
  EyeNoneIcon as EyeCloseIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  ExitIcon,
  EnterIcon,
  GearIcon,
  RocketIcon,
  PlusIcon,
  HamburgerMenuIcon,
  Pencil2Icon,
  UpdateIcon,
  CheckCircledIcon,
  PlayIcon,
  TrashIcon,
  ArchiveIcon,
  ResetIcon,
  DiscordLogoIcon,
  FileTextIcon,
  IdCardIcon,
  PlusCircledIcon,
  FilePlusIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
