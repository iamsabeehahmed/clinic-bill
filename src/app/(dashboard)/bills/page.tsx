import Link from 'next/link';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import BillsTable from '@/components/billing/BillsTable';

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing History</h1>
          <p className="text-gray-600 mt-1">View and manage all bills</p>
        </div>
        <Link href="/bills/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Bill
          </Button>
        </Link>
      </div>

      <BillsTable />
    </div>
  );
}
