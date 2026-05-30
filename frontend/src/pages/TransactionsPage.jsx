import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '../utils/api';
import TransactionList from '../components/transactions/TransactionList';
import TransactionFilter from '../components/transactions/TransactionFilter';
import TransactionModal from '../components/transactions/TransactionModal';
import ScanReceiptModal from '../components/transactions/ScanReceiptModal';
import { exportToPDF, formatRupiah, formatDate } from '../utils/helpers';

function TransactionsPage() {
  const { locale } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const fileInputRef = useRef(null);
  
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
  });

  const fetchTransactions = async () => {
    const result = await getTransactions();
    if (!result.error) {
      setTransactions(result.data);
      applyFilters(result.data, filters);
    }
    setLoading(false);
  };

  const applyFilters = (data, currentFilters) => {
    let filtered = [...data];
    
    if (currentFilters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === currentFilters.type);
    }
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(tx => tx.category === currentFilters.category);
    }
    if (currentFilters.search) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }
    setFilteredTransactions(filtered);
  };

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    const params = {};
    if (updated.type !== 'all') params.type = updated.type;
    if (updated.category !== 'all') params.category = updated.category;
    if (updated.search) params.search = updated.search;
    setSearchParams(params);
    applyFilters(transactions, updated);
  };

  const handleAddTransaction = async (newTransaction) => {
    await addTransaction(newTransaction);
    fetchTransactions();
  };

  const handleUpdateTransaction = async (id, updatedData) => {
    await updateTransaction(id, updatedData);
    fetchTransactions();
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm(locale === 'id' ? 'Hapus transaksi ini?' : 'Delete this transaction?')) {
      await deleteTransaction(id);
      fetchTransactions();
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleExportPDF = async () => {
    const totalIncome = filteredTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const totalExpense = filteredTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const balance = totalIncome - totalExpense;
    
    await exportToPDF(
      filteredTransactions,
      'Semua',
      'Semua',
      totalIncome,
      totalExpense,
      balance
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setShowScanModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanComplete = async (scanResult) => {
    for (const item of scanResult.items) {
      const categoryMap = {
        'Makanan': { icon: 'fa-utensils', color: '#ff7b8a' },
        'Transportasi': { icon: 'fa-car', color: '#ffb347' },
        'Belanja': { icon: 'fa-bag-shopping', color: '#e056a0' },
      };
      
      const cat = categoryMap[item.category] || categoryMap['Belanja'];
      
      const newTransaction = {
        type: 'expense',
        category: item.category,
        description: item.name,
        amount: item.price,
        date: scanResult.date,
        icon: cat.icon,
        color: cat.color,
      };
      
      await addTransaction(newTransaction);
    }
    fetchTransactions();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <p>Loading...</p>;

  const categories = ['all', ...new Set(transactions.map(tx => tx.category))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2>{locale === 'id' ? 'Transaksi' : 'Transactions'}</h2>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Tombol Export PDF */}
          <button 
            className="btn-secondary" 
            onClick={handleExportPDF}
            style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-file-pdf"></i>
            {locale === 'id' ? 'Export PDF' : 'Export PDF'}
          </button>
          
          {/* Tombol Scan Struk */}
          <button 
            className="btn-secondary" 
            onClick={() => fileInputRef.current.click()}
            style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-camera"></i>
            {locale === 'id' ? 'Scan Struk' : 'Scan Receipt'}
          </button>
          
          {/* Tombol Tambah Manual */}
          <button 
            className="btn-primary" 
            onClick={() => setShowModal(true)} 
            style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-plus"></i>
            {locale === 'id' ? 'Tambah Manual' : 'Add Manual'}
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {/* Filter Bar */}
      <div className="stat-card" style={{ marginBottom: '20px', padding: '16px' }}>
        <TransactionFilter 
          filters={filters}
          categories={categories}
          onFilterChange={updateFilters}
          onReset={() => updateFilters({ type: 'all', category: 'all', search: '' })}
        />
      </div>

      {/* Daftar Transaksi dengan edit */}
      <div className="stat-card">
        {filteredTransactions.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            {locale === 'id' ? 'Belum ada transaksi' : 'No transactions yet'}
          </p>
        ) : (
          filteredTransactions.map(tx => (
            <div key={tx.id} className="tx-item" style={{ cursor: 'pointer' }} onClick={() => handleEditClick(tx)}>
              <div className="tx-icon" style={{ background: `${tx.color}22`, color: tx.color }}>
                <i className={`fa-solid ${tx.icon}`}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{tx.description}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {tx.category} • {formatDate(tx.date, locale)}
                </div>
              </div>
              <div style={{ 
                fontWeight: 600, 
                color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)',
                marginRight: '12px'
              }}>
                {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTransaction(tx.id);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Manual */}
      <TransactionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddTransaction}
      />

      {/* Modal Edit Transaksi */}
      <TransactionModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        onSubmit={(data) => handleUpdateTransaction(editingTransaction?.id, data)}
        initialData={editingTransaction}
        isEdit={true}
      />

      {/* Modal Scan Struk */}
      <ScanReceiptModal 
        isOpen={showScanModal}
        onClose={() => {
          setShowScanModal(false);
          setSelectedImage(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        imageSrc={selectedImage}
        onScanComplete={handleScanComplete}
      />
    </div>
  );
}

export default TransactionsPage;