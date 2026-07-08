import React from 'react';
import { PageHeader } from '../components/ui/States';
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '../components/ui/Skeletons';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Feedback';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  showTable?: boolean;
  showChart?: boolean;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description = 'This intelligence module is scheduled for implementation in Phase 2.',
  showTable = true,
  showChart = true,
}) => {
  const { toast } = useToast();

  const handleTestNotification = () => {
    toast.success(`Active scan initiated for ${title} partition.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={description}
        action={
          <div className="flex gap-2">
            <Badge variant="warning">Phase 2 Scheduled</Badge>
            <Button size="sm" onClick={handleTestNotification}>
              Trigger Notification
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showChart && <ChartSkeleton />}
        {showTable && <TableSkeleton rows={4} />}
      </div>
    </div>
  );
};
