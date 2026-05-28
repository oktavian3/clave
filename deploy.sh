#!/bin/bash
# ─────────────────────────────────────────────────
# Clave — One-Command Deploy to Arc Testnet
# ─────────────────────────────────────────────────
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔐 Clave — Arc Testnet Deployment${NC}"
echo "────────────────────────────────────"

WALLET="0x6e7ad7B501fCd21a380431FcE24089bb99cfC871"

echo -e "${YELLOW}Wallet:${NC} $WALLET"

# Check USDC balance using node
echo -e "\n${YELLOW}Checking USDC balance...${NC}"
USDC_BALANCE=$(node -e "
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network');
const usdc = new ethers.Contract(
  '0x3600000000000000000000000000000000000000',
  ['function balanceOf(address) view returns (uint256)'],
  provider
);
usdc.balanceOf('$WALLET').then(b => {
  console.log(ethers.formatUnits(b, 6));
}).catch(() => console.log('0'));
" 2>/dev/null)

echo -e "USDC Balance: ${GREEN}${USDC_BALANCE} USDC${NC}"

if [ "$USDC_BALANCE" = "0" ] || [ -z "$USDC_BALANCE" ]; then
  echo -e "\n${RED}❌ No USDC found. Fund your wallet:${NC}"
  echo -e "   1. Open ${GREEN}https://faucet.circle.com${NC}"
  echo -e "   2. Paste: ${GREEN}$WALLET${NC}"
  echo -e "   3. Select ARC-TESTNET → USDC → Claim"
  echo -e "   4. Run: ${GREEN}./deploy.sh${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Sufficient USDC for deployment${NC}"

# Navigate to contracts
cd "$(dirname "$0")/contracts"

echo -e "\n${YELLOW}Step 1: Compiling contracts...${NC}"
npx hardhat compile

echo -e "\n${YELLOW}Step 2: Deploying to Arc Testnet...${NC}"
npx hardhat run scripts/deploy.ts --network arcTestnet

echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
echo -e "Explorer: ${GREEN}https://testnet.arcscan.app${NC}"
