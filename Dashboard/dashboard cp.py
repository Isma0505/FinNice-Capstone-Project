import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import joblib
import sklearn

# Load the trained model
scaler = joblib.load('scaler_expense.pkl')
model = joblib.load('model_dt_expense_tuned.pkl')

# Load the dataset
def load_data():
    df = pd.read_csv("expenses_income_summary.csv", delimiter=";")
    return df

df = load_data()

# Set up the Streamlit app
st.title("💎FinNice")
st.write("Pantau Kesehatan Finansial Anda dengan FinNice")

# Filter inteaktif
#Filter berdasarkan kategori
categories = ["Semua"] + list(df['category'].unique())
selected_category = st.selectbox("Pilih Kategori", categories, index=0)

#Filter berdasarkan akun
accounts = ["Semua akun"] + list(df['account'].unique())
selected_account = st.selectbox("Pilih Akun", accounts, index=0)

#Filter berdasarkan tanggal
df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
min_date = pd.to_datetime(df['Date']).min()
max_date = pd.to_datetime(df['Date']).max()
col1, col2 = st.columns(2)
with col1:
    start_date = st.date_input("Dari Tanggal", value=min_date, min_value=min_date, max_value=max_date)
with col2:
    end_date = st.date_input("Sampai Tanggal", value=max_date, min_value=min_date, max_value=max_date)

# Menerapkan filter pada dataset
filtered_df = df[
    ((df['category'] == selected_category) | (selected_category == "Semua")) &
    ((df['account'] == selected_account) | (selected_account == "Semua akun")) &
    (df['Date'].dt.date >= start_date) &
    (df['Date'].dt.date <= end_date)
]
if filtered_df.empty:
    st.warning("⚠️ Tidak ada data untuk filter yang dipilih.")
    st.stop()

# Visualisasi data
#Box value
st.subheader("Ringkasan")
col1, col2, col3 = st.columns(3)

total_income = filtered_df[filtered_df['type'] == 'INCOME']['amount'].sum()
total_expense = filtered_df[filtered_df['type'] == 'EXPENSE']['amount'].sum()
net_balance = total_income - total_expense

col1.metric("💰Total Pemasukan", f"Rp {total_income:,.0f}")
col2.metric("💸Total Pengeluaran", f"Rp {total_expense:,.0f}")
col3.metric("💳Saldo Net", f"Rp {net_balance:,.0f}")

#Pengeluaran berdasarkan kategori
st.subheader("Pengeluaran Berdasarkan Kategori")
df_by_category = filtered_df[filtered_df['type'] == 'EXPENSE'] \
    .groupby('category')['amount'].sum() \
    .reset_index() \
    .sort_values('amount', ascending=False)

fig, ax = plt.subplots(figsize=(10, 4))
sns.barplot(x='category', y='amount', data=df_by_category, ax=ax)
plt.xticks(rotation=45, ha='right')
ax.set_ylabel("Total (Rp)")
st.pyplot(fig)

#Pengeluaran berdasarkan akun
st.subheader("Pengeluaran Berdasarkan Akun")
df_by_account = filtered_df[filtered_df['type'] == 'EXPENSE'] \
    .groupby('account')['amount'].sum() \
    .reset_index() \
    .sort_values('amount', ascending=False)

fig, ax = plt.subplots(figsize=(10, 4))
sns.barplot(x='account', y='amount', data=df_by_account, ax=ax)
plt.xticks(rotation=45, ha='right')
ax.set_ylabel("Total (Rp)")
st.pyplot(fig)

#Tren pengeluaran dan pemasukan user
st.subheader("📈Tren Pengeluaran dan Pemasukan")
trend_df = filtered_df[filtered_df['type'] == 'EXPENSE'] \
    .groupby(['Date', 'type'])['amount'].sum().unstack(fill_value=0)
fig, ax = plt.subplots(figsize=(10, 4))
trend_df.plot(ax=ax, marker='o')
ax.set_ylabel("Amount (Rp)")
plt.xticks(rotation=45)
plt.legend(title="Tipe")
st.pyplot(fig)

#Diagram lingkaran untuk melihat keseimbangan antara pengeluaran dan pemasukan
st.subheader("Pengeluaran Vs Pemasukan")
balance = filtered_df[filtered_df['type'] != 'TRANSFER'] \
    .groupby("type")["amount"].sum()
fig, ax = plt.subplots()
ax.pie(balance, labels=balance.index, autopct='%1.1f%%', startangle=90)
ax.axis('equal')
st.pyplot(fig)
st.write("💰 Total pemasukan:", balance.get("INCOME", 0))
st.write("💸 Total pengeluaran:", balance.get("EXPENSE", 0))

# Prediksi Pengeluaran
st.subheader("🔍 Apakah Pengeluaran Anda Sehat?")

col1, col2 = st.columns(2)
with col1:
    input_amount = st.number_input("Jumlah Transaksi (Rp)", min_value=0)
with col2:
    input_date = st.date_input("Tanggal Transaksi")

st.write("**Kategori:**")
col1, col2, col3 = st.columns(3)
with col1:
    cat_bills = st.checkbox("Bills & Fees")
with col2:
    cat_food = st.checkbox("Food & Drinks")
with col3:
    cat_transport = st.checkbox("Transport")

st.write("**Akun:**")
col1, col2, col3, col4 = st.columns(4)
with col1:
    acc_cash = st.checkbox("Cash")
with col2:
    acc_metro = st.checkbox("Metro Card")
with col3:
    acc_salary = st.checkbox("Salary Bank")
with col4:
    acc_savings = st.checkbox("Savings Bank")


if st.button("Prediksi"):
    category_selected = sum([cat_bills, cat_food, cat_transport])
    account_selected = sum([acc_cash, acc_metro, acc_salary, acc_savings])
    
    if category_selected != 1:
        st.warning("⚠️ Pilih tepat satu kategori.")
    elif account_selected != 1:
        st.warning("⚠️ Pilih tepat satu akun.")
    else:
        input_data = pd.DataFrame([{
            'amount': input_amount,
            'year': input_date.year,
            'month': input_date.month,
            'day': input_date.day,
            'category_Bills & Fees': int(cat_bills),
            'category_Food & Drinks': int(cat_food),
            'category_Transport': int(cat_transport),
            'account_Cash': int(acc_cash),
            'account_Metro Card': int(acc_metro),
            'account_Salary Bank': int(acc_salary),
            'account_Savings Bank': int(acc_savings),
            'type_EXPENSE': 1,
            'type_INCOME': 0,
            'type_TRANSFER': 0,
        }])


        try:
            input_scaler = scaler.transform(input_data)
            prediction = model.predict(input_scaler)
            proba = model.predict_proba(input_scaler)[0]
            confidence = max(proba) * 100

            if prediction[0] == 1:
                st.success("✅ Pengeluaran Sehat")
            else:
                st.error("❌ Pengeluaran Tidak Sehat")

            st.caption(f"Tingkat keyakinan model: {confidence:.1f}%")

        except Exception as e:
            st.error(f"Gagal memproses prediksi: {e}")
#Detail transaksi
st.subheader("Detail Transaksi")
st.dataframe(
    filtered_df[['Date', 'category', 'account', 'type', 'amount']]
    .sort_values('Date', ascending=False)
    .reset_index(drop=True),
    use_container_width=True
)