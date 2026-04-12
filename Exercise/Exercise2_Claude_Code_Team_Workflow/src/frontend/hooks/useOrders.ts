import { useState, useEffect, useCallback } from 'react';

interface Order {
  order_id: string;
  customer_id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  refund_eligible: boolean;
}

interface UseOrdersResult {
  order: Order | null;
  isLoading: boolean;
  error: Error | null;
  requestRefund: (orderId: string) => Promise<void>;
}

export function useOrders(orderId: string): UseOrdersResult {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error(`Order fetch failed: ${response.status}`);
        const { data } = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const requestRefund = useCallback(async (id: string) => {
    const response = await fetch(`/api/orders/${id}/refund`, { method: 'POST' });
    if (!response.ok) throw new Error(`Refund request failed: ${response.status}`);
    const { data } = await response.json();
    setOrder((prev) => (prev ? { ...prev, status: 'refund_pending', ...data } : prev));
  }, []);

  return { order, isLoading, error, requestRefund };
}
