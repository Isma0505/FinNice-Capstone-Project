import { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import Modal from '../common/Modal';

function TransactionModal({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Makanan',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        type: initialData.type,
        category: initialData.category,
        description: initialData.description,
        amount: initialData.amount,
        date: initialData.date,
      });
    } else {
      setFormData({
        type: 'expense',
        category: 'Makanan',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isEdit, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const categoryMap = {
      'Makanan': { icon: 'fa-utensils', color: '#ff7b8a' },
      'Transportasi': { icon: 'fa-car', color: '#ffb347' },
      'Belanja': { icon: 'fa-bag-shopping', color: '#e056a0' },
      'Tagihan': { icon: 'fa-file-invoice', color: '#a78bfa' },
      'Hiburan': { icon: 'fa-film', color: '#fb923c' },
      'Kesehatan': { icon: 'fa-heart-pulse', color: '#f87171' },
      'Pendidikan': { icon: 'fa-graduation-cap', color: '#818cf8' },
      'Gaji': { icon: 'fa-briefcase', color: '#00e6b8' },
      'Freelance': { icon: 'fa-laptop-code', color: '#60a5fa' },
      'Investasi': { icon: 'fa-chart-line', color: '#34d399' },
    };
    
    const cat = categoryMap[formData.category] || { icon: 'fa-circle', color: '#6b7fa3' };
    
    const newTransaction = {
      ...(isEdit && initialData ? { id: initialData.id } : {}),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      amount: parseInt(formData.amount),
      date: formData.date,
      icon: cat.icon,
      color: cat.color,
    };
    
    onSubmit(newTransaction);
    setFormData({
      type: 'expense',
      category: 'Makanan',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? (locale === 'id' ? 'Edit Transaksi' : 'Edit Transaction') : (locale === 'id' ? 'Tambah Transaksi' : 'Add Transaction')}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: `2px solid ${formData.type === 'expense' ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer' }}>
            <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={handleChange} />
            <span>{locale === 'id' ? 'Pengeluaran' : 'Expense'}</span>
          </label>
          <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', border: `2px solid ${formData.type === 'income' ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer' }}>
            <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={handleChange} />
            <span>{locale === 'id' ? 'Pemasukan' : 'Income'}</span>
          </label>
        </div>

        <div className="input-group">
          <select name="category" value={formData.category} onChange={handleChange} required>
            {[
              { key: 'Makanan', id: 'Makanan', en: 'Food' },
              { key: 'Transportasi', id: 'Transportasi', en: 'Transport' },
              { key: 'Belanja', id: 'Belanja', en: 'Shopping' },
              { key: 'Tagihan', id: 'Tagihan', en: 'Bills & Fees' },
              { key: 'Hiburan', id: 'Hiburan', en: 'Entertainment' },
              { key: 'Kesehatan', id: 'Kesehatan', en: 'Health' },
              { key: 'Pendidikan', id: 'Pendidikan', en: 'Education' },
              { key: 'Gaji', id: 'Gaji', en: 'Salary' },
              { key: 'Freelance', id: 'Freelance', en: 'Freelance' },
              { key: 'Investasi', id: 'Investasi', en: 'Investment' },
            ].map(cat => (
              <option key={cat.key} value={cat.key}>{locale === 'id' ? cat.id : cat.en}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <input type="text" name="description" placeholder={locale === 'id' ? 'Deskripsi' : 'Description'} value={formData.description} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <input type="number" name="amount" placeholder={locale === 'id' ? 'Jumlah (Rp)' : 'Amount (Rp)'} value={formData.amount} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            {locale === 'id' ? (isEdit ? 'Update' : 'Simpan') : (isEdit ? 'Update' : 'Save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TransactionModal;