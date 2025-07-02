import TransactionList from '../components/TransactionList';

function Transactions() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Transactions</h1>
      <TransactionList />
    </div>
  );
}

export default Transactions;
