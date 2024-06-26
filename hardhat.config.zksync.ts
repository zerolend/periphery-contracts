import { HardhatUserConfig } from 'hardhat/types';
import { accounts } from './helpers/test-wallets';
import { NETWORKS_RPC_URL } from './helper-hardhat-config';

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import '@tenderly/hardhat-tenderly';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-dependency-compiler';
import 'hardhat-deploy';

import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_BLOCK_GAS_LIMIT = 12450000;
const MAINNET_FORK = process.env.MAINNET_FORK === 'true';
const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT || '';
const TENDERLY_USERNAME = process.env.TENDERLY_USERNAME || '';
const TENDERLY_FORK_NETWORK_ID = process.env.TENDERLY_FORK_NETWORK_ID || '1';
const REPORT_GAS = process.env.REPORT_GAS === 'true';

const mainnetFork = MAINNET_FORK
  ? {
      blockNumber: 12012081,
      url: NETWORKS_RPC_URL['main'],
    }
  : undefined;

// export hardhat config
const config: HardhatUserConfig = {
  defaultNetwork: 'zkSyncTestnet',
  zksolc: {
    version: '1.3.13',
    settings: {
      libraries: {
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol': {
          BridgeLogic: '0x6CDe8a8cEE9771A30dE4fEAB8eaccb58cb0d30aF',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/ConfiguratorLogic.sol': {
          ConfiguratorLogic: '0x8731d4E5b990025143609F4A40eC80Fb482E46A0',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/PoolLogic.sol': {
          PoolLogic: '0xA8D16FB0620E3376093cb89e2cD9dEF9fE47Daaa',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol': {
          EModeLogic: '0xD84E953a621bb9D81Dc998E0b1482D2916153c23',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/LiquidationLogic.sol': {
          LiquidationLogic: '0x1962271C81e9734dC201312350a1D19351B7C4Ac',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol': {
          SupplyLogic: '0x9223dC9205Cf8336CA59bA0bD390647E62D487E5',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol': {
          FlashLoanLogic: '0xBD93e7f228d56ACd10182D1C92283809e8521633',
        },
        '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol': {
          BorrowLogic: '0x81D6b98Beb0A4288dCFab724FDeaE52E5Aa2F7b1',
        },
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.12',
        settings: {
          optimizer: { enabled: true, runs: 25000 },
          evmVersion: 'london',
        },
      },
      {
        version: '0.8.10',
        settings: {
          optimizer: { enabled: true, runs: 25000 },
          evmVersion: 'london',
        },
      },
    ],
  },
  tenderly: {
    project: TENDERLY_PROJECT,
    username: TENDERLY_USERNAME,
    forkNetwork: TENDERLY_FORK_NETWORK_ID,
  },
  typechain: {
    outDir: 'types',
    externalArtifacts: [
      'node_modules/@zerolendxyz/core-v3/artifacts/contracts/**/*[!dbg].json',
      'node_modules/@zerolendxyz/core-v3/artifacts/contracts/**/**/*[!dbg].json',
      'node_modules/@zerolendxyz/core-v3/artifacts/contracts/**/**/**/*[!dbg].json',
      'node_modules/@zerolendxyz/core-v3/artifacts/contracts/mocks/tokens/WETH9Mocked.sol/WETH9Mocked.json',
    ],
  },
  gasReporter: {
    enabled: REPORT_GAS ? true : false,
    coinmarketcap: process.env.COINMARKETCAP_API,
  },
  networks: {
    hardhat: {
      hardfork: 'berlin',
      blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
      gas: DEFAULT_BLOCK_GAS_LIMIT,
      gasPrice: 8000000000,
      chainId: 31337,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
      forking: mainnetFork,
      allowUnlimitedContractSize: true,
      zksync: false,
    },
    zkSyncTestnet: {
      url: 'https://testnet.era.zksync.dev',
      ethNetwork: 'goerli', // or a Goerli RPC endpoint from Infura/Alchemy/Chainstack etc.
      zksync: true,
    },
    ganache: {
      url: 'http://ganache:8545',
      accounts: {
        mnemonic: 'fox sight canyon orphan hotel grow hedgehog build bless august weather swarm',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
  },
  mocha: {
    timeout: 80000,
    bail: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    aclAdmin: {
      default: 0,
    },
    emergencyAdmin: {
      default: 0,
    },
    poolAdmin: {
      default: 0,
    },
    addressesProviderRegistryOwner: {
      default: 0,
    },
    treasuryProxyAdmin: {
      default: 1,
    },
    incentivesProxyAdmin: {
      default: 1,
    },
    incentivesEmissionManager: {
      default: 0,
    },
    incentivesRewardsVault: {
      default: 2,
    },
  },
  // Need to compile aave-v3 contracts due no way to import external artifacts for hre.ethers
  dependencyCompiler: {
    paths: [
      '@zerolendxyz/core-v3/contracts/protocol/configuration/PoolAddressesProviderRegistry.sol',
      '@zerolendxyz/core-v3/contracts/protocol/configuration/PoolAddressesProvider.sol',
      '@zerolendxyz/core-v3/contracts/misc/AaveOracle.sol',
      '@zerolendxyz/core-v3/contracts/protocol/tokenization/AToken.sol',
      '@zerolendxyz/core-v3/contracts/protocol/tokenization/DelegationAwareAToken.sol',
      '@zerolendxyz/core-v3/contracts/protocol/tokenization/StableDebtToken.sol',
      '@zerolendxyz/core-v3/contracts/protocol/tokenization/VariableDebtToken.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/GenericLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/ValidationLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/ReserveLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol',
      '@zerolendxyz/core-v3/contracts/protocol/pool/Pool.sol',
      '@zerolendxyz/core-v3/contracts/protocol/pool/PoolConfigurator.sol',
      '@zerolendxyz/core-v3/contracts/protocol/pool/DefaultReserveInterestRateStrategy.sol',
      '@zerolendxyz/core-v3/contracts/dependencies/openzeppelin/upgradeability/InitializableAdminUpgradeabilityProxy.sol',
      '@zerolendxyz/core-v3/contracts/protocol/libraries/aave-upgradeability/InitializableImmutableAdminUpgradeabilityProxy.sol',
      '@zerolendxyz/core-v3/contracts/deployments/ReservesSetupHelper.sol',
      '@zerolendxyz/core-v3/contracts/misc/AaveProtocolDataProvider.sol',
      '@zerolendxyz/core-v3/contracts/protocol/configuration/ACLManager.sol',
      '@zerolendxyz/core-v3/contracts/dependencies/weth/WETH9.sol',
      '@zerolendxyz/core-v3/contracts/mocks/helpers/MockIncentivesController.sol',
      '@zerolendxyz/core-v3/contracts/mocks/helpers/MockReserveConfiguration.sol',
      '@zerolendxyz/core-v3/contracts/mocks/oracle/CLAggregators/MockAggregator.sol',
      '@zerolendxyz/core-v3/contracts/mocks/tokens/MintableERC20.sol',
      '@zerolendxyz/core-v3/contracts/mocks/flashloan/MockFlashLoanReceiver.sol',
      '@zerolendxyz/core-v3/contracts/mocks/tokens/WETH9Mocked.sol',
      '@zerolendxyz/core-v3/contracts/mocks/upgradeability/MockVariableDebtToken.sol',
      '@zerolendxyz/core-v3/contracts/mocks/upgradeability/MockAToken.sol',
      '@zerolendxyz/core-v3/contracts/mocks/upgradeability/MockStableDebtToken.sol',
      '@zerolendxyz/core-v3/contracts/mocks/upgradeability/MockInitializableImplementation.sol',
      '@zerolendxyz/core-v3/contracts/mocks/helpers/MockPool.sol',
      '@zerolendxyz/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol',
      '@zerolendxyz/core-v3/contracts/mocks/oracle/PriceOracle.sol',
      '@zerolendxyz/core-v3/contracts/mocks/tokens/MintableDelegationERC20.sol',
    ],
  },
  external: {
    contracts: [
      {
        artifacts: './temp-artifacts',
        deploy: 'node_modules/@zerolendxyz/deploy-v3/dist/deploy',
      },
    ],
  },
};

export default config;
