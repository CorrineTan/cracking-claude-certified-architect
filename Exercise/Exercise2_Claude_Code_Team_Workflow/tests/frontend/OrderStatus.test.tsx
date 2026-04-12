import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderStatus } from '../../src/frontend/components/OrderStatus';

// Stub tests — in a real project these would use MSW for API mocking

describe('OrderStatus', () => {
  it('renders loading state initially', () => {
    const { container } = render(<OrderStatus orderId="ORD-001" />);
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('displays order details after loading', async () => {
    render(<OrderStatus orderId="ORD-001" />);
    await waitFor(() => {
      expect(screen.getByText('Order ORD-001')).toBeInTheDocument();
    });
  });

  it('shows refund button when eligible and prop is set', async () => {
    render(<OrderStatus orderId="ORD-001" showRefundButton />);
    await waitFor(() => {
      expect(screen.getByText('Request Refund')).toBeInTheDocument();
    });
  });

  it('hides refund button when showRefundButton is false', async () => {
    render(<OrderStatus orderId="ORD-001" showRefundButton={false} />);
    await waitFor(() => {
      expect(screen.queryByText('Request Refund')).not.toBeInTheDocument();
    });
  });
});
