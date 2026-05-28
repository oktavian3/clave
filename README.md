# 🔐 Clave

**Payment infrastructure for web3 workers. Built on Arc Network.**

Clave solves the real problems web3 freelancers, contributors, and workers face:
late payments, wrong amounts, no enforcement, and zero accountability.

---

## 🎯 The Problems

| Problem | Reality |
|---------|---------|
| **Late Payment** | Freelancers wait 30-90 days. DAOs miss quorum. Companies say "besok" forever. |
| **Wrong Amount** | Silent deductions, "adjusted" rates, hidden cuts. |
| **No Enforcement** | No mechanism to force payment. Promises are worthless. |
| **Dispute Nightmares** | No arbitration. Workers lose leverage. |
| **Reputation?** | Nothing onchain. Every project starts from zero. |

## 💡 The Solution

Clave is a **trustless payment layer** built on Arc Network that:

1. **Locks funds in escrow** — Client deposits USDC before work starts. Funds are immovable by the client alone.

2. **Auto-releases on deadline** — No response? Funds release to the worker automatically. Zero human intervention.

3. **Penalizes late payment** — 0.5% per day penalty, auto-deducted from escrow. Late payment costs money.

4. **Resolves disputes fast** — AI-assisted mediation + community arbitration. Days, not months.

5. **Builds onchain reputation** — Completion rate, payment speed, dispute history. Portable across platforms.

---

## 🏗️ Architecture

```
clave/
├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── src/
│   │   ├── ClaveEscrow.sol       # Core escrow + auto-release + penalties
│   │   ├── ClaveReputation.sol   # Onchain reputation scoring
│   │   └── ClavePayroll.sol      # Recurring payroll for DAOs
│   ├── scripts/
│   │   └── deploy.ts             # Arc Testnet deployment
│   └── test/                     # Contract tests
│
├── backend/            # Node.js API + event listener
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── db.ts                 # SQLite database
│   │   ├── config.ts             # Configuration
│   │   ├── routes/api.ts         # REST API endpoints
│   │   └── services/eventListener.ts  # Onchain event monitoring
│   └── data/                     # SQLite database files
│
├── frontend/           # Next.js 15 + Tailwind + Wagmi
│   ├── src/
│   │   ├── app/                  # Pages (App Router)
│   │   ├── components/           # React components
│   │   └── lib/                  # Wagmi config, ABIs
│   └── public/
│
└── .env.example        # Environment template
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Contracts
cd contracts && npm install

# Backend
cd ../backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network arcTestnet
```

### 4. Start Backend

```bash
cd backend
npm run dev
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3001` 🎉

---

## 📋 Contract Details

### ClaveEscrow
- `createProject()` — Create work agreement
- `deposit()` — Fund escrow with USDC
- `addMilestone()` — Define payment milestones
- `submitMilestone()` — Worker submits completion
- `approveMilestone()` — Client approves payment
- `autoRelease()` — Auto-release after deadline (anyone can call)
- `raiseDispute()` — Initiate dispute resolution
- `cancelProject()` — Cancel and refund

### ClaveReputation
- `recordCompletion()` — Track completed projects
- `getScore()` — Get reputation score (0-10000 = 0-100%)
- `getCompletionRate()` — Completion rate
- `getDisputeRate()` — Dispute rate

### ClavePayroll
- `createPayroll()` — Set up recurring payroll
- `addEmployee()` — Add team members
- `processPayroll()` — Execute payments
- `fundPayroll()` — Add funds

---

## 🔧 Arc Network Config

| Parameter | Value |
|-----------|-------|
| Chain ID | 5042002 |
| RPC | https://rpc.testnet.arc.network |
| Explorer | https://testnet.arcscan.app |
| Gas Token | USDC (18 decimals native, 6 decimals ERC-20) |
| USDC Contract | `0x3600000000000000000000000000000000000000` |
| Faucet | https://faucet.circle.com |

---

## 💰 Monetization

1. **Platform fee:** 1% on escrow releases
2. **Payroll SaaS:** Monthly fee for DAO/company plans
3. **Premium features:** Multi-sig escrow, advanced analytics
4. **Protocol fees:** Cross-chain bridge fee sharing

---

## 🔮 Roadmap

**Phase 1 — MVP (Current)**
- Core escrow contracts
- Auto-release + penalty system
- Basic reputation scoring
- Next.js dashboard

**Phase 2 — Production**
- AI dispute mediator
- Community arbitration with staking
- Telegram/Email notifications
- Cross-chain via CCTP

**Phase 3 — Scale**
- B2B Payroll API
- Governance token
- Analytics dashboard
- Mobile app

---

## 📄 License

MIT

---

*Built with 🔐 on Arc Network*
