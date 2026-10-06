# TICKET-1 — Filter transactions by type (All / Income / Expense)

**Type:** Feature, full stack  **Size:** Small  **Pair work:** one of you types, the other explains; swap halfway.

## Background

Every transaction has a `type`: `income` or `expense`. Amounts are always **positive**; the `type` says which direction the money moves. The Transactions page can search, filter by date and sort, but not by type.

## What to build

1. The transactions endpoint accepts an optional `type` query parameter (`income` or `expense`). It is validated with Zod, and the filter is applied **in the database query**.
2. The Transactions page has an **All / Income / Expense** control. The choice is kept in the URL (e.g. `/transactions?type=income`) so a refresh keeps it.

## Acceptance criteria

- [ ] **All** shows every transaction.
- [ ] **Income** and **Expense** show only matching rows.
- [ ] The count and pagination match the rows you can see (e.g. Expense shows fewer pages than All).
- [ ] Switching back to **All** restores the correct results.
- [ ] An invalid value such as `?type=banana` returns a 400 error in the normal error shape, not a crash.
- [ ] Search, date range and sorting still work together with the type filter.

## Hints — API first

1. Open `packages/shared/src/schemas.ts` and find `listTransactionsQuerySchema`. Add an optional `type` using the `TRANSACTION_TYPES` list that is already in the file.
2. Open `apps/api/src/repositories/transactionRepository.ts` and find `buildWhere`. It builds the filter for the list. Add a condition when `filters.type` is set. Use `eq(transactions.type, filters.type)`. Add `"type"` to the `TransactionFilters` type at the top.
3. Notice that `list()` uses the same `where` for the rows **and** for the count/total. Why is that useful?
4. Add a test in `transactionRepository.test.ts`, like the others, that checks the SQL contains the type condition.
5. Try it: with the API running, open `http://localhost:5173/api/transactions?type=income` in the browser (you must be signed in) and look at the JSON.

## Hints — Web next

6. In `apps/web/src/api/client.ts`, `TransactionListParams` picks which fields can be sent. Add `type`.
7. In `TransactionsPage.tsx`, `readParams` reads filters from the URL. Read `type` from there too.
8. Add three buttons or a `<select>` for All / Income / Expense. When one is clicked, call `updateParams({ type: ... })`. For **All**, pass `undefined` so `type` disappears from the URL.
9. `updateParams` already goes back to page 1 when a filter changes. Why is that important?
10. React Query re-fetches when its `queryKey` changes. The key includes `params`, so your new filter works automatically.

## How to check your work

- [ ] Click All, Income, Expense. The rows change and the count at the top matches.
- [ ] With Expense selected, no row has a `+` amount. With Income selected, no row has a `−`.
- [ ] Go to page 2 of All, then click Income. You land on page 1 (not an empty page 2).
- [ ] Refresh the browser while on Income. It is still on Income.
- [ ] Use the browser Back button. The previous filter returns.
- [ ] Type a title in the search box while on Expense: results are expenses only.
- [ ] Open `/transactions?type=banana`. It does not crash.
- [ ] `pnpm test` and `pnpm typecheck` pass.

---

# TICKET-1b — "Total shown" for the filtered results

**Depends on:** TICKET-1

## What to build

The bar above the table currently says **Total**. It must say **Total shown** and always describe exactly the rows that match the current filters (not just the current page, and not a net balance).

- The total is **calculated in the database**, not by adding up numbers in the browser.
- When nothing matches, show **₹0.00** and a helpful message such as "No expense transactions match your filters. Try a different date range or clear the search."

## Acceptance criteria

- [ ] The label reads **Total shown**.
- [ ] With Income selected, the total is the sum of the income rows only; with Expense, the expenses only; with All, everything (this is a sum of amounts, not income minus expense).
- [ ] The total is the same on page 1 and page 2 of the same filter.
- [ ] No matches → **₹0.00**, count 0, and a message that tells the user what to try.

## Hints

1. Find the `summary` object returned by the API (`list()` in the repository). It already runs a `count` and `sum` query. Does it use the same `where` as the rows?
2. Change the label in `TransactionsPage.tsx`.
3. Find where "No transactions found." is passed as `emptyMessage` and replace it with a message that depends on which filters are active.
4. A search that matches nothing should still show ₹0.00. Test it by searching for `zzzz`.

## How to check your work

- [ ] Note the Expense total, then add up the visible rows by hand on a small date range.
- [ ] Compare page 1 and page 2: the total does not change.
- [ ] Search for `zzzz`: ₹0.00 and your message appear.
- [ ] Add a new expense: the totals update after saving.
- [ ] `pnpm test` and `pnpm typecheck` pass.

## Optional extension

Add a category filter that works together with the type filter. The list, count, **and** total must all agree.
