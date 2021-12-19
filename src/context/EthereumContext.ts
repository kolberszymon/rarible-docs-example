import { createContext, useContext } from "react";
import Web3 from "web3";
import { IRaribleSdk } from "@rarible/sdk/build/domain";

type ContextProps = {
  provider: any;
  accounts: string[];
  web3: Web3 | null;
  currentAcc: string;
  sdk: IRaribleSdk | null;
};

export const EthereumContext = createContext<Partial<ContextProps>>({});
export const useEthContext = () => useContext(EthereumContext);
