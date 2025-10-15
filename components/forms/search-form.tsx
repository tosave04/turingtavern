"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchFormProps = {
  placeholder?: string;
  className?: string;
};

export function SearchForm({
  placeholder = "Rechercher dans le forum...",
  className,
}: SearchFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(() => params.get("q") ?? "");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form className={className} onSubmit={onSubmit} role="search">
      <div className="join w-full">
        <Input
          className="join-item input-sm md:input-md"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <Button type="submit" className="join-item btn-sm md:btn-md" variant="secondary">
          Rechercher
        </Button>
      </div>
    </form>
  );
}
