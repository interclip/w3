import type { NextPage } from "next";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractWrite, useProvider } from "wagmi";
import { create } from "ipfs-http-client";
import { getClipHash } from "../lib/generateID";
import toast from "react-hot-toast";

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
  const { writeAsync: writeContract } = useContractWrite(
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
              owner: data?.address,
            })
          ).path;
          setCID(cid);
          setCode(clipHash);

          setStatus("Executing contract");
          const transaction = await writeContract({ args: [clipHash, cid] });

          setStatus("Adding clip onto the blockchain");
          await transaction.wait(1);
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
      <div className="flex flex-col gap-6 mt-12">
        {status ? (
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            {status} <br />
            <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
          </div>
        ) : (
          <>
            {code &&
              (
                <span
                  title={"Your clip code"}
                  className={`p-3 text-6xl flex justify-center gap-2`}
                  style={{
                    fontFamily: "Roboto Mono, monospace"
                  }}
                >
                  {code}
                  <svg onClick={async () => {
                    await navigator.clipboard.writeText(code!);
                    toast.success("Copied to clipboard!");
                  }} xmlns="http://www.w3.org/2000/svg" className="cursor-pointer h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </span>
              )
            }
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

