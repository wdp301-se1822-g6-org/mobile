import { connectSocket, disconnectSocket } from '@/services/socket';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Lắng nghe sự kiện realtime từ server và đồng bộ React Query.
 *
 * Tư tưởng: socket chỉ là "tín hiệu có thay đổi" -> invalidate query ->
 * React Query tự refetch REST. Không tự quản data qua socket.
 *
 * Backend cần emit (tên event có thể chỉnh cho khớp BE):
 *   - 'order:updated'       { orderId }
 *   - 'work-order:updated'  { orderId, workOrderId }
 * và cho client join room theo user/role sau khi xác thực JWT.
 *
 * Gọi 1 lần ở root (bên trong QueryClientProvider). Khi socket chưa sẵn sàng,
 * polling trong các hook vẫn là lưới an toàn.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const onOrderUpdated = (payload: { orderId?: string } = {}) => {
      // cashier
      queryClient.invalidateQueries({ queryKey: ['cashier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cashier-work-order-by-order'] });
      // customer
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (payload.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', payload.orderId] });
      }
    };

    const onWorkOrderUpdated = (payload: { orderId?: string } = {}) => {
      queryClient.invalidateQueries({ queryKey: ['cashier-work-order-by-order'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      onOrderUpdated(payload);
    };

    socket.on('order:updated', onOrderUpdated);
    socket.on('work-order:updated', onWorkOrderUpdated);
    // sau khi reconnect, refetch để bù dữ liệu bị lỡ
    socket.io.on('reconnect', () => onOrderUpdated());

    return () => {
      socket.off('order:updated', onOrderUpdated);
      socket.off('work-order:updated', onWorkOrderUpdated);
      socket.io.off('reconnect');
    };
  }, [token, queryClient]);
}
