export type WorkOrderStatus = 'waiting' | 'in_progress' | 'done' | 'qc_passed' | 'qc_failed';

export type WorkOrder = {
  id: string;
  orderId: string;
  washerId?: string;
  washerName?: string;
  status: WorkOrderStatus;
  checkinPhotos: string[];
  checkoutPhotos: string[];
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  order: {
    id: string;
    licensePlate: string;
    vehicleTypeName: string;
    serviceTypeName: string;
    customerName: string;
    customerPhone: string;
  };
};

export type FinishWorkOrderDto = { checkoutPhotos: string[] };
