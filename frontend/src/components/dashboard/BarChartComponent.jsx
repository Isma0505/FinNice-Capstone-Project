import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocale } from '../../contexts/LocaleContext';
import { formatRupiah } from '../../utils/helpers';

function BarChartComponent({ data }) {
  const { locale } = useLocale();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ margin: 0, color: p.color }}>
              {p.name}: {formatRupiah(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" stroke="var(--text-secondary)" />
        <YAxis 
          stroke="var(--text-secondary)" 
          tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(0)}jt`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="income" name={locale === 'id' ? 'Pemasukan' : 'Income'} fill="#00e6b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name={locale === 'id' ? 'Pengeluaran' : 'Expense'} fill="#ff7b8a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BarChartComponent;