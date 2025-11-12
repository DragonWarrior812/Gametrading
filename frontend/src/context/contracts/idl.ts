import { Idl } from '@project-serum/anchor';

export const IDL: Idl = {
  "version": "0.1.0",
  "name": "pump_fun",
  "instructions": [
    {
      "name": "initMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferOwnership",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "UpdateMainStateInput"
          }
        }
      ]
    },
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tier",
          "type": {
            "defined": "Tier"
          }
        },
        {
          "name": "creatorFeeRecipient",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "buyTokensFromExactSol",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyerBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "quoteAmount",
          "type": "u64"
        },
        {
          "name": "minBaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyExactTokensFromSol",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyerBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "baseAmount",
          "type": "u64"
        },
        {
          "name": "maxQuoteAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sell",
      "accounts": [
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "platformFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorFeeRecipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorFeeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minSolOutput",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "MainState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "platformFeeRecipient",
            "type": "publicKey"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "initVirtBaseReserves",
            "type": "u64"
          },
          {
            "name": "initVirtQuoteReserves",
            "type": "u64"
          },
          {
            "name": "realQuoteThreshold",
            "type": "u64"
          },
          {
            "name": "bronzeFeeConfig",
            "type": {
              "defined": "TierFeeConfig"
            }
          },
          {
            "name": "silverFeeConfig",
            "type": {
              "defined": "TierFeeConfig"
            }
          },
          {
            "name": "goldFeeConfig",
            "type": {
              "defined": "TierFeeConfig"
            }
          },
          {
            "name": "diamondFeeConfig",
            "type": {
              "defined": "TierFeeConfig"
            }
          }
        ]
      }
    },
    {
      "name": "PoolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "baseMint",
            "type": "publicKey"
          },
          {
            "name": "virtBaseReserves",
            "type": "u64"
          },
          {
            "name": "realBaseReserves",
            "type": "u64"
          },
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "virtQuoteReserves",
            "type": "u64"
          },
          {
            "name": "realQuoteReserves",
            "type": "u64"
          },
          {
            "name": "realQuoteThreshold",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          },
          {
            "name": "tier",
            "type": {
              "defined": "Tier"
            }
          },
          {
            "name": "creatorFeeRecipient",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "UpdateMainStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "platformFeeRecipient",
            "type": "publicKey"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initVirtBaseReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "initVirtQuoteReserves",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "realQuoteThreshold",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "bronzeFeeConfig",
            "type": {
              "option": {
                "defined": "TierFeeConfig"
              }
            }
          },
          {
            "name": "silverFeeConfig",
            "type": {
              "option": {
                "defined": "TierFeeConfig"
              }
            }
          },
          {
            "name": "goldFeeConfig",
            "type": {
              "option": {
                "defined": "TierFeeConfig"
              }
            }
          },
          {
            "name": "diamondFeeConfig",
            "type": {
              "option": {
                "defined": "TierFeeConfig"
              }
            }
          }
        ]
      }
    },
    {
      "name": "TierFeeConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "platformFeePercent",
            "type": "u64"
          },
          {
            "name": "creatorFeePercent",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Tier",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Bronze"
          },
          {
            "name": "Silver"
          },
          {
            "name": "Gold"
          },
          {
            "name": "Diamond"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "MainStateInitialized",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "platformFeeRecipient",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tradingFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalSupply",
          "type": "u64",
          "index": false
        },
        {
          "name": "initVirtBaseReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "initVirtQuoteReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "realQuoteThreshold",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "OwnershipTransferred",
      "fields": [
        {
          "name": "previousOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOwner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "MainStateUpdated",
      "fields": [
        {
          "name": "platformFeeRecipient",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tradingFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalSupply",
          "type": "u64",
          "index": false
        },
        {
          "name": "initVirtBaseReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "initVirtQuoteReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "realQuoteThreshold",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "CreateEvent",
      "fields": [
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "quoteReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "tier",
          "type": {
            "defined": "Tier"
          },
          "index": false
        },
        {
          "name": "creatorFeeRecipient",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "TradeEvent",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "baseReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "quoteReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "isBuy",
          "type": "bool",
          "index": false
        },
        {
          "name": "platformFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "CompleteEvent",
      "fields": [
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "withdrawer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "quoteAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorised",
      "msg": "Unauthorised"
    },
    {
      "code": 6001,
      "name": "AlreadyBecameOwner",
      "msg": "Already became an owner"
    },
    {
      "code": 6002,
      "name": "InvalidFee",
      "msg": "Invalid fee"
    },
    {
      "code": 6003,
      "name": "InvalidTotalSupply",
      "msg": "Invalid total supply"
    },
    {
      "code": 6004,
      "name": "InvalidInitVirtBaseReserves",
      "msg": "Invalid initial virtual base reserves"
    },
    {
      "code": 6005,
      "name": "InvalidInitVirtQuoteReserves",
      "msg": "Invalid initial virtual quote reserves"
    },
    {
      "code": 6006,
      "name": "InvalidRealQuoteThreshold",
      "msg": "Invalid real quote threshold"
    },
    {
      "code": 6007,
      "name": "WrongBaseAmountOnCreation",
      "msg": "Wrong base amount on creation"
    },
    {
      "code": 6008,
      "name": "BaseTokenMustNotBeMintable",
      "msg": "Base token must not be mintable"
    },
    {
      "code": 6009,
      "name": "BaseTokenMustNotBeFreezable",
      "msg": "Base token must not be freezable"
    },
    {
      "code": 6010,
      "name": "WrongQuoteAmount",
      "msg": "Quote amount must be greater than 0"
    },
    {
      "code": 6011,
      "name": "WrongBaseAmount",
      "msg": "Base amount must be greater than 0"
    },
    {
      "code": 6012,
      "name": "InsufficientFund",
      "msg": "Insufficient fund"
    },
    {
      "code": 6013,
      "name": "UnknownToken",
      "msg": "One token should be Sol"
    },
    {
      "code": 6014,
      "name": "InvalidTokenPair",
      "msg": "Invalid token pair"
    },
    {
      "code": 6015,
      "name": "TooFewOutputTokens",
      "msg": "Too few output tokens"
    },
    {
      "code": 6016,
      "name": "TooMuchInputSol",
      "msg": "Too much input sol"
    },
    {
      "code": 6017,
      "name": "TooLowOuputSol",
      "msg": "Too low output sol"
    },
    {
      "code": 6018,
      "name": "ExceededMaxBuy",
      "msg": "Exceeded maximum buy amount"
    },
    {
      "code": 6019,
      "name": "BondingCurveIncomplete",
      "msg": "BondingCurve incomplete"
    },
    {
      "code": 6020,
      "name": "BondingCurveComplete",
      "msg": "BondingCurve complete"
    },
    {
      "code": 6021,
      "name": "BondingCurveAlreadyWithdrawn",
      "msg": "BondingCurve already withdrawn"
    }
  ],
  "metadata": {
    "address": "6GoM9tG1YyM5Uzyh3oRkG6A8WwxELU2NGjEQmTbiccyA"
  }
} as const;