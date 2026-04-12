import '@testing-library/jest-dom';

const mockOrder = {
  order_id: 'ORD-001',
  customer_id: 'CUST-1',
  items: [{ name: 'Widget', quantity: 1, price: 29.99 }],
  total: 29.99,
  status: 'delivered',
  refund_eligible: true,
};

global.fetch = vi.fn((url: string) => {
  if (url.includes('ORD-INVALID')) {
    return Promise.resolve({ ok: false, status: 404 });
  }
  if (url.includes('/refund')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { status: 'refund_pending' } }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: mockOrder }),
  });
}) as unknown as typeof fetch;

afterEach(() => {
  vi.clearAllMocks();
});
