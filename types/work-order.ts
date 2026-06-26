export type WorkOrderStatus = 'waiting' | 'in_progress' | 'done' | 'qc_passed' | 'qc_failed';

export type WorkOrder = {
  id: string;
  orderId: string;
  code: string;
  vehicleSnapshot: {
    plate: string;
    vehicleTypeName: string;
    color?: string;
  };
  serviceName: string;
  scheduledAt: string;
  status: WorkOrderStatus;
  checkinPhotos: string[];
  checkoutPhotos: string[];
  customerName?: string;
  customerPhone?: string;
  preferredWasherId?: string;
  assignedWasherId?: string;
  assignedWasherName?: string;
  estimatedMinutes?: number;
  stationName?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type FinishWorkOrderDto = { checkoutPhotos: string[] };
