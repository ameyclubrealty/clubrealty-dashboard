'use client';

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

export function CombinedFilterButton({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categoryOptions,
}: {
  statusFilter: string;
  setStatusFilter: (value: 'all' | 'published' | 'draft') => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categoryOptions: string[];
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start text-left hover:bg-[#ee963e] hover:text-white">
           <Filter className="h-4 w-4" /> Filter Options
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 flex p-4 gap-4">
        <div>
          <Label htmlFor="status" className="text-sm text-gray-600">
            Filter by Status
          </Label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <Label htmlFor="category" className="text-sm text-gray-600">
            Filter by Category
          </Label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded text-sm"
          >
            <option value="">All</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
