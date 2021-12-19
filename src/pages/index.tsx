import { PrepareBurnRequest } from "@rarible/sdk/build/types/nft/burn/domain";
import { useEffect, useState } from "react";
import { PrepareMintRequest } from "@rarible/sdk/build/types/nft/mint/prepare-mint-request.type";
import {
  toUnionAddress,
  toContractAddress,
  toItemId,
  toOrderId,
} from "@rarible/types";
import MetaMaskButton from "../components/metaMaskButton";
import { useSdk } from "../sdk/use-sdk";
import { EthereumWallet } from "@rarible/sdk-wallet";
import {
  PrepareOrderRequest,
  PrepareOrderUpdateRequest,
} from "@rarible/sdk/build/types/order/common";
import { PrepareFillRequest } from "@rarible/sdk/build/types/order/fill/domain";
import { CancelOrderRequest } from "@rarible/sdk/build/types/order/cancel/domain";
import {
  EthEthereumAssetType,
  EthErc20AssetType,
} from "@rarible/api-client/build/models/AssetType";
import { PrepareTransferRequest } from "@rarible/sdk/build/types/nft/transfer/domain";
import { MintAndSellRequest } from "@rarible/sdk/build/types/nft/mint-and-sell/domain";
import { PreprocessMetaRequest } from "@rarible/sdk/build/types/nft/mint/preprocess-meta";
import { Blockchain } from "@rarible/api-client/build/models/Blockchain";
import { CommonTokenMetadata } from "@rarible/sdk/build/types/nft/mint/preprocess-meta";

