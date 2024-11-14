export function generateSearchTerms(business: {
  name: string;
  category: string;
  description?: string;
}): string[] {
  const searchTerms = new Set<string>();
  
  // Add full business name
  searchTerms.add(business.name.toLowerCase());
  
  // Add each word from the business name
  business.name.toLowerCase().split(/\s+/).forEach(term => {
    if (term.length > 2) searchTerms.add(term);
  });
  
  // Add category
  searchTerms.add(business.category.toLowerCase());
  
  // Add description terms if available
  if (business.description) {
    business.description.toLowerCase().split(/\s+/).forEach(term => {
      if (term.length > 3) searchTerms.add(term);
    });
  }
  
  return Array.from(searchTerms);
} 