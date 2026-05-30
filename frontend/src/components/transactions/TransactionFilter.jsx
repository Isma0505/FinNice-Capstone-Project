import { useLocale } from '../../contexts/LocaleContext';

function TransactionFilter({ filters, categories, onFilterChange, onReset }) {
  const { locale } = useLocale();

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ flex: 2, minWidth: '180px' }}>
        <input
          type="text"
          placeholder={locale === 'id' ? 'Cari transaksi...' : 'Search transactions...'}
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
        />
      </div>
      
      <select
        value={filters.type}
        onChange={(e) => onFilterChange({ type: e.target.value })}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text-primary)'
        }}
      >
        <option value="all">{locale === 'id' ? 'Semua Tipe' : 'All Types'}</option>
        <option value="income">{locale === 'id' ? 'Pemasukan' : 'Income'}</option>
        <option value="expense">{locale === 'id' ? 'Pengeluaran' : 'Expense'}</option>
      </select>
      
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ category: e.target.value })}
        style={{
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          color: 'var(--text-primary)'
        }}
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>
            {cat === 'all' ? (locale === 'id' ? 'Semua Kategori' : 'All Categories') : cat}
          </option>
        ))}
      </select>
      
      {(filters.type !== 'all' || filters.category !== 'all' || filters.search) && (
        <button
          onClick={onReset}
          style={{
            padding: '8px 12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          ✕ {locale === 'id' ? 'Reset' : 'Reset'}
        </button>
      )}
    </div>
  );
}

export default TransactionFilter;