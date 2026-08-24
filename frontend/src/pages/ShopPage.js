import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination, PaginationContent, PaginationItem,
} from "@/components/ui/pagination";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title_asc", label: "Alphabetical" },
];

const CategoryRail = ({ categories, active, onSelect }) => (
  <div className="space-y-1">
    <button
      onClick={() => onSelect("all")}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${active === "all" || !active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
      data-testid="filter-category-all"
    >
      All Products
    </button>
    {(categories || []).map((c) => (
      <button
        key={c.name}
        onClick={() => onSelect(c.name)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${active === c.name ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
        data-testid={`filter-category-${c.name.toLowerCase().replace(/[^a-z]/g, '-')}`}
      >
        <span>{c.name}</span>
        <span className="text-xs opacity-70">{c.count}</span>
      </button>
    ))}
  </div>
);

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("query") || "";
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "featured";
  const page = parseInt(params.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => setSearchInput(query), [query]);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", query, category, sort, page],
    queryFn: () => fetchProducts({ query: query || undefined, category, sort, page, limit: 24 }),
    keepPreviousData: true,
  });

  const setParam = (updates) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "all") next.delete(k);
      else next.set(k, v);
    });
    if (!("page" in updates)) next.delete("page");
    setParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setParam({ query: searchInput });
  };

  const products = data?.products || [];
  const pages = data?.pages || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <div className="label-caps mb-2">Collection</div>
        <h1 className="font-serif text-3xl sm:text-4xl tracking-[-0.01em]">
          {category !== "all" ? category : "All Products"}
        </h1>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Desktop filter rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="label-caps mb-3">Categories</div>
            <CategoryRail categories={categories} active={category} onSelect={(c) => setParam({ category: c })} />
          </div>
        </aside>

        <div>
          {/* Top bar */}
          <div className="flex items-center gap-3 mb-6">
            <form onSubmit={submitSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products"
                className="pl-9 h-10 rounded-full bg-card"
                data-testid="catalog-search-input"
              />
            </form>

            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="lg:hidden border border-border h-10 rounded-full" data-testid="catalog-filter-open-button">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader><SheetTitle className="font-serif">Categories</SheetTitle></SheetHeader>
                <div className="mt-4">
                  <CategoryRail categories={categories} active={category} onSelect={(c) => setParam({ category: c })} />
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => setParam({ sort: v })}>
              <SelectTrigger className="w-[150px] sm:w-[190px] h-10 rounded-full bg-card" data-testid="catalog-sort-select">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <h3 className="font-serif text-xl">No products found</h3>
              <p className="text-muted-foreground mt-2">
                {query ? `Nothing matches “${query}”.` : "No products have been published in this category yet."}
              </p>
              <Button asChild variant="secondary" className="mt-4 border border-border"><Link to="/shop">Clear filters</Link></Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground" data-testid="catalog-result-count">
                  {data?.total} product{data?.total === 1 ? "" : "s"}
                </p>
                {isFetching && <span className="text-xs text-muted-foreground">Updating…</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" data-testid="catalog-grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {pages > 1 && (
                <Pagination className="mt-10" data-testid="catalog-pagination">
                  <PaginationContent>
                    <PaginationItem>
                      <Button variant="secondary" className="border border-border" disabled={page <= 1} onClick={() => setParam({ page: String(page - 1) })} data-testid="pagination-prev">
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="px-4 text-sm">Page {page} of {pages}</span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button variant="secondary" className="border border-border" disabled={page >= pages} onClick={() => setParam({ page: String(page + 1) })} data-testid="pagination-next">
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
