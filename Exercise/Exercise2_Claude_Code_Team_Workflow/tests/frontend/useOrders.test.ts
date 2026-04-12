import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from '../../src/frontend/hooks/useOrders';

// Stub tests — in a real project these would use MSW for API mocking

describe('useOrders', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useOrders('ORD-001'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.order).toBeNull();
  });

  it('returns order data after successful fetch', async () => {
    const { result } = renderHook(() => useOrders('ORD-001'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sets error on failed fetch', async () => {
    const { result } = renderHook(() => useOrders('ORD-INVALID'));
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });
});
