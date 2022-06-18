import type { NextPage } from "next";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { create } from "ipfs-http-client";
import { getClipHash } from "../lib/generateID";

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const uploadToIPFS = async (data: any) => {
  return await client.add(JSON.stringify(data));
};

const Home: NextPage = () => {
  const { data } = useAccount();
  const [clipURL, setURL] = useState<string>("");
  const clipHash = clipURL && getClipHash(clipURL).slice(0, 5);
  const [cid, setCID] = useState<string>();
  const [status, setStatus] = useState<string | boolean>(false);
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
          setCID(
            (
              await uploadToIPFS({
                url: clipURL,
                code: clipHash,
                owner: data?.address || undefined,
              })
            ).path
          );
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
                {clipHash}
              </span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

