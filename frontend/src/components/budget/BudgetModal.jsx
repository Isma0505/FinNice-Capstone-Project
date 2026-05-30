import { useState } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import Modal from '../common/Modal';

function BudgetModal({ isOpen, onClose, onSubmit }) {
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    category: 'Makanan',
    limit: '',
  });

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
    };
    
    const cat = categoryMap[formData.category] || { icon: 'fa-circle', color: '#6b7fa3' };
    
    const newBudget = {
      category: formData.category,
      limit: parseInt(formData.limit),
      spent: 0,
      icon: cat.icon,
      color: cat.color,
    };
    
    onSubmit(newBudget);
    setFormData({ category: 'Makanan', limit: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={locale === 'id' ? 'Tambah Anggaran' : 'Add Budget'}>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="Makanan">Makanan</option>
            <option value="Transportasi">Transportasi</option>
            <option value="Belanja">Belanja</option>
            <option value="Tagihan">Tagihan</option>
            <option value="Hiburan">Hiburan</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Pendidikan">Pendidikan</option>
          </select>
        </div>

        <div className="input-group">
          <input 
            type="number" 
            name="limit" 
            placeholder={locale === 'id' ? 'Batas Anggaran (Rp)' : 'Budget Limit (Rp)'} 
            value={formData.limit} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            {locale === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            {locale === 'id' ? 'Simpan' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BudgetModal;