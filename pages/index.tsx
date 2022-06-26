import type { NextPage } from "next";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractWrite, useProvider } from "wagmi";
import { create } from "ipfs-http-client";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { storeClip } from "./storeClip";
import isURL from 'validator/lib/isURL';

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

export const uploadToIPFS = async (data: any) => {
  return await client.add(JSON.stringify(data));
};

const contractStoreAbi = [{ "inputs": [], "name": "AlreadyRegistered", "type": "error" }, { "inputs": [], "name": "WrongLength", "type": "error" }, { "inputs": [{ "internalType": "string", "name": "code", "type": "string" }], "name": "retrieve", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "code", "type": "string" }, { "internalType": "string", "name": "ipfs", "type": "string" }], "name": "store", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];

const contractRetrieveAbi = [{ "inputs": [], "name": "AlreadyRegistered", "type": "error" }, { "inputs": [], "name": "WrongLength", "type": "error" }, { "inputs": [{ "internalType": "string", "name": "code", "type": "string" }], "name": "retrieve", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "code", "type": "string" }, { "internalType": "string", "name": "ipfs", "type": "string" }], "name": "store", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];

const contractAddress = "0x42F75D7C3af9e43EE4F364659d0744404cf6Cfc5".toLowerCase();

const retrieveClip = async (code: string, provider: ethers.Signer | ethers.providers.Provider) => {
  const contract = new ethers.Contract(contractAddress, contractRetrieveAbi, provider);
  return await contract.retrieve(code);
}

const Home: NextPage = () => {
  const { data } = useAccount();
  const [clipInput, setClipInput] = useState<string>("");
  const [clipOutput, setClipOutput] = useState<string | null>(null);
  const [cid, setCID] = useState<string>();
  const [status, setStatus] = useState<string | boolean>(false);
  const provider = useProvider();
  const { writeAsync: writeContract } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractStoreAbi,
      signerOrProvider: provider,
    },
    "store",
    {
      args: [clipOutput, cid]
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
          const clipRegex = new RegExp(/^[\dA-Za-z]{5}$/);
          if (clipInput.match(clipRegex)) {
            setStatus("Querying code");
            const cid = await retrieveClip(clipInput, provider);
            setStatus("Getting clip");
            const clip = await fetch("https://ipfs.interclip.app/ipfs/"+cid).catch(e => {toast.error(e)});
            if (clip) {
              const url: string | undefined = (await clip.json())?.url;

              if (!url) {
                toast.error("Invalid clip format");
                return false;
              }

              setClipOutput(url);

            }
            setStatus(false);
          } else if(isURL(clipInput)) {
            return await storeClip(setStatus, clipInput, data, setCID, setClipOutput, writeContract);
          } else {
            toast.error("This is neither a code nor a valid URL");
            return false;
          }
        }}
        className="flex justify-center items-center"
      >
        <input
          autoFocus
          className="mt-12 w-1/2 rounded-2xl px-3 py-2 text-3xl text-black dark:text-dark-text text-center"
          onChange={(e) => setClipInput(e.target.value)}
          placeholder="https://lenster.xyz"
          type="text"
          value={clipInput}
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
            {clipOutput &&
              (
                <span
                  title={"Your clip code"}
                  className={`p-3 text-6xl flex justify-center gap-2`}
                  style={{
                    fontFamily: "Roboto Mono, monospace"
                  }}
                >
                  {clipOutput}
                  <svg onClick={async () => {
                    await navigator.clipboard.writeText(clipOutput!);
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