export default function Home() {
  const { sdk, connect, wallet } = useSdk("staging");

  const [message, setMessage] = useState<string>();
  const [uri, setUri] = useState<string>(
    "ipfs:/QmWLsBu6nS4ovaHbGAXprD1qEssJu4r5taQfB74sCG51tp"
  );
  const [supply, setSupply] = useState<number>(1);

  const getItems = async () => {
    const items = await sdk.apis.item.getItemsByCreator({
      creator: "ETHEREUM:0x79Ea2d536b5b7144A3EabdC6A7E43130199291c0",
    });

    console.log(items);
    setMessage("Done! Check console :)");
  };

  const mintItem = async () => {
    // Union address is created from
    // 1. Blockchain name
    // 2. Hex Address
    // e.g. ETHEREUM:0xB0EA149212Eb707a1E5FC1D2d3fD318a8d94cf05 😎

    // const genTokenIdReq: GenerateTokenIdRequest = {
    //   collection: toUnionAddress(
    //     "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"
    //   ),
    //   minter: toUnionAddress(
    //     "ETHEREUM:0x79Ea2d536b5b7144A3EabdC6A7E43130199291c0"
    //   ),
    // };

    // const tokenIdResponse = await sdk.nft.generateTokenId(genTokenIdReq);

    const currentWallet = wallet as EthereumWallet;
    const makerAccount = await currentWallet.ethereum.getFrom();
    console.log(makerAccount);

    const mintRequest: PrepareMintRequest = {
      collectionId: toContractAddress(
        "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"
      ),
    };

    console.log(mintRequest);

    const mintResponse = await sdk.nft.mint(mintRequest);

    console.log(mintResponse);

    const response = await mintResponse.submit({
      uri,
      supply,
      lazyMint: true,
      creators: [
        {
          account: toUnionAddress(`ETHEREUM:${makerAccount}`),
          value: 10000,
        },
      ],
      royalties: [],
    });

    console.log(response);
  };

  const mintAndSell = async () => {
    const currentWallet = wallet as EthereumWallet;
    const makerAccount = await currentWallet.ethereum.getFrom();

    const mintRequest: PrepareMintRequest = {
      collectionId: toContractAddress(
        "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82"
      ),
    };

    const price: number = 1;
    const ethCurrency: EthErc20AssetType = {
      "@type": "ERC20",
      contract: toContractAddress(
        "ETHEREUM:0xc778417e063141139fce010982780140aa0cd5ab"
      ),
    };

    const mintResponse = await sdk.nft.mintAndSell(mintRequest);

    console.log(mintResponse);

    const response = await mintResponse.submit({
      uri,
      supply: 1,
      lazyMint: true,
      price,
      creators: [
        {
          account: toUnionAddress(`ETHEREUM:${makerAccount}`),
          value: 10000,
        },
      ],
      currency: ethCurrency,
    });

    console.log(response);
  };

  const createSellOrder = async () => {
    const tokenUnionAddress =
      "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82:55143609719300586327244080327388661151936544170854464635146779205246455382052";
    const ethCurrency: EthEthereumAssetType = {
      "@type": "ETH",
    };
    const price: number = 1;
    const amount: number = 1;

    const orderRequest: PrepareOrderRequest = {
      itemId: toItemId(tokenUnionAddress),
    };

    const orderResponse = await sdk.order.sell(orderRequest);

    // You can extract info about properties from orderResponse e.g.
    // 1. Base fee
    // 2. Max Amount
    // etc.

    const response = await orderResponse.submit({
      price,
      amount,
      currency: ethCurrency,
    });

    console.log(response);
  };

  const updateSellOrder = async () => {
    /**
     * @param {orderId}
     */

    const price: number = 0.1;
    const ethCurrency: EthEthereumAssetType = {
      "@type": "ETH",
    };

    const orderId =
      "ETHEREUM:0x6e794fd04bcf21ee7f347874aefdf36ec1a7b73b5694760b367a7644765a6368";

    const updateOrderRequest: PrepareOrderUpdateRequest = {
      orderId: toOrderId(orderId),
    };

    const updateResponse = await sdk.order.sellUpdate(updateOrderRequest);

    const response = await updateResponse.submit({
      price,
    });

    console.log(response);
  };

  const fillSellOrder = async () => {
    const orderId: string =
      "ETHEREUM:0x6e794fd04bcf21ee7f347874aefdf36ec1a7b73b5694760b367a7644765a6368";

    const fillRequest: PrepareFillRequest = {
      orderId: toOrderId(orderId),
    };

    const fillResponse = await sdk.order.fill(fillRequest);

    const response = await fillResponse.submit({
      amount: 1,
    });

    console.log(response);
  };

  const createBidOffer = async () => {
    const tokenUnionAddress =
      "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82:55143609719300586327244080327388661151936544170854464635146779205246455382052";
    const ethCurrency: EthErc20AssetType = {
      "@type": "ERC20",
      contract: toContractAddress(
        "ETHEREUM:0xc778417e063141139fce010982780140aa0cd5ab"
      ),
    };

    const price: number = 1;
    const amount: number = 1;

    const orderRequest: PrepareOrderRequest = {
      itemId: toItemId(tokenUnionAddress),
    };

    const bidResponse = await sdk.order.bid(orderRequest);

    const response = await bidResponse.submit({
      amount,
      price,
      currency: ethCurrency,
    });

    console.log("Create bid offer ", response);
  };

  const updateBidOffer = async () => {
    const bidOrderId =
      "ETHEREUM:0x27b554bdf22fe72e89f113e9523e8d8a75fb4477d455e100dc2bb132e7f51682";
    const price: number = 2;

    const updateBidRequest: PrepareOrderUpdateRequest = {
      orderId: toOrderId(bidOrderId),
    };

    const updateResponse = await sdk.order.bidUpdate(updateBidRequest);

    const response = await updateResponse.submit({
      price,
    });

    console.log(response);
  };

  const cancelOrder = async () => {
    const bidOrderId =
      "ETHEREUM:0x27b554bdf22fe72e89f113e9523e8d8a75fb4477d455e100dc2bb132e7f51682";

    const cancelOrderRequest: CancelOrderRequest = {
      orderId: toOrderId(bidOrderId),
    };

    const cancelResponse = await sdk.order.cancel(cancelOrderRequest);

    console.log(cancelResponse);
  };

  const transferToken = async () => {
    const tokenId =
      "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82:55143609719300586327244080327388661151936544170854464635146779205246455382052";

    const transferRequest: PrepareTransferRequest = {
      itemId: toItemId(tokenId),
    };

    const transferResponse = await sdk.nft.transfer(transferRequest);

    const response = await transferResponse.submit({
      to: toUnionAddress("ETHEREUM:0x79Ea2d536b5b7144A3EabdC6A7E43130199291c0"),
    });

    console.log(response);
  };

  const burnToken = async () => {
    const tokenId =
      "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82:55143609719300586327244080327388661151936544170854464635146779205246455382052";

    const burnRequest: PrepareBurnRequest = {
      itemId: toItemId(tokenId),
    };

    const burnResponse = await sdk.nft.burn(burnRequest);

    const response = await burnResponse.submit();

    console.log(response);
  };

  const preprocessTokenMeta = async () => {
    const blockchain = Blockchain.ETHEREUM;
    const metadata: CommonTokenMetadata = {
      name: "Hey",
      description: undefined,
      image: undefined,
      animationUrl: undefined,
      externalUrl: undefined,
      attributes: [],
    };

    const request: PreprocessMetaRequest = {
      blockchain,
      ...metadata,
    };

    const response = await sdk.nft.preprocessMeta(request);

    console.log(response);
  };

  return (
    <div className="container flex items-center p-4 mx-auto h-screen justify-center">
      {!sdk || !wallet ? (
        <MetaMaskButton onClick={connect} />
      ) : (
        <main className="flex flex-col items-center justify-around font-mono h-1/2">
          <div>
            <h1 className=" text-xl code">
              Welcome to{" "}
              <span className="text-purple-700">Rarible sdk tutorial :)</span>{" "}
              <br />
            </h1>
            <span>{`Rarible SDK initialised ${sdk ? "✅" : "❌"}`}</span>
          </div>
          <div className="flex items-center justify-center w-full mt-10 text-sm gap-4 flex-wrap">
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => getItems()}
            >
              Get items by creator
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => mintItem()}
            >
              Mint an item
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => createSellOrder()}
            >
              Create a Sell Order
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => updateSellOrder()}
            >
              Update sell order
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => fillSellOrder()}
            >
              Fill sell order
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => createBidOffer()}
            >
              Create bid offer
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => updateBidOffer()}
            >
              Update bid offer
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => cancelOrder()}
            >
              Cancel bid offer
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => transferToken()}
            >
              Transfer token
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => mintAndSell()}
            >
              Mint & sell
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => burnToken()}
            >
              Burn token
            </button>
            <button
              className="rounded-md py-2 px-4 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => preprocessTokenMeta()}
            >
              Preprocess
            </button>
          </div>
          {message}
        </main>
      )}
    </div>
  );
}
