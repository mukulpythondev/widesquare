import React, { useState } from 'react';
import { Calendar, ArrowRight, Clock, Share2, Bookmark, BookmarkCheck, Search, Tag, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogPosts } from '../assets/blogdata';
import { toast } from 'react-toastify';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15
    }
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 0.4,
    ease: "easeInOut"
  }
};

// BlogCard component
const BlogCard = ({ post }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: post.link
        });
        toast.success("Post shared successfully!");
      } else {
        await navigator.clipboard.writeText(post.link);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Unable to share post");
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);

    if (!isBookmarked) {
      toast.success(`Saved "${post.title}" to your reading list`);
    } else {
      toast.info(`Removed "${post.title}" from your reading list`);
    }
  };

  const handleReadMore = () => {
    window.open(post.link, '_blank', 'noopener,noreferrer');
  };

  const estimatedReadTime = Math.ceil(post.excerpt.split(' ').length / 200);

  // Extract category from post (or use default)
  const category = post.category || "Real Estate";

  return (
    <motion.div
      className="group bg-card text-card-foreground rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border"
      variants={cardVariants}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleReadMore}
    >
      <div className="relative overflow-hidden aspect-w-16 aspect-h-9">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-background/80 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-70'}`} />

        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium rounded-full shadow-sm">
            {category}
          </span>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-0 left-0 right-0 p-4 flex justify-center"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadMore();
                }}
                className="px-4 py-2 backdrop-blur-sm bg-white/70 text-primary rounded-full flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-300 font-medium text-sm shadow-lg"
              >
                Read Full Article <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 flex flex-col gap-3">
          <motion.button
            whileTap={pulseAnimation}
            onClick={handleBookmark}
            className={`p-2 backdrop-blur-sm rounded-full shadow-lg 
              ${isBookmarked
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/80 text-muted-foreground hover:bg-muted'
              } transition-colors duration-200`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>

          <motion.button
            whileTap={pulseAnimation}
            onClick={handleShare}
            className="p-2 bg-background/80 backdrop-blur-sm text-muted-foreground rounded-full hover:bg-muted transition-colors duration-200 shadow-lg"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between text-muted-foreground text-xs mb-3">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
            {post.date}
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" />
            {estimatedReadTime} min read
          </div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReadMore();
            }}
            className="inline-flex items-center text-primary hover:text-foreground font-medium transition-colors text-sm"
          >
            Continue Reading
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Tag className="w-3 h-3 text-muted-foreground" />
            <span>{post.tags?.[0] || "Property"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Blog component
const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Buying', 'Selling', 'Investment', 'Tips'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (post.category || 'Real Estate') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4 relative inline-block">
            Latest Articles
            <div className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-primary rounded-full"></div>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
            Expert advice and tips for your real estate journey
          </p>
        </motion.div>

        {/* Search and filter section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-card'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card rounded-xl border border-border"
          >
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any articles matching your search criteria.
              Try using different keywords or browse all categories.
            </p>
          </motion.div>
        )}

        {/* View all articles button */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-16"
          >
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-black text-white font-medium rounded-lg shadow-lg hover:bg-gray-900 hover:text-white transition-all flex items-center"
            >
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Blog;