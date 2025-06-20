import { Home, IndianRupee, Filter } from "lucide-react";
import { motion } from "framer-motion";

const propertyTypes = ["House", "Apartment", "Villa", "Office"];
const availabilityTypes = ["Rent", "Buy", "Lease"];
const priceRanges = [
  { min: 0, max: 5000000, label: "Under ₹50L" },
  { min: 5000000, max: 10000000, label: "₹50L - ₹1Cr" },
  { min: 10000000, max: 20000000, label: "₹1Cr - ₹2Cr" },
  { min: 20000000, max: Number.MAX_SAFE_INTEGER, label: "Above ₹2Cr" }
];

const FilterSection = ({ filters, setFilters, onApplyFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const handleReset = () => {
    setFilters({
      propertyType: "",
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      bedrooms: "0",
      bathrooms: "0",
      availability: "",
      searchQuery: "",
      sortBy: ""
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-black" />
          <h2 className="text-lg font-semibold text-black">Filters</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-black hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Property Type */}
        <div className="filter-group">
          <label className="filter-label flex items-center text-black font-medium mb-2">
            <Home className="w-4 h-4 mr-2 text-black" />
            Property Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleChange({
                  target: { name: "propertyType", value: type.toLowerCase() }
                })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filters.propertyType === type.toLowerCase()
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label flex items-center text-black font-medium mb-2">
            <IndianRupee className="w-4 h-4 mr-2 text-black" />
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map(({ min, max, label }) => (
              <button
                key={label}
                onClick={() => handlePriceRangeChange(min, max)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filters.priceRange[0] === min && filters.priceRange[1] === max
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Example: Bedrooms */}
        <div className="filter-group">
          <label className="filter-label text-black font-medium mb-2">
            Bedrooms
          </label>
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-black"
          >
            <option value="0">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Example: Bathrooms */}
        <div className="filter-group">
          <label className="filter-label text-black font-medium mb-2">
            Bathrooms
          </label>
          <select
            name="bathrooms"
            value={filters.bathrooms}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-black"
          >
            <option value="0">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Example: Availability */}
        <div className="filter-group">
          <label className="filter-label text-black font-medium mb-2">
            Availability
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availabilityTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleChange({
                  target: { name: "availability", value: type.toLowerCase() }
                })}
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-all
                  ${filters.availability === type.toLowerCase()
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => onApplyFilters(filters)}
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-900 
              transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSection;