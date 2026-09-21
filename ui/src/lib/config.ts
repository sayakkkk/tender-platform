export const APP_CONFIG = {
  APP_NAME: "Confidential Procurement & Tender Platform",
  CATEGORY: "Level 3 - Sealed-Bid Auction Protocol",
  NETWORK_NAME: "Midnight Preprod",
  NETWORK_ID: "preprod",
  INDEXER_URL: "https://indexer.preprod.midnight.network/api/v4/graphql",
  PROOF_SERVER_URL: "http://127.0.0.1:6300",
  DEFAULT_CONTRACT_ADDRESS: "14fdda1f6c45f3394b3113fb23dc70357a5fbcabc51caebf036a31f6991a3c0f",
  EXPLORER_URL: "https://preprod.midnight.network/explorer",
  CIRCUITS: {
    CREATE_TENDER: "createTender",
    REGISTER_VENDOR: "registerVendor",
    SUBMIT_SEALED_BID: "submitSealedBid",
    CLOSE_TENDER: "closeTender",
    REVEAL_WINNER: "revealWinner"
  },
  DEFAULT_TENDERS_STORAGE_KEY: "midnight_procurement_tenders_v2",
  PRIVATE_VAULT_STORAGE_KEY: "midnight_procurement_private_vault_v2",
  SESSION_WALLET_KEY: "midnight_procurement_wallet_session_v2"
};
