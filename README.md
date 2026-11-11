# 💰 MyFinance - Personal Finance Control System

**MyFinance** is a secure, high-end personal financial management web application designed to help individuals monitor, analyze, and control their entire financial life from a single centralized dashboard. Built with a modern fintech aesthetic, it moves beyond a basic expense tracker into a robust financial command center.

---

## 🚀 Key Features

*   **🔒 Secure Authentication:** Powered by Supabase Auth with Row Level Security (RLS) ensuring strict single-user data isolation.
*   **💳 Accounts & Wallets:** Manage Cash, Bank accounts, Mobile Financial Services (bKash, Nagad), and Credit Cards with real-time balance reconciliation.
*   **💸 Transaction Tracking:** Track Income, Expenses, and Account Transfers with strict duplicate-prevention rules and automatic balance synchronization.
*   **📊 Monthly Budgets:** Set category-wise monthly spending limits with dynamic progress tracking and threshold utilization warnings.
*   **🎯 Savings & Financial Goals:** Define milestones, target dates, and track contributions without false expense calculations.
*   **🏛️ Loans & EMI Management:** Monitor outstanding loan principals, interest breakdowns, and record EMI payments safely.
*   **💳 Credit Card Management:** Track credit limits, utilization ratios, statement/due dates, and bank account bill integration.
*   **📈 Reports & Analytics:** Monthly cash flow analysis, category spending breakdowns, and comprehensive CSV export functionality.

---

## 🛠️ Technology Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Backend & Database:** Supabase (PostgreSQL with RLS)
*   **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** installed on your machine.

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/myfinance.git](https://github.com/your-username/myfinance.git)
   cd myfinance

   npm install

   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


   npm run dev