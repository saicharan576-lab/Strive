import { useMemo, useState } from 'react';
import { ServiceProvider } from '../_types/swappyfeed';

interface UseProviderFilterReturn {
  filteredProviders: ServiceProvider[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const useProviderFilter = (
  providers: readonly ServiceProvider[]
): UseProviderFilterReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProviders = useMemo(() => {
    let filtered = [...providers];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.serviceName?.toLowerCase().includes(query) ||
        p.title?.toLowerCase().includes(query) ||
        p.skillsOffered?.some(skill => 
          skill.name.toLowerCase().includes(query)
        )
      );
    }

    return filtered;
  }, [providers, selectedCategory, searchQuery]);

  return {
    filteredProviders,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  };
};