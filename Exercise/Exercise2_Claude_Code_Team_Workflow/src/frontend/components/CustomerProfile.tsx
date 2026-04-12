import React, { useState, useEffect } from 'react';

interface Customer {
  customer_id: string;
  name: string;
  email: string;
  status: string;
  tier: string;
}

interface CustomerProfileProps {
  customerId: string;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      const response = await fetch(`/api/customers/${customerId}`);
      const { data } = await response.json();
      setCustomer(data);
      setIsLoading(false);
    };
    fetchCustomer();
  }, [customerId]);

  if (isLoading) return <div className="loading-spinner" />;
  if (!customer) return <div className="not-found">Customer not found</div>;

  return (
    <div className="customer-profile">
      <h2>{customer.name}</h2>
      <p className="customer-email">{customer.email}</p>
      <span className={`tier-badge tier-${customer.tier}`}>{customer.tier}</span>
      {customer.status === 'suspended' && (
        <div className="warning-banner">Account suspended</div>
      )}
    </div>
  );
};
