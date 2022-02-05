import { ethers } from "ethers";
export var provider;
export var signer;
export const connectMetamask = async (
  accountChangedCallback,
  networkChangedCallback
) => {
  if (typeof window !== "undefined") {
    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask is NOT installed!");
      return { address: "no metamask", network: "no network" };
    } else {
      window.ethereum.on("accountsChanged", accountChangedCallback);
      window.ethereum.on("chainChanged", networkChangedCallback);
      provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      // Prompt user for account connections
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      const { chainId } = await provider.getNetwork();
      const chain = "0x" + chainId.toString(16);
      return { address: address, network: chain };
    }
  }
};

export const callContract = async (TokenURI, mintFailCallback) => {
  const pins2FNTAddress = "0xE628c67C735d927BaaC9c2ddd8AcED2c5246a386";

  const pins2NFTAbi =
    require("./Pins2NFT.json").abi;

  const pins2NFT_ro = new ethers.Contract(
    pins2FNTAddress,
    pins2NFTAbi,
    provider
  );
  const pins2NFT_rw = new ethers.Contract(pins2FNTAddress, pins2NFTAbi, signer);
  const balance = await pins2NFT_ro.name();
  try {
    const tx = await pins2NFT_rw.freeMint(signer.getAddress(), TokenURI);
    console.log("freemint", tx);
    const receipt = await tx.wait();
    console.log("wait", receipt);
    mintFailCallback("1");
    return receipt;
  } catch (e) {
    console.log("error", e);
    mintFailCallback("2");
    return {};
  }
};
