import { fetchSwapRoute } from "../common/FetchSwapRoute";
import { createPublicClient, http, defineChain } from "viem";
import { getRpcConfig } from "../constants";

const realFetch = globalThis.fetch;

beforeEach(() => {
  jest.restoreAllMocks();
  if (realFetch && typeof realFetch === 'function') {
    global.fetch = realFetch as any;
  }
});

describe("Main.ts Example Integration Test", () => {
  const srcToken = {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as `0x${string}`,
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 18,
    chainId: 3637,
  };

  const dstToken = {
    address: "0x29eE6138DD4C9815f46D34a4A1ed48F46758A402" as `0x${string}`,
    symbol: "USDC.e",
    name: "Bridged USDC (Stargate)",
    decimals: 6,
    chainId: 3637,
  };

  const amountIn = "1.5";

  jest.setTimeout(30000);

  it("should fetch swap route with default publicClient (auto-created)", async () => {
    const apiKey = process.env.NEXT_PUBLIC_BITZY_API_KEY;
    
    if (!apiKey) {
      return;
    }

    const result = await fetchSwapRoute({
      amountIn,
      srcToken,
      dstToken,
      chainId: 3637,
    });

    expect(result).toBeDefined();
    expect(result.routes).toBeDefined();
    expect(result.routes.length).toBeGreaterThan(0);
    expect(result.amountOutBN).toBeDefined();
    expect(result.distributions).toBeDefined();
    expect(result.isAmountOutError).toBe(false);
  });

  it("should fetch swap route with injected publicClient (via fetchSwapRoute config)", async () => {
    const apiKey = process.env.NEXT_PUBLIC_BITZY_API_KEY;
    
    if (!apiKey) {
      return;
    }

    const rpcConfig = getRpcConfig(3637);
    
    if (!rpcConfig) {
      throw new Error("RPC config not found for chainId 3637");
    }

    const injectedPublicClient = createPublicClient({
      chain: defineChain({
        id: 3637,
        name: rpcConfig.name,
        network: rpcConfig.name.toLowerCase().replace(/\s+/g, "-"),
        nativeCurrency: rpcConfig.nativeCurrency,
        rpcUrls: {
          default: { http: rpcConfig.rpcUrls },
          public: { http: rpcConfig.rpcUrls },
        },
      }),
      transport: http(),
    });

    const result = await fetchSwapRoute(
      {
        amountIn,
        srcToken,
        dstToken,
        chainId: 3637,
      },
      {
        publicClient: injectedPublicClient,
        headers: {
          "authen-key": apiKey,
        },
      }
    );

    expect(result).toBeDefined();
    expect(result.routes).toBeDefined();
    expect(result.routes.length).toBeGreaterThan(0);
    expect(result.amountOutBN).toBeDefined();
    expect(result.distributions).toBeDefined();
    expect(result.isAmountOutError).toBe(false);
  });

  it("should use environment variable for API key authentication", async () => {
    const apiKey = process.env.NEXT_PUBLIC_BITZY_API_KEY;
    
    if (!apiKey) {
      return;
    }

    const result = await fetchSwapRoute({
      amountIn,
      srcToken,
      dstToken,
      chainId: 3637,
    });

    expect(result).toBeDefined();
    expect(result.routes).toBeDefined();
    expect(result.routes.length).toBeGreaterThan(0);
  });
});
