import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { fetcher } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import DataTable from "@/components/DataTable";
import CoinsPagination from "@/components/coins/CoinsPagination";

const COUNT_PER_PAGE = 10;

export const metadata: Metadata = {
  title: "Cryptocurrency Prices",
  description:
    "Browse cryptocurrency prices by market capitalization. Compare live prices, 24-hour changes, and market caps for the leading digital assets.",
  openGraph: {
    title: "Cryptocurrency Prices | CoinPulse",
    description:
      "Compare live cryptocurrency prices, 24-hour changes, and market caps for the leading digital assets.",
  },
};

const COINS_MARKETS_COLUMNS_BASE = {
  rank: {
    header: "Rank",
    cellClassName: "rank-cell",
  },
  token: {
    header: "Token",
    cellClassName: "token-cell",
  },
  price: {
    header: "Price",
    cellClassName: "price-cell",
  },
  change: {
    header: "24h Change",
    cellClassName: "change-cell",
  },
  "market-cap": {
    header: "Market Cap",
    cellClassName: "market-cap-cell",
  },
} satisfies Record<string, DataTableColumnBase>;

export default async function Coins({ searchParams }: NextPageProps) {
  const { page } = await searchParams;

  const currentPage = Number(page ?? 1);

  const coinsData = await fetcher<CoinMarketData[]>("/coins/markets", {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: COUNT_PER_PAGE,
    page: currentPage,
    sparkline: "false",
    price_change_percentage: "24h",
  }).catch(
    (error) =>
      new Error(
        `Error fetching coins markets: ${error instanceof Error ? error.toString() : JSON.stringify(error)}`,
      ),
  );

  const COINS_MARKETS_COLUMNS: DataTableColumn<CoinMarketData>[] = [
    {
      ...COINS_MARKETS_COLUMNS_BASE.rank,
      cell: (coin) => (
        <>
          #{coin.market_cap_rank}
          <Link href={`/coins/${coin.id}`} aria-label={`View ${coin.name} coin`} />
        </>
      ),
    },
    {
      ...COINS_MARKETS_COLUMNS_BASE.token,
      cell: (coin) => (
        <div className="token-info">
          <Image src={coin.image} alt={coin.name} width={36} height={36} />
          <p>
            {coin.name} ({coin.symbol.toUpperCase()})
          </p>
        </div>
      ),
    },
    {
      ...COINS_MARKETS_COLUMNS_BASE.price,
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      ...COINS_MARKETS_COLUMNS_BASE.change,
      cell: (coin) => {
        const change = coin.price_change_percentage_24h;
        const isTrendingUp = change > 0;
        const isTrendingDown = change < 0;
        return (
          <span
            className={cn("change-value", {
              "text-gray-500": change === 0,
              "text-green-500": isTrendingUp,
              "text-red-500": isTrendingDown,
            })}
          >
            {isTrendingUp && "+"}
            {formatPercentage(change)}
          </span>
        );
      },
    },
    {
      ...COINS_MARKETS_COLUMNS_BASE["market-cap"],
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  if (coinsData instanceof Error) {
    console.error(coinsData.message);
    return <div>Error</div>;
  }

  const hasMorePages = coinsData.length === COUNT_PER_PAGE;
  const estimatedTotalPages = currentPage >= 100 ? Math.ceil(currentPage / 100) * 100 + 100 : 100;

  return (
    <main id="coins-page">
      <div className="content">
        <h4>All Coins</h4>
        <DataTable
          tableClassName="coins-table"
          columns={COINS_MARKETS_COLUMNS}
          data={coinsData}
          rowKey={(coin) => coin.id}
        />
        <CoinsPagination
          currentPage={currentPage}
          totalPages={estimatedTotalPages}
          hasMorePages={hasMorePages}
        />
      </div>
    </main>
  );
}
