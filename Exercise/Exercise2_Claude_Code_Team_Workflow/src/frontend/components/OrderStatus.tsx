import React from 'react';
import { useOrders } from '../hooks/useOrders';

interface OrderStatusProps {
  orderId: string;
  showRefundButton?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const OrderStatus: React.FC<OrderStatusProps> = ({
  orderId,
  showRefundButton = false,
}) => {
  const { order, isLoading, error, requestRefund } = useOrders(orderId);

  if (isLoading) return <div className="loading-spinner" />;
  if (error) return <div className="error-message">{error.message}</div>;
  if (!order) return null;

  return (
    <div className="order-status">
      <h3>Order {order.order_id}</h3>
      <span className={`status-badge status-${order.status}`}>
        {STATUS_LABELS[order.status] ?? order.status}
      </span>
      <p className="order-total">${order.total.toFixed(2)}</p>
      {showRefundButton && order.refund_eligible && (
        <button onClick={() => requestRefund(orderId)} className="btn-refund">
          Request Refund
        </button>
      )}
    </div>
  );
};
