import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../checkout/AuthProvider';
import { toast } from 'react-hot-toast';
import { Package, Clock, MapPin, IndianRupee, Loader, Search, AlertCircle, RefreshCw, Filter, Calendar, CheckCircle, Download, ChevronDown } from 'lucide-react';
import api from '../../services/api';

// Constants
const STATUS_COLORS = {
    pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200',
    processing: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
    shipped: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200',
    delivered: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200',
    cancelled: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200',
    default: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
};

const FALLBACK_IMAGE = '/images/product-placeholder.jpg';

// GST rates configuration (should match backend)
const GST_RATES = {
    CGST: 2.5, // 2.5%
    SGST: 2.5, // 2.5%
    IGST: 5.0  // 5% (for inter-state)
};

// Helper function to calculate GST breakdown
const calculateGSTBreakdown = (subtotal, totalGST) => {
    // If we have total GST from order, split it equally between CGST and SGST
    if (totalGST && totalGST > 0) {
        return {
            cgst: totalGST / 2,
            sgst: totalGST / 2,
            totalGST: totalGST
        };
    }
    
    // Fallback calculation
    const cgst = (subtotal * GST_RATES.CGST) / 100;
    const sgst = (subtotal * GST_RATES.SGST) / 100;
    return {
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
        totalGST: Math.round((cgst + sgst) * 100) / 100
    };
};

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);
    const [ordersLoaded, setOrdersLoaded] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(null);

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get('/orders/my-orders', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                params: {
                    _t: new Date().getTime()
                }
            });
            
            console.log('Orders response:', response.data);
            
            // Handle different response formats
            const ordersData = Array.isArray(response.data) ? response.data :
                             Array.isArray(response.data?.orders) ? response.data.orders :
                             response.data?.data?.orders || [];
            
            if (!Array.isArray(ordersData)) {
                throw new Error('Invalid orders data format received');
            }
            
            setOrders(ordersData);
            setTimeout(() => setOrdersLoaded(true), 100);
        } catch (err) {
            console.error('Error loading orders:', err);
            setError(err.response?.data?.error || err.message || 'Failed to load orders');
            toast.error('Failed to load orders. Please try again.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders, refreshKey]);

    const getStatusColor = useCallback((status) => {
        if (!status) return STATUS_COLORS.default;
        return STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.default;
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Date not available';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    }, []);

    const formatAddress = useCallback((address) => {
        if (!address) return 'Address not available';
        
        const parts = [
            address.address,
            address.city,
            address.state,
            address.pincode && `PIN: ${address.pincode}`,
            address.phone && `Phone: ${address.phone}`
        ].filter(Boolean);
        
        return parts.join(', ') || 'Address details not available';
    }, []);

    const generateInvoicePDF = async (orderId) => {
        try {
            setDownloadingInvoice(orderId);
            toast.loading('Generating invoice...', { id: 'pdf-loading' });
            
            // Fetch complete order details
            const response = await api.get(`/orders/${orderId}`);
            const orderData = response.data.order;
            
            if (!orderData) {
                throw new Error('Order data not found');
            }

            // Calculate subtotal from items
            const subtotal = (orderData.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Get GST amount from order or calculate it
            const gstAmount = orderData.gstAmount || 0;
            const gstBreakdown = calculateGSTBreakdown(subtotal, gstAmount);
            
            // Calculate shipping
            const shipping = orderData.shippingCharge || (subtotal >= 500 ? 0 : 50);

            // Create PDF content with GST breakdown
            const invoiceContent = `
                <html>
                <head>
                    <title>Invoice - ${orderData._id}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background: #f8f9fa;
                        }
                        
                        .invoice-container {
                            max-width: 800px;
                            margin: 20px auto;
                            background: white;
                            padding: 40px;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        
                        .invoice-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 40px;
                            padding-bottom: 20px;
                            border-bottom: 3px solid #f59e0b;
                        }
                        
                        .company-info h1 {
                            color: #f59e0b;
                            font-size: 36px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }
                        
                        .company-info p {
                            color: #666;
                            font-size: 16px;
                        }
                        
                        .company-info .gst-number {
                            color: #666;
                            font-size: 12px;
                            font-weight: bold;
                            margin-top: 5px;
                        }
                        
                        .invoice-details {
                            text-align: right;
                        }
                        
                        .invoice-details h2 {
                            color: #333;
                            font-size: 28px;
                            margin-bottom: 10px;
                        }
                        
                        .invoice-details p {
                            margin: 5px 0;
                            font-size: 14px;
                        }
                        
                        .invoice-info {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 40px;
                            margin-bottom: 40px;
                        }
                        
                        .section-title {
                            color: #f59e0b;
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 15px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        
                        .info-block {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 8px;
                            border-left: 4px solid #f59e0b;
                        }
                        
                        .info-block p {
                            margin: 5px 0;
                            font-size: 14px;
                        }
                        
                        .status-badge {
                            display: inline-block;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .status-pending {
                            background: #fef3c7;
                            color: #f59e0b;
                        }
                        
                        .status-processing {
                            background: #dbeafe;
                            color: #3b82f6;
                        }
                        
                        .status-shipped {
                            background: #e0e7ff;
                            color: #7c3aed;
                        }
                        
                        .status-delivered {
                            background: #d1fae5;
                            color: #10b981;
                        }
                        
                        .status-cancelled {
                            background: #fee2e2;
                            color: #ef4444;
                        }
                        
                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 30px;
                            background: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        
                        .items-table th {
                            background: #f59e0b;
                            color: white;
                            padding: 15px;
                            text-align: left;
                            font-weight: bold;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .items-table td {
                            padding: 15px;
                            border-bottom: 1px solid #e5e7eb;
                            font-size: 14px;
                        }
                        
                        .items-table tbody tr:hover {
                            background: #f9fafb;
                        }
                        
                        .items-table tbody tr:last-child td {
                            border-bottom: none;
                        }
                        
                        .total-section {
                            background: #f8f9fa;
                            padding: 25px;
                            border-radius: 8px;
                            margin-top: 30px;
                            border: 2px solid #f59e0b;
                        }
                        
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 10px 0;
                            font-size: 16px;
                        }
                        
                        .gst-section {
                            background: #fef3c7;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border: 2px solid #f59e0b;
                        }
                        
                        .gst-title {
                            color: #f59e0b;
                            font-size: 18px;
                            font-weight: bold;
                            margin-bottom: 15px;
                            text-align: center;
                        }
                        
                        .gst-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                            font-size: 14px;
                        }
                        
                        .gst-total {
                            font-weight: bold;
                            color: #f59e0b;
                            border-top: 1px solid #f59e0b;
                            padding-top: 10px;
                            margin-top: 10px;
                        }
                        
                        .total-row.grand-total {
                            font-size: 20px;
                            font-weight: bold;
                            color: #f59e0b;
                            padding-top: 15px;
                            border-top: 2px solid #f59e0b;
                            margin-top: 15px;
                        }
                        
                        .payment-info {
                            background: #f0f9ff;
                            padding: 20px;
                            border-radius: 8px;
                            border-left: 4px solid #3b82f6;
                            margin-top: 30px;
                        }
                        
                        .payment-info h3 {
                            color: #3b82f6;
                            margin-bottom: 10px;
                        }
                        
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            color: #666;
                            font-size: 14px;
                        }
                        
                        .thank-you {
                            background: linear-gradient(135deg, #f59e0b, #f97316);
                            color: white;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                            margin-top: 30px;
                        }
                        
                        @media print {
                            body {
                                background: white;
                            }
                            
                            .invoice-container {
                                margin: 0;
                                box-shadow: none;
                                border-radius: 0;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-container">
                        <!-- Invoice Header -->
                        <div class="invoice-header">
                            <div class="company-info">
                                <h1>SRI BOGAT</h1>
                                <p>Premium Quality Products</p>
                                <p class="gst-number">GSTIN: 27AABCU9603R1ZM</p>
                            </div>
                            <div class="invoice-details">
                                <h2>TAX INVOICE</h2>
                                <p><strong>Invoice #:</strong> INV-${orderData._id.slice(-8).toUpperCase()}</p>
                                <p><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString('en-IN')}</p>
                                <p><strong>Order ID:</strong> ${orderData._id}</p>
                            </div>
                        </div>

                        <!-- Invoice Information -->
                        <div class="invoice-info">
                            <div>
                                <h3 class="section-title">Bill To</h3>
                                <div class="info-block">
                                    <p><strong>${orderData.user?.name || 'Customer Name'}</strong></p>
                                    <p>Email: ${orderData.user?.email || 'N/A'}</p>
                                    <p>Phone: ${orderData.user?.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 class="section-title">Ship To</h3>
                                <div class="info-block">
                                    <p>${orderData.shippingAddress?.address || 'N/A'}</p>
                                    <p>${orderData.shippingAddress?.city || ''}, ${orderData.shippingAddress?.state || ''}</p>
                                    <p>PIN: ${orderData.shippingAddress?.pincode || 'N/A'}</p>
                                    <p>Phone: ${orderData.shippingAddress?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Order Status -->
                        <div style="margin-bottom: 30px;">
                            <h3 class="section-title">Order Status</h3>
                            <div style="display: flex; gap: 15px; align-items: center;">
                                <span class="status-badge status-${orderData.status || 'pending'}">${orderData.status || 'Pending'}</span>
                                <span style="color: #666;">Payment: ${orderData.paymentStatus || 'Pending'}</span>
                                <span style="color: #666;">Method: ${orderData.paymentMethod || 'N/A'}</span>
                            </div>
                        </div>

                        <!-- Items Table -->
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>HSN Code</th>
                                    <th>Qty</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderData.items?.map(item => `
                                    <tr>
                                        <td>
                                            <strong>${item.product?.name || 'Product Name'}</strong>
                                            <br>
                                            <small style="color: #666;">${item.product?.description || ''}</small>
                                        </td>
                                        <td>1234</td>
                                        <td>${item.quantity || 0}</td>
                                        <td>₹${(item.price || 0).toFixed(2)}</td>
                                        <td>₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5">No items found</td></tr>'}
                            </tbody>
                        </table>

                        <!-- Total Section -->
                        <div class="total-section">
                            <div class="total-row">
                                <span>Subtotal (Before Tax):</span>
                                <span>₹${subtotal.toFixed(2)}</span>
                            </div>
                            
                            <!-- GST Breakdown Section -->
                            <div class="gst-section">
                                <div class="gst-title">GST Breakdown</div>
                                <div class="gst-row">
                                    <span>CGST @ ${GST_RATES.CGST}%:</span>
                                    <span>₹${gstBreakdown.cgst.toFixed(2)}</span>
                                </div>
                                <div class="gst-row">
                                    <span>SGST @ ${GST_RATES.SGST}%:</span>
                                    <span>₹${gstBreakdown.sgst.toFixed(2)}</span>
                                </div>
                                <div class="gst-row gst-total">
                                    <span>Total GST:</span>
                                    <span>₹${gstBreakdown.totalGST.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div class="total-row">
                                <span>Shipping & Handling:</span>
                                <span>₹${shipping.toFixed(2)}</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>GRAND TOTAL:</span>
                                <span>₹${(orderData.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <!-- Amount in Words -->
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <p><strong>Amount in Words:</strong> ${convertToWords(orderData.totalAmount || 0)} Rupees Only</p>
                        </div>

                        <!-- Payment Information -->
                        <div class="payment-info">
                            <h3>Payment Information</h3>
                            <p><strong>Payment Method:</strong> ${orderData.paymentMethod || 'N/A'}</p>
                            <p><strong>Payment Status:</strong> ${orderData.paymentStatus || 'Pending'}</p>
                            ${orderData.razorpayDetails?.paymentId ? `<p><strong>Transaction ID:</strong> ${orderData.razorpayDetails.paymentId}</p>` : ''}
                        </div>

                        <!-- GST Declaration -->
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #f59e0b;">
                            <p style="font-size: 12px; color: #92400e; text-align: center;">
                                <strong>GST Registration Number:</strong> 27AABCU9603R1ZM<br>
                                This is a computer-generated invoice and does not require physical signature.
                            </p>
                        </div>

                        <!-- Thank You -->
                        <div class="thank-you">
                            <h3>Thank You for Your Order!</h3>
                            <p>We appreciate your business and hope you enjoy your purchase.</p>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            <p>This is a computer-generated invoice. No signature required.</p>
                            <p>For any queries, please contact us at support@bogat.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Create and download PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(invoiceContent);
                printWindow.document.close();
                
                // Wait for content to load then print
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 500);
                };
            } else {
                throw new Error('Unable to open print window. Please allow popups.');
            }
            
            toast.success('Invoice generated successfully!', { id: 'pdf-loading' });
            
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Failed to generate invoice. Please try again.', { id: 'pdf-loading' });
        } finally {
            setDownloadingInvoice(null);
        }
    };

    // Helper function to convert number to words (basic implementation)
    const convertToWords = (amount) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        if (amount === 0) return 'Zero';
        if (amount < 10) return ones[amount];
        if (amount < 20) return teens[amount - 10];
        if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 !== 0 ? ' ' + ones[amount % 10] : '');
        if (amount < 1000) return ones[Math.floor(amount / 100)] + ' Hundred' + (amount % 100 !== 0 ? ' ' + convertToWords(amount % 100) : '');
        if (amount < 100000) return convertToWords(Math.floor(amount / 1000)) + ' Thousand' + (amount % 1000 !== 0 ? ' ' + convertToWords(amount % 1000) : '');
        
        return 'Amount too large';
    };

    const filteredOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        
        return orders.filter(order => {
            if (!order) return false;

            const searchString = searchQuery.toLowerCase();
            const matchesSearch = 
                (order._id || '').toLowerCase().includes(searchString) ||
                (order.items || []).some(item => 
                    item?.product?.name?.toLowerCase().includes(searchString)
                );

            if (filter === 'all') return matchesSearch;
            return matchesSearch && (order.status || '').toLowerCase() === filter;
        });
    }, [orders, searchQuery, filter]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        setOrdersLoaded(false);
        toast.success('Refreshing orders...');
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = FALLBACK_IMAGE;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="container mx-auto px-4 py-8 pt-32">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200 p-12 text-center">
                            <div className="relative">
                                <Loader className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-6" />
                                <div className="absolute inset-0 w-12 h-12 border-4 border-amber-200 rounded-full animate-pulse mx-auto"></div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Orders</h3>
                            <p className="text-gray-600">Please wait while we fetch your orders...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="container mx-auto px-4 py-8 pt-32">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200 p-8">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-800">Error Loading Orders</h2>
                                    <p className="text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="group bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-xl font-medium hover:from-red-700 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 flex items-center"
                            >
                                <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-8 pt-32">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200 p-8 hover:shadow-2xl transition-all duration-500">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
                            <div className="text-center lg:text-left">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent mb-2">
                                    My Orders
                                </h1>
                                <p className="text-gray-600 text-lg">View and track your orders</p>
                                <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-700 rounded-full mt-2 mx-auto lg:mx-0"></div>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-amber-300"
                                    />
                                    <Search className="w-5 h-5 text-amber-400 absolute left-4 top-4 group-focus-within:text-amber-600 transition-colors" />
                                </div>
                                
                                <div className="relative group">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="appearance-none pl-10 pr-10 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-amber-300 cursor-pointer"
                                    >
                                        <option value="all">All Orders</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <Filter className="w-5 h-5 text-amber-400 absolute left-3 top-4 pointer-events-none group-focus-within:text-amber-600 transition-colors" />
                                    <ChevronDown className="w-5 h-5 text-amber-400 absolute right-3 top-4 pointer-events-none group-focus-within:text-amber-600 transition-colors" />
                                </div>
                                
                                <button
                                    onClick={handleRefresh}
                                    className="group p-3 text-amber-600 hover:text-white hover:bg-gradient-to-r hover:from-amber-600 hover:to-orange-700 transition-all duration-300 rounded-xl border-2 border-amber-200 hover:border-amber-600 transform hover:scale-105"
                                    title="Refresh orders"
                                >
                                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            </div>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-12 border border-amber-200 max-w-md mx-auto">
                                    <div className="text-amber-300 mb-6">
                                        <Package className="w-20 h-20 mx-auto animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No orders found</h3>
                                    <p className="text-gray-600 text-lg">
                                        {searchQuery || filter !== 'all'
                                            ? 'Try adjusting your search or filter'
                                            : 'You haven\'t placed any orders yet'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredOrders.map((order, index) => (
                                    <div 
                                        key={order._id} 
                                        className={`group bg-gradient-to-r from-white to-amber-50/30 border-2 border-amber-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] ${ordersLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Order Header */}
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                                                        <Package className="w-6 h-6 text-amber-600" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors">
                                                        Order #{order._id.slice(-8).toUpperCase()}
                                                    </h3>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center text-gray-600 bg-white/60 px-3 py-2 rounded-lg">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        <span className="text-sm font-medium">{formatDate(order.createdAt)}</span>
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(order.status)} transform hover:scale-105 transition-all duration-200`}>
                                                        <CheckCircle className="w-4 h-4 inline mr-2" />
                                                        {order.status || 'Processing'}
                                                    </span>
                                                    {/* GST Badge */}
                                                    {order.gstAmount > 0 && (
                                                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                                                            <span className="text-xs font-medium">GST ₹{order.gstAmount.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 lg:mt-0 text-center lg:text-right">
                                                <div className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                                                    <div className="flex items-center justify-center lg:justify-end text-2xl font-bold">
                                                        <IndianRupee className="w-6 h-6 mr-1 text-amber-600" />
                                                        {order.totalAmount?.toFixed(2) || '0.00'}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1 bg-amber-50 px-3 py-1 rounded-full inline-block">
                                                    {(order.items || []).length} {(order.items || []).length === 1 ? 'item' : 'items'}
                                                </div>
                                                <button
                                                    onClick={() => generateInvoicePDF(order._id)}
                                                    disabled={downloadingInvoice === order._id}
                                                    className="group mt-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-amber-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 flex items-center justify-center lg:justify-end shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {downloadingInvoice === order._id ? (
                                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                                                    )}
                                                    {downloadingInvoice === order._id ? 'Generating...' : 'Download Invoice'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="border-t-2 border-amber-200 pt-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Items Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                                        <Package className="w-5 h-5 text-amber-600 mr-2" />
                                                        Order Items
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {(order.items || []).map((item, itemIndex) => (
                                                            <div key={`${order._id}-item-${itemIndex}`} className="group flex items-center space-x-4 bg-white/60 p-4 rounded-xl hover:bg-white transition-all duration-300 hover:shadow-md">
                                                                <div className="relative w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl overflow-hidden">
                                                                    <img
                                                                        src={item?.product?.image || FALLBACK_IMAGE}
                                                                        alt={item?.product?.name || 'Product'}
                                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                                        onError={handleImageError}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-bold text-gray-800 group-hover:text-amber-700 transition-colors">
                                                                        {item?.product?.name || 'Product Name Not Available'}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 mt-1">
                                                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                            {item?.quantity || 0} × ₹{item?.price?.toFixed(2) || '0.00'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Address & Price Breakdown Section */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-bold text-gray-800 flex items-center">
                                                        <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                                                        Delivery Address
                                                    </h4>
                                                    <div className="bg-white/60 p-4 rounded-xl">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg flex-shrink-0 mt-1">
                                                                <MapPin className="w-4 h-4 text-amber-600" />
                                                            </div>
                                                            <div className="text-gray-700 leading-relaxed">
                                                                {formatAddress(order.shippingAddress)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price Breakdown */}
                                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                                                        <h5 className="font-bold text-gray-800 mb-3 flex items-center">
                                                            <IndianRupee className="w-4 h-4 text-amber-600 mr-2" />
                                                            Price Breakdown
                                                        </h5>
                                                        <div className="space-y-2 text-sm">
                                                            {(() => {
                                                                const subtotal = (order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                                                const gstAmount = order.gstAmount || 0;
                                                                const gstBreakdown = calculateGSTBreakdown(subtotal, gstAmount);
                                                                const shipping = order.shippingCharge || 0;
                                                                
                                                                return (
                                                                    <>
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>Subtotal:</span>
                                                                            <span>₹{subtotal.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>CGST @ {GST_RATES.CGST}%:</span>
                                                                            <span>₹{gstBreakdown.cgst.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>SGST @ {GST_RATES.SGST}%:</span>
                                                                            <span>₹{gstBreakdown.sgst.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between font-semibold text-amber-700 border-t border-amber-200 pt-2">
                                                                            <span>Total GST:</span>
                                                                            <span>₹{gstBreakdown.totalGST.toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>Shipping:</span>
                                                                            <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                                                                {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between font-bold text-lg text-amber-700 border-t-2 border-amber-300 pt-2 mt-2">
                                                                            <span>Total:</span>
                                                                            <span>₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Orders;