export const CONTRACTS = {
  USDC: process.env.USDC_ADDRESS || "0x3600000000000000000000000000000000000000",
  ESCROW: process.env.CLAVE_ESCROW_ADDRESS || "0xdB963217F191d952AA477E0b0212111C2fF06124",
  REPUTATION: process.env.CLAVE_REPUTATION_ADDRESS || "0xcb8E74F9FA2fC5E6DFA200a56F64F40b09fA8e49",
  PAYROLL: process.env.CLAVE_PAYROLL_ADDRESS || "0x4d5f40c4eD9d5951181344CBdF00910246F1CBC4",
};

export const CHAIN = {
  RPC_URL: process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network",
  CHAIN_ID: parseInt(process.env.ARC_CHAIN_ID || "5042002"),
  NAME: "Arc Testnet",
};

export const PORT = parseInt(process.env.PORT || "4000");
