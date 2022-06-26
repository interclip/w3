import { Dispatch, SetStateAction } from "react";
import { UserRejectedRequestError } from "wagmi";
import { getClipHash } from "../lib/generateID";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { GetAccountResult } from "@wagmi/core";
import { uploadToIPFS } from "./index";

export const storeClip = async (setStatus: Dispatch<SetStateAction<string | boolean>>, clipURL: string, data: GetAccountResult<ethers.providers.BaseProvider> | undefined, setCID: Dispatch<SetStateAction<string | undefined>>, setCode: Dispatch<SetStateAction<string | null>>, writeContract: any) => {
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
  const transaction = await writeContract({ args: [clipHash, cid] }).catch((e: any) => {
    if (e instanceof UserRejectedRequestError) {
      toast("You denied the request from your wallet.");
    } else {
      throw e;
    }
  });

  if (!transaction) {
    setStatus(false);
    setCode(null);
    return;
  }

  setStatus("Adding clip onto the blockchain");
  await transaction.wait(1);
  setStatus(false);

  return false;
};
