import React, { useState, useEffect } from 'react';
import {
  Heart, Star, ShoppingCart, Sparkles, Lock
} from 'lucide-react';
import { useCart } from "../checkout/CartContext";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../checkout/AuthProvider';
import { toast } from 'react-hot-toast';
import { usersApi, productsApi } from '../../services/api';

const FreshVegetables = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth context
  const auth = useAuth();
  const isAuthenticated = auth?.user && !auth?.loading;

  const navigate = useNavigate();
  const { dispatch } = useCart();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    window.scrollTo({ top: 0 });
    
    loadProducts();
    
    // Only load wishlist if user is authenticated
    if (isAuthenticated) {
      loadWishlist();
    }

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [isAuthenticated]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsApi.getAllProducts();
      let allProducts = Array.isArray(data) ? data : [];

      // Filter for fresh vegetables
      allProducts = allProducts.filter(product => {
        // Check if product has subcategory field and matches "fresh vegetables"
        const hasFreshSubcategory = product?.subcategory?.toLowerCase().includes('fresh');
        const isVegetable = product?.category?.toLowerCase() === 'vegetables';
        const isActive = product?.status === 'active';
        
        console.log('Product:', product.name, {
          subcategory: product?.subcategory,
          category: product?.category,
          status: product?.status,
          hasFreshSubcategory,
          isVegetable,
          isActive
        });
        
        return hasFreshSubcategory && isVegetable && isActive;
      });

      console.log('Filtered fresh vegetables:', allProducts.length);
      setProducts(allProducts);
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setTimeout(() => toast.error('Failed to load products'), 0);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const wishlistItems = await usersApi.getWishlist();
      const ids = wishlistItems.map(item => item._id || item.id);
      setWishlist(new Set(ids));
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  // Check product availability
  const getProductStatus = (product) => {
    if (product?.status === 'inactive') {
      return { type: 'unavailable', message: 'Product is unavailable' };
    }
    if (product?.stock === 0) {
      return { type: 'out-of-stock', message: 'Out of stock' };
    }
    return { type: 'available', message: 'Available' };
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    // Check product availability
    const productStatus = getProductStatus(product);
    if (productStatus.type !== 'available') {
      toast.error(`Sorry, ${productStatus.message.toLowerCase()}!`);
      return;
    }
    
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setTimeout(() => toast.success(`Added ${product.name} to cart!`), 0);
  };

  const toggleWishlist = async (productId) => {
    if (!productId) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      const newWishlist = new Set(wishlist);

      if (newWishlist.has(productId)) {
        await usersApi.removeFromWishlist(productId);
        newWishlist.delete(productId);
        toast.success('Removed from wishlist');
      } else {
        await usersApi.addToWishlist(productId);
        newWishlist.add(productId);
        toast.success('Added to wishlist');
      }

      setWishlist(newWishlist);
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleRetry = () => {
    loadProducts();
  };

  // Show login prompt for restricted actions
  const showLoginPrompt = () => {
    toast.error('Please login to continue');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent absolute top-0 left-0"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto transform hover:scale-105 transition-transform duration-300">
            <div className="text-red-500 mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <button 
              onClick={handleRetry}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Login Status Banner */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                🔒 Please 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline mx-1"
                >
                  login
                </button>
                to add items to cart and wishlist
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-emerald-300 rounded-full opacity-30 animate-pulse delay-300"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent relative z-10">
              Fresh Vegetables
            </h1>
            <p className="text-gray-600 mt-3 text-lg relative z-10">
              🥕 Farm-fresh vegetables delivered to your doorstep
            </p>
          </div>
          <div className="flex items-center mt-6 md:mt-0 bg-white px-6 py-3 rounded-full shadow-lg border border-green-100">
            <Sparkles className="w-5 h-5 text-green-500 mr-2 animate-pulse" />
            <span className="text-gray-700 font-medium">
              Showing {products.length} fresh products
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const productStatus = getProductStatus(product);
            const isUnavailable = productStatus.type !== 'available';
            
            return (
              <div 
                key={product._id || product.id} 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-green-100 hover:border-green-200 transform hover:-translate-y-2 flex flex-col h-full ${
                  isUnavailable ? 'opacity-75' : ''
                }`}
              >
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-48 object-contain transform group-hover:scale-110 transition-transform duration-500 p-4 ${
                      isUnavailable ? 'filter grayscale' : ''
                    }`}
                  />
                  
                  <button 
                    onClick={() => isAuthenticated ? toggleWishlist(product._id || product.id) : showLoginPrompt()}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 border border-green-100"
                  >
                    {!isAuthenticated ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Heart 
                        className={`w-5 h-5 transition-all duration-300 ${
                          wishlist.has(product._id || product.id) 
                            ? 'text-red-500 fill-current animate-pulse' 
                            : 'text-gray-600 hover:text-red-400'
                        }`} 
                      />
                    )}
                  </button>
                  
                  {/* Status Badge */}
                  {productStatus.type === 'unavailable' ? (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      🚫 Unavailable
                    </div>
                  ) : productStatus.type === 'out-of-stock' ? (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ❌ Out of Stock
                    </div>
                  ) : (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      🥕 Fresh
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-sm text-green-600 font-bold mb-3 capitalize bg-green-50 px-3 py-1 rounded-full inline-block">
                    {product.subcategory || product.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300 flex-grow">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-gray-600 text-sm">{product.rating}</span>
                      </div>
                      {product.reviews && (
                        <>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-600 text-sm">{product.reviews} reviews</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <div className={`text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent ${
                        isUnavailable ? 'opacity-50' : ''
                      }`}>
                        ₹{product.price}
                      </div>
                      <span className="text-sm text-gray-600 font-normal">
                        /{product.unit}
                      </span>
                      {productStatus.type === 'available' && product.stock && (
                        <span className="text-xs text-green-600 font-medium mt-1">
                          {product.stock} in stock
                        </span>
                      )}
                    </div>
                    
                    {productStatus.type === 'unavailable' ? (
                      <div className="text-gray-500 font-semibold text-sm px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                        Unavailable
                      </div>
                    ) : productStatus.type === 'out-of-stock' ? (
                      <div className="text-red-500 font-semibold text-sm px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                        Out of Stock
                      </div>
                    ) : !isAuthenticated ? (
                      <button 
                        onClick={showLoginPrompt}
                        className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center group/btn font-medium text-sm whitespace-nowrap"
                      >
                        <Lock className="w-4 h-4 mr-1" />
                        Login to Add
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center group/btn font-medium text-sm whitespace-nowrap"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1 group-hover/btn:animate-bounce" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>

                {/* Animated border effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none ${
                  productStatus.type === 'unavailable' 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                    : productStatus.type === 'out-of-stock'
                    ? 'bg-gradient-to-r from-red-400 to-red-500'
                    : 'bg-gradient-to-r from-green-400 to-emerald-400'
                }`}></div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto border border-green-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No fresh vegetables available
              </h3>
              <p className="text-gray-600">
                Check back later for fresh vegetables from our farm.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreshVegetables;