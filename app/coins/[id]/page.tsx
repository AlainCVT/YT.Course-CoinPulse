import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { fetcher, getPools } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import LiveDataWrapper from "@/components/LiveDataWrapper";
import Converter from "@/components/Converter";

export async function generateMetadata({ params }: NextPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const coin = await fetcher<CoinDetailsData>(`/coins/${id}`, {
      dex_pair_format: "symbol",
    });
    const name = `${coin.name} (${coin.symbol.toUpperCase()}) Price`;
    const description = `Follow the live ${coin.name} (${coin.symbol.toUpperCase()}) price, market cap, trading volume, and price chart on CoinPulse.`;

    return {
      title: name,
      description,
      openGraph: {
        title: `${name} | CoinPulse`,
        description,
        images: [coin.image.large],
      },
      twitter: {
        card: "summary",
        title: `${name} | CoinPulse`,
        description,
        images: [coin.image.large],
      },
    };
  } catch (error) {
    console.error(
      `Error generating metadata for coin ${id}:`,
      error instanceof Error ? error.message : error,
    );
    return {
      title: `${id} Price`,
      description: `View cryptocurrency market data and price information for ${id} on CoinPulse.`,
    };
  }
}

export default async function CoinID({ params }: NextPageProps) {
  const { id } = await params;

  const [coinData, coinOHLCData] = await Promise.all([
    fetcher<CoinDetailsData>(`/coins/${id}`, {
      dex_pair_format: "symbol",
    }).catch(
      (error) =>
        new Error(
          `Error fetching coin overview: ${error instanceof Error ? error.toString() : JSON.stringify(error)}`,
        ),
    ),
    fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
      vs_currency: "usd",
      days: 1,
      // interval: "hourly", // CoinGecko demo API now disallow the interval
      precision: "full",
    }).catch(
      (error) =>
        new Error(
          `Error fetching coin OHLC data: ${error instanceof Error ? error.toString() : JSON.stringify(error)}`,
        ),
    ),
  ]);

  if (coinData instanceof Error) {
    console.error(coinData.message);
    return <></>;
  }

  if (coinOHLCData instanceof Error) {
    console.error(coinOHLCData.message);
    return <></>;
  }

  const platform = coinData.asset_platform_id
    ? (coinData.detail_platforms?.[coinData.asset_platform_id] ?? null)
    : null;
  const network = platform?.geckoterminal_url.split("/")[3] || null;
  const contractAddress = platform?.contract_address || null;

  const pool = await getPools(id, network, contractAddress);

  const coinDetails: CoinDetail[] = [
    {
      label: "Market Cap",
      value: formatCurrency(coinData.market_data.market_cap.usd),
    },
    {
      label: "Market Cap Rank",
      value: `# ${coinData.market_cap_rank}`,
    },
    {
      label: "Total Volume",
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: "Website",
      value: "-",
      link: coinData.links.homepage[0],
      linkText: "Homepage",
    },
    {
      label: "Explorer",
      value: "-",
      link: coinData.links.blockchain_site[0],
      linkText: "Explorer",
    },
    {
      label: "Community",
      value: "-",
      link: coinData.links.subreddit_url,
      linkText: "Community",
    },
  ];

  return (
    <main id="coin-details-page">
      <section className="primary">
        <LiveDataWrapper coinId={id} poolId={pool.id} coin={coinData} coinOHLCData={coinOHLCData}>
          <h4>Exchange Listings</h4>
        </LiveDataWrapper>
        <h1 className="text-3xl font-bold">
          Coin <strong>{id}</strong>
        </h1>
        <p>Trend Overview</p>
        <p>Exchange Listings</p>
      </section>
      <section className="secondary">
        <Converter
          symbol={coinData.symbol}
          icon={coinData.image.small}
          priceList={coinData.market_data.current_price}
        />
        <div className="details">
          <h4>Coin Details</h4>
          <ul className="details-grid">
            {coinDetails.map(({ label, value, link, linkText }, index) => (
              <li key={index}>
                <p className={label}>{label}</p>
                {link ? (
                  <div className="link">
                    <Link href={link} target="_blank">
                      {linkText || label}
                    </Link>
                    <ArrowUpRight size={16} />
                  </div>
                ) : (
                  <p className="text-base font-medium">{value}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
