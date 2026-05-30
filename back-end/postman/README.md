# FinNice Postman

Pakai file ini untuk test API auth FinNice dengan cepat.

## File

- `FinNice.postman_collection.json`
- `FinNice.local.postman_environment.json`

## Cara pakai

1. Buka Postman.
2. Import collection dan environment.
3. Pilih environment **FinNice Local**.
4. Jalankan request dari atas ke bawah.

## Urutan yang enak dicoba

1. Register
2. Login
3. Profile
4. Resend Verification
5. Verify Email
6. Logout

## Variabel yang dipakai

- `baseUrl`
- `email`
- `password`
- `name`
- `verificationCode`
- `token`

Kalau SMTP belum aktif, kode verifikasi biasanya muncul dari database atau log dev.
