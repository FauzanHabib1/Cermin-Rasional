# Ratio - Cermin Finansial Rasional

Aplikasi manajemen keuangan pribadi berbasis logika matematis dengan AI-powered financial analysis menggunakan OpenAI. Dirancang untuk membantu Anda membuat keputusan finansial berdasarkan data, bukan emosi.

## 🎯 Fitur Utama

### 1. **Input & Manajemen Transaksi**
- Input pemasukan (income) dan pengeluaran (expense) dengan kategori
- Alokasi otomatis tabungan dari pemasukan
- Edit dan hapus transaksi dengan tracking yang akurat
- Filter dan sort transaksi berdasarkan tipe dan tanggal

### 2. **Analisis Finansial Matematis**
- Analisis rasio 50/30/20 (Needs/Wants/Savings)
- Perhitungan net cashflow dan available balance
- Score konsistensi pengeluaran mingguan
- Efficiency score berdasarkan adherence terhadap target rasio
- Warning system untuk anomali finansial

### 3. **Alokasi Tabungan Cerdas**
- Alokasi tabungan otomatis saat input pemasukan
- Perhitungan uang yang tersedia untuk belanja = Pemasukan - Alokasi Tabungan
- Contoh: Input 500 ribu + alokasi 50 ribu = 450 ribu tersedia untuk belanja
- Tracking terpisah untuk alokasi tabungan di halaman Tabungan

### 4. **AI-Powered Financial Analysis** ✨
- Analisis laporan keuangan dengan AI ChatGPT
- Insight mendalam tentang kesehatan finansial Anda
- Rekomendasi konkret untuk meningkatkan manajemen keuangan
- Analisis rasio 50/30/20 dan identifikasi area perbaikan
- Tersedia on-demand di dashboard

### 5. **Laporan & Export**
- Export audit report ke PDF dengan format profesional
- JSON report untuk analisis lebih lanjut
- Ringkasan bulanan dengan grafik visual

### 6. **Dashboard Comprehensive**
- Visualisasi alur uang (pemasukan → alokasi → tersedia untuk belanja)
- Real-time ratio cards dengan target dan actual
- Score cards untuk konsistensi dan efisiensi
- Warning cards untuk anomali dan risiko finansial

## 📊 Logika Alokasi Tabungan

### Cara Kerja:
```
Input Pemasukan: Rp 500,000
Alokasi Tabungan: Rp 50,000

Hasil:
- Pemasukan Kotor: Rp 500,000 (income type)
- Diamankan Untuk Tabungan: Rp 50,000 (expense type, savings category)
- Tersedia Untuk Belanja: Rp 450,000 (500,000 - 50,000)
```

### Implementasi:
1. Saat user input pemasukan + alokasi tabungan, sistem membuat 2 transaksi:
   - Transaksi pemasukan: `type: "income"`, `amount: 500000`
   - Transaksi alokasi: `type: "expense"`, `category: "savings"`, `amount: 50000`, `isAllocation: true`

2. Dashboard menghitung:
   - `totalIncome = sum(transaksi income)` = 500,000
   - `savedAmount = sum(transaksi expense dengan isAllocation=true)` = 50,000
   - `availableBalance = totalIncome - savedAmount` = 450,000

3. Belanja hanya memotong dari `availableBalance`, bukan dari totalIncome

## 🏗️ Struktur Proyek

