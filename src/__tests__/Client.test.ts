/**
 * APIClient tests: verify getPathV3 builds request URL with single encoding
 * (avoids double-encoding on iOS).
 */
import { APIClient } from "../api/Client";
import { Token } from "../types";

const mockToken: Token = {
  address: "0x0D2437F93Fed6EA64Ef01cCde385FB1263910C56",
  symbol: "pBTC",
  name: "Wrapped Bitcoin",
  decimals: 18,
  chainId: 3637,
};

const mockToken2: Token = {
  address: "0x29eE6138DD4C9815f46D34a4A1ed48F46758A402",
  symbol: "BTC",
  name: "Bitcoin",
  decimals: 18,
  chainId: 3637,
};

describe("APIClient getPathV3", () => {
  const baseUrl = "https://api.test";
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    APIClient.resetInstance();
    fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it("should build query with single-encoded array params (URLSearchParams)", async () => {
    const client = APIClient.getInstance({ baseUrl, timeout: 5000 });
    await client.getPathV3(
      mockToken,
      mockToken2,
      "812000000000",
      [1, 2],
      [1]
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(baseUrl);
    expect(url).toContain("/api/sdk/bestpath/split?");

    // Single encoding: typeId and sourceId as JSON strings, encoded once.
    // typeId=[1,2] -> JSON "[1,2]" -> typeId=%5B1%2C2%5D
    expect(url).toMatch(/typeId=%5B1%2C2%5D/);
    // sourceId=[1] -> sourceId=%5B1%5D
    expect(url).toMatch(/sourceId=%5B1%5D/);

    // Must not contain double-encoded pattern (e.g. %2522 from iOS double-encode)
    expect(url).not.toMatch(/%25/);
  });

  it("should include src, dest, and amount in query", async () => {
    const client = APIClient.getInstance({ baseUrl, timeout: 5000 });
    await client.getPathV3(
      mockToken,
      mockToken2,
      "812000000000",
      [1],
      [1]
    );

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("src=" + encodeURIComponent(mockToken.address));
    expect(url).toContain("dest=" + encodeURIComponent(mockToken2.address));
    expect(url).toContain("amount=812000000000");
  });
});
