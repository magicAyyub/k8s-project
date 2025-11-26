import { Card } from "@/components/ui/card";
import { Circle, CheckCircle2, Calendar, Clock } from "lucide-react";

export function TodoStats({
  active,
  completed,
  dueToday,
  overdue,
}: {
  active: number;
  completed: number;
  dueToday: number;
  overdue: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700">Active</p>
            <p className="text-2xl font-bold text-blue-900">{active}</p>
          </div>
          <Circle className="w-8 h-8 text-blue-500" />
        </div>
      </Card>

      <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-700">Completed</p>
            <p className="text-2xl font-bold text-green-900">{completed}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
      </Card>

      <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">Due Today</p>
            <p className="text-2xl font-bold text-orange-900">{dueToday}</p>
          </div>
          <Calendar className="w-8 h-8 text-orange-500" />
        </div>
      </Card>

      <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-700">Overdue</p>
            <p className="text-2xl font-bold text-red-900">{overdue}</p>
          </div>
          <Clock className="w-8 h-8 text-red-500" />
        </div>
      </Card>
    </div>
  );
}