export interface IndexMeta {
  symbol: string;
  displayName: string;
  /** Short label for chart legends */
  shortLabel: string;
}

/** The five indices tracked by this dashboard. Add more here to extend. */
export const INDICES: IndexMeta[] = [
  { symbol: '^STOXX50E', displayName: 'Euro Stoxx 50',              shortLabel: 'STOXX50' },
  { symbol: '^GDAXI',    displayName: 'DAX',                        shortLabel: 'DAX'     },
  { symbol: '^N225',     displayName: 'Nikkei 225',                 shortLabel: 'N225'    },
  { symbol: '^DJI',      displayName: 'Dow Jones Industrial Avg',   shortLabel: 'DJI'     },
  { symbol: 'URTH',      displayName: 'MSCI World',                 shortLabel: 'MSCI'    },
];

export const SYMBOLS = INDICES.map((i) => i.symbol);

export const INDEX_BY_SYMBOL = Object.fromEntries(
  INDICES.map((i) => [i.symbol, i])
) as Record<string, IndexMeta>;
