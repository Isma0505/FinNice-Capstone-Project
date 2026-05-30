import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocale } from '../../contexts/LocaleContext';
import { formatRupiah } from '../../utils/helpers';

const COLORS = ['#ff7b8a', '#ffb347', '#e056a0', '#a78bfa', '#fb923c', '#f87171', '#818cf8', '#34d399'];

function PieChartComponent({ data, totalExpense }) {
  const { locale } = useLocale();

  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        {locale === 'id' ? 'Belum ada data pengeluaran' : 'No expense data yet'}
      </p>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatRupiah(value)}
            contentStyle={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
        gap: '10px',
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)'
      }}>
        {data.map((item, index) => {
          const total = data.reduce((sum, d) => sum + d.value, 0);
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '4px', 
                backgroundColor: COLORS[index % COLORS.length] 
              }} />
              <span style={{ fontSize: '13px', fontWeight: '500', flex: 1 }}>
                {item.name}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '16px', 
        paddingTop: '12px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--border)'
      }}>
        {locale === 'id' ? 'Total Pengeluaran' : 'Total Expense'}: {formatRupiah(totalExpense)}
      </div>
    </>
  );
}

export default PieChartComponent;