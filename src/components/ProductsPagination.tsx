"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Paginator } from "primereact/paginator";
import type { PaginatorPageChangeEvent } from "primereact/paginator";
import { setParam } from "@/lib/utils/query";

type Props = {
  totalCount: number;
  defaultLimit: number;
};

export default function ProductsPagination({ totalCount, defaultLimit }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = useMemo(() => `?${searchParams.toString()}`, [searchParams]);

  const currentPage = useMemo(() => {
    const v = Number(searchParams.get("page") ?? "1");
    return Number.isNaN(v) || v < 1 ? 1 : v;
  }, [searchParams]);

  const rows = useMemo(() => {
    const v = Number(searchParams.get("limit") ?? String(defaultLimit));
    if (Number.isNaN(v)) return defaultLimit;
    return Math.max(1, Math.min(v, 60));
  }, [searchParams, defaultLimit]);

  const first = (currentPage - 1) * rows;

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    const nextPage = event.page + 1;
    const nextRows = event.rows;

    const withPage = setParam(pathname, search, "page", String(nextPage));
    const withLimit = setParam(
      pathname,
      new URL(withPage, "http://dummy").search,
      "limit",
      String(nextRows),
    );

    router.push(withLimit, { scroll: false });
  };

  if (totalCount <= rows) {
    return null;
  }

  return (
    <div className="flex justify-center border-t border-light-300 pt-4">
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalCount}
        onPageChange={onPageChange}
        rowsPerPageOptions={[12, 24, 48]}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      />
    </div>
  );
}

