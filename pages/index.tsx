import type { NextPage } from "next";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContract, useContractWrite, useProvider } from "wagmi";
import { create } from "ipfs-http-client";
import { getClipHash } from "../lib/generateID";
import { getContract } from "@wagmi/core";

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const uploadToIPFS = async (data: any) => {
  return await client.add(JSON.stringify(data));
};

const contractAbi = [
  { inputs: [], name: "AlreadyRegistered", type: "error" },
  { inputs: [], name: "WrongLength", type: "error" },
  {
    inputs: [{ internalType: "string", name: "code", type: "string" }],
    name: "retrieve",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "code", type: "string" },
      { internalType: "string", name: "ipfs", type: "string" },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Home: NextPage = () => {
  const { data } = useAccount();
  const [clipURL, setURL] = useState<string>("");
  const [code, setCode] = useState<string | null>(null);
  const [cid, setCID] = useState<string>();
  const [status, setStatus] = useState<string | boolean>(false);
  const provider = useProvider();
  const { data: contractData, isError: contractIsError, isLoading: contractIsLoading, writeAsync: writeContract }  = useContractWrite(
    {
      addressOrName: "0xb3bEC15056BD6ED275B261342BeDc666C38e1007",
      contractInterface: contractAbi,
      signerOrProvider: provider,
    },
    "store",
    {
      args: [code, cid]
    }
  );
  return (
    <div className="py-6 justify-center text-center">
      <div className="flex justify-center">
        <ConnectButton
          showBalance={false}
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>

      <h1 className="text-4xl font-bold mt-6">
        Interclip <sub className="text-xl">on Polygon</sub>
      </h1>
      <form
        action="#"
        method="GET"
        onSubmit={async () => {
          setStatus("Uploading to IPFS");
          const creation = new Date().toISOString();
          const clipHash = getClipHash(
            `${clipURL}-${creation}-${data?.address || "anon"}`
          ).slice(0, 5);
          const cid = (
            await uploadToIPFS({
              url: clipURL,
              code: clipHash,
              createdAt: creation,
              owner: data?.address || undefined,
            })
          ).path;
          setCID(cid);
          setCode(clipHash);

          setStatus("Executing contract");
          await writeContract({args: [clipHash, cid]});
          setStatus(false);

          return false;
        }}
        className="flex justify-center items-center"
      >
        <input
          autoFocus
          className="mt-12 w-1/2 rounded-2xl px-3 py-2 text-3xl text-black dark:text-dark-text"
          onChange={(e) => setURL(e.target.value)}
          placeholder="https://lenster.xyz"
          type="url"
          value={clipURL}
        />
      </form>
      <div className="flex flex-col text-xl">
        {status ? (
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            {status} <br />
            <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
          </div>
        ) : (
          <>
            <span className="p-3">CID: {cid}</span>
            <br />
            <span>
              Code:
              <span
                title={
                  cid
                    ? "Your clip code"
                    : "First create the clip to use this code"
                }
                className={`p-3 ${!cid ? "text-red-600" : ""}`}
              >
                {code}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