```
root/
├── client/                      # Frontend React + Vite
│   ├── src/
│   │   ├── pages/              # Halaman utama
│   │   │   ├── Dashboard.tsx    # Dashboard dengan AI Analysis
│   │   │   ├── Transactions.tsx # Input & manajemen transaksi
│   │   │   ├── Savings.tsx      # Riwayat alokasi tabungan
│   │   │   ├── Analysis.tsx     # Analisis mendalam
│   │   │   ├── Reports.tsx      # Laporan JSON
│   │   │   ├── Login.tsx        # Login page
│   │   │   └── Register.tsx     # Register page
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── RatioCard.tsx      # Kartu rasio 50/30/20
│   │   │   │   ├── ScoreCard.tsx      # Kartu score konsistensi
│   │   │   │   ├── AIAnalysis.tsx     # Komponen AI Analysis
│   │   │   │   └── TransactionTable.tsx
│   │   │   ├── forms/
│   │   │   │   └── AddTransaction.tsx # Form input transaksi
│   │   │   ├── layout/
│   │   │   │   └── Shell.tsx         # Layout utama
│   │   │   └── ui/                   # Reusable UI components
│   │   ├── lib/
│   │   │   ├── finance-engine.ts     # Logika analisis finansial
│   │   │   ├── types.ts              # Type definitions
│   │   │   ├── storage.ts            # LocalStorage operations
│   │   │   ├── currency-utils.ts     # Utility rupiah
│   │   │   ├── pdf-generator.ts      # PDF export
│   │   │   └── mock-data.ts          # Mock data untuk dev
│   │   ├── hooks/
│   │   │   ├── useTransactions.ts    # Transaksi hook
│   │   │   └── use-toast.ts          # Notification hook
│   │   └── App.tsx                    # Router utama
│   └── index.html
│
├── server/                      # Backend Express.js
│   ├── index.ts                 # Server entry point
│   ├── routes.ts                # API endpoints
│   ├── storage.ts               # Storage interface
│   ├── replit_integrations/
│   │   ├── batch/               # Batch processing utils
│   │   ├── chat/                # Chat integration
│   │   └── image/               # Image generation
│   ├── static.ts                # Static file serving
│   └── vite.ts                  # Vite dev server setup
│
├── shared/                      # Shared code
│   ├── schema.ts                # Database schema
│   └── models/
│       └── chat.ts              # Chat schema (future)
│
├── script/
│   └── build.ts                 # Build script
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── drizzle.config.ts            # Drizzle ORM config
└── README.md                     # Dokumentasi ini
```

## 🚀 Teknologi Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Accessible components
- **Wouter** - Routing
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **jsPDF** - PDF generation
- **Framer Motion** - Animations

### Backend
- **Express.js** - Web framework
- **OpenAI API** - AI analysis (via Replit AI Integrations)
- **Drizzle ORM** - Database abstraction
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **Express Session** - Session management

### DevOps & Build
- **TypeScript** - Type checking
- **Drizzle Kit** - Database migrations
- **tsx** - TypeScript executor

## 💾 Data Model

### Transaction
```typescript
interface Transaction {
  id: string;
  date: string;                 // ISO String
  amount: number;               // Dalam rupiah
  type: "income" | "expense";
  category: "need" | "want" | "savings";
  description: string;
  parentIncomeId?: string;      // Link untuk alokasi tabungan
  isAllocation?: boolean;       // true jika transaksi alokasi
}
```

### MonthlyAnalysis
```typescript
interface MonthlyAnalysis {
  period: string;               // "December 2025"
  totalIncome: number;          // Sum semua income
  totalExpense: number;         // Sum expense (need + want only)
  needExpense: number;
  wantExpense: number;
  savedAmount: number;          // Sum dari transaksi isAllocation=true
  netSavings: number;           // Income - Expense - SavedAmount
  needRatio: number;            // %
  wantRatio: number;            // %
  savingsRatio: number;         // %
  transactionCount: number;
}
```

## 🔌 API Endpoints

### Financial Analysis
**POST** `/api/analyze-finances`
- Mengirim data analisis finansial ke OpenAI
- Menggunakan Server-Sent Events (SSE) untuk streaming response
- Return: Stream teks analisis AI

**Request:**
```json
{
  "analysis": {
    "period": "December 2025",
    "totalIncome": 500000,
    "totalExpense": 300000,
    "needExpense": 150000,
    "wantExpense": 150000,
    "savedAmount": 50000,
    "needRatio": 30,
    "wantRatio": 30,
    "savingsRatio": 10
  }
}
```

