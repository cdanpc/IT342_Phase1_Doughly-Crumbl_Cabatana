import './MenuComponents.css';

interface Category {
  value: string;
  label: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Product categories">
      {categories.map((category) => (
        <button
          key={category.value}
          type="button"
          role="tab"
          aria-selected={selectedCategory === category.value}
          className={`category-tabs__item${selectedCategory === category.value ? ' category-tabs__item--active' : ''}`}
          onClick={() => onSelect(category.value)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
