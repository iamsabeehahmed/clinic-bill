import BillForm from '@/components/billing/BillForm';

export default function NewBillPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
        <p className="text-gray-600 mt-1">Generate a new bill for a patient</p>
      </div>

      <BillForm />
    </div>
  );
}
