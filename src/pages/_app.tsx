import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/index.css";
import { useState, useEffect } from "react";
import { EthereumWallet } from "@rarible/sdk-wallet";
import { Web3Ethereum } from "@rarible/web3-ethereum";
import { createRaribleSdk } from "@rarible/sdk";

import { IRaribleSdk } from "@rarible/sdk/build/domain";
import Web3 from "web3";
import { EthereumContext } from "../context/EthereumContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [provider, setProvider] = useState<any>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [currentAcc, setCurrentAcc] = useState<string>();
  const [web3, setWeb3] = useState<Web3 | null>();
  const [ethWallet, setEthWallet] = useState<EthereumWallet | null>();
  const [sdk, setSdk] = useState<IRaribleSdk | null>();

  useEffect(() => {
    if ((window as any).ethereum) {
      handleInit();
    }
  }, []);

  useEffect(() => {
    if (web3) {
      setCurrentlyConnectedAccount();
    }
  }, [web3]);

  const handleInit = () => {
    const { ethereum } = window as any;

    if (ethereum && ethereum.isMetaMask) {
      setProvider(ethereum);

      ethereum.on("accountsChanged", (accs: string[]) => {
        setAccounts(accs);
        setCurrentAcc(accs[0]);
      });

      const web3 = new Web3(ethereum);
      setWeb3(web3);

      const ethWallet = new EthereumWallet(ethereum);
      setEthWallet(ethWallet);
      setSdk(createRaribleSdk(ethWallet, "staging"));
    }
  };

  const setCurrentlyConnectedAccount = async () => {
    let accounts = await web3.eth.getAccounts();
    if (accounts && accounts.length > 0) {
      console.log(accounts[0]);
      setCurrentAcc(accounts[0]);
    }
  };

  return (
    <EthereumContext.Provider
      value={{
        provider,
        accounts,
        web3,
        currentAcc,
        sdk,
      }}
    >
      <Head>
        <title>NextJS TailwindCSS TypeScript Starter</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </EthereumContext.Provider>
  );
}

export default MyApp;
