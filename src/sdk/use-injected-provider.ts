import { useCallback, useEffect, useState } from "react";
import { Maybe } from "../common/maybe";

type UseProviderResponse = {
  provider: Maybe<any>;
  connect: () => void;
  account: Maybe<string>;
};

export function useInjectedProvider(): UseProviderResponse {
  const [provider, setProvider] = useState<Maybe<any>>();
  const [account, setAccount] = useState<Maybe<string>>();

  useEffect(() => {
    const handleProviderSetup = async () => {
      const provider = getInjectedProvider();
      console.log(provider);
      if (provider) {
        setProvider(provider);

        const accounts = await provider.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }

        provider.on("accountsChanged", (accs: any) => {
          const [currentAccount] = accs;
          setAccount(currentAccount);
        });
      }
    };

    handleProviderSetup();
  }, []);

  // Provider.enable() is depracated -> https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods
  // FROM DOCS: Use ethereum.request({ method: 'eth_requestAccounts' }) instead.
  // await provider.enable();

  const connect = useCallback(() => {
    const handleRequestProvider = async () => {
      if (provider === undefined) {
        alert("no provider found");
      } else {
        await provider.request({ method: "eth_requestAccounts" });

        const accounts = await provider.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };

    handleRequestProvider();
  }, [provider]);

  return { provider, connect, account };
}

function getInjectedProvider(): Maybe<any> {
  if ((window as any).ethereum) {
    const { ethereum } = window as any;
    return ethereum;
  } else {
    alert("Please install Metamask");
    return undefined;
  }
}