**Response (SSE):**
```
data: {"content":"Kesehatan finansial Anda..."}
data: {"content":" cukup baik..."}
data: {"done":true}
```

## 📱 Halaman-Halaman Utama

### 1. Dashboard (`/`)
- Ringkasan finansial bulanan
- Visualisasi alur uang
- Ratio cards (Needs/Wants/Savings)
- Score cards (Konsistensi & Efisiensi)
- **AI Analysis component** - Analisis mendalam dengan AI
- Warning cards untuk risiko finansial
- Tombol export PDF dan JSON

### 2. Transactions (`/transactions`)
- Form input transaksi baru
- List semua transaksi dengan filter
- Kemampuan edit dan delete
- Alokasi tabungan otomatis untuk income

### 3. Savings (`/savings`)
- Riwayat alokasi tabungan
- Total tabungan teramankan
- Kemampuan batalkan alokasi

### 4. Analysis (`/analysis`)
- Analisis mendalam per kategori
- Trend pengeluaran
- Grafik visual

### 5. Reports (`/reports`)
- Laporan JSON detail
- Export data untuk analisis lanjutan

### 6. Login & Register
- Authentication dengan password
- Persistent login per user

## 🔐 Authentication

- Login berbasis username & password
- Session management dengan express-session
- Data terenkripsi per user
- Logout clearing session

## 🎨 Design System

- **Color Palette:**
  - Primary: Blue (Accent)
  - Success: Green (Savings)
  - Warning: Orange
  - Danger: Red (Expense)
  
- **Typography:**
  - Display: Space Grotesk
  - Body: Inter
  - Mono: JetBrains Mono

- **Components:**
  - 40+ Radix UI components pre-configured
  - Dark mode support via next-themes
  - Responsive design (mobile-first)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database (via Replit)

### Installation

1. Clone repository
```bash
git clone <repo>
cd <project>
```

2. Install dependencies
```bash
npm install
```

3. Setup database
```bash
npm run db:push
```

4. Run development server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Build untuk Production
```bash
npm run build
npm start
```

## 📊 Finance Engine Logic

### analyzeFinances(transactions)
Menganalisis transaksi dan menghasilkan:
- Total income, expense, allocation
- Rasio spending per kategori
- Net savings (sisa uang bulan ini)

### calculateConsistencyScore(transactions)
Menghitung:
- **Consistency Score**: Berdasarkan variance pengeluaran mingguan
- **Efficiency Score**: Berdasarkan adherence ke target 50/30/20
- **Warnings**: Alert untuk anomali finansial

### calculateSavingCapacity(transactions)
Menghitung kapasitas menabung berdasarkan:
- Total income
- Kebutuhan minimum
- Buffer safety 10%

## 🎯 Kontribusi

Area untuk pengembangan lebih lanjut:
- [ ] Multi-currency support
- [ ] Budget goals tracking
- [ ] Recurring transactions
- [ ] Bank statement import
- [ ] Mobile app (React Native)
- [ ] Investment tracking
- [ ] Forecast finansial
- [ ] Sharing reports

## 📝 Notes

### Penting tentang Alokasi Tabungan:
- Alokasi bukan pengeluaran, tapi dana yang "diamankan"
- Tidak mengurangi income, tapi mengurangi available balance
- Terpisah dari kategori expense untuk accuracy
- Bisa dibatalkan kapan saja dari halaman Savings

### Performance Tips:
- Batch process untuk transaksi besar menggunakan utility di `/server/replit_integrations/batch`
- Cache analysis results untuk dashboard yang load cepat
- Streaming AI response untuk UX responsif

## 🔗 Links

- Repository: [GitHub]
- Issues: [GitHub Issues]
- Documentation: [Wiki]

---

**Made with ❤️ for rational financial decision-making**
