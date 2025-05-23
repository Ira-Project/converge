import { AlertCircle } from "lucide-react";

export function NoAccessEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-4">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        No Access to Classroom
      </h2>
      
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        You no longer have access to this classroom. Your access may have been removed by the teacher or the classroom may have been archived.
      </p>
      
      <div className="text-sm text-gray-500">
        If you believe this is an error, please contact your teacher or administrator.
      </div>
    </div>
  );
} 