import React, { useState } from 'react';
import { 
  Package, 
  Shield, 
  RotateCcw, 
  CreditCard, 
  Clock, 
  Phone, 
  Mail, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Video,
  ArrowRight,
  Home,
  FileText,
  Truck,
  User,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const policyData = [
    {
      id: 'made-to-order',
      title: 'Made-to-Order Products',
      icon: Package,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      content: [
        {
          type: 'highlight',
          text: 'All orders placed on www.sribogat.com are freshly prepared and made to order.'
        },
        {
          type: 'important',
          text: 'Our products, including coffee and spices, are grocery food items. Therefore, refunds, returns, or exchanges are not applicable unless damaged or incorrect items are received.'
        }
      ]
    },
    {
      id: 'damaged-items',
      title: 'Damaged or Incorrect Items',
      icon: Shield,
      color: 'from-red-500 to-orange-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      content: [
        {
          type: 'list',
          items: [
            'If you receive a damaged or wrong item, it is eligible for return.',
            'A mandatory unboxing video is required as proof.',
            'You must notify us within 3 days of receiving the order.'
          ]
        }
      ]
    },
    {
      id: 'return-process',
      title: 'Return Process',
      icon: RotateCcw,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      content: [
        {
          type: 'steps',
          steps: [
            {
              number: 1,
              title: 'Contact Support',
              description: 'Email us at support@sribogat.com to initiate a return request.'
            },
            {
              number: 2,
              title: 'Wait for Approval',
              description: 'Do not send items back without our approval — such returns will not be accepted.'
            }
          ]
        }
      ]
    },
    {
      id: 'refund-timeline',
      title: 'Refund Timeline',
      icon: CreditCard,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      content: [
        {
          type: 'timeline',
          text: 'Once your return is approved and the product is received in our facility, we will initiate the refund.'
        },
        {
          type: 'note',
          text: 'Please note: It may take additional time for your bank or credit card company to process and post the refund.'
        }
      ]
    }
  ];

  const contactInfo = {
    email: 'support@sribogat.com',
    phone: '7795451890',
    address: `Ground floor Building
Mallikarjuna Nilaya, 3rd Main Road,
6th cross, Shanthi Nagar
Hassan Karnataka 573201`,
    gst: '29LWVPS2833P1Z0'
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 bg-gradient-to-r from-amber-100 to-orange-100 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Link to={"/"}>
          <button 
            className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition-all duration-200 hover:shadow-md group mb-6 md:mb-8"
          >
            <ArrowLeft className="w-4 h-4 text-amber-700 group-hover:translate-x-[-2px] transition-transform" />
            <Home className="w-4 h-4 text-amber-700" />
            <span className="text-amber-800 font-medium text-sm md:text-base">Back to Home</span>
          </button>
          </Link>
          <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center space-x-2 bg-amber-200/50 rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="text-xs md:text-sm font-semibold text-amber-800">Order Policies</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-900 mb-4 md:mb-6">
              Order, Return & Refund Policy
            </h2>
            <p className="text-base md:text-lg text-amber-700 mb-6 md:mb-8 leading-relaxed px-4 md:px-0">
              Understanding our policies helps ensure a smooth shopping experience. All our products are freshly prepared and made to order.
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm px-4 md:px-0">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 border border-amber-300">
                <Package className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                <span className="text-amber-800 font-medium">Fresh Products</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 border border-amber-300">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                <span className="text-amber-800 font-medium">Made to Order</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 border border-amber-300">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                <span className="text-amber-800 font-medium">Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Policy Sections */}
          <div className="lg:col-span-2 space-y-8">
            {policyData.map((section, index) => {
              const IconComponent = section.icon;
              const isExpanded = expandedSection === section.id;
              
              return (
                <div 
                  key={section.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'transform scale-102' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-amber-50/50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-amber-900">{section.title}</h3>
                          <p className="text-amber-700 text-sm">Click to expand details</p>
                        </div>
                      </div>
                      <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ArrowRight className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4 animate-fadeIn">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          {item.type === 'highlight' && (
                            <div className={`${section.bgColor} rounded-xl p-4 border-l-4 ${section.borderColor}`}>
                              <p className="text-amber-800 leading-relaxed font-medium">{item.text}</p>
                            </div>
                          )}
                          
                          {item.type === 'important' && (
                            <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-500">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                                <p className="text-orange-800 leading-relaxed">{item.text}</p>
                              </div>
                            </div>
                          )}
                          
                          {item.type === 'list' && (
                            <div className="space-y-3">
                              {item.items.map((listItem, listIndex) => (
                                <div key={listIndex} className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-amber-800 leading-relaxed">{listItem}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {item.type === 'steps' && (
                            <div className="space-y-4">
                              {item.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className="bg-green-50 rounded-xl p-4 border border-green-200">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-sm font-bold">{step.number}</span>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-green-800 mb-1">{step.title}</h4>
                                      <p className="text-green-700 text-sm">{step.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {item.type === 'timeline' && (
                            <div className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-500">
                              <div className="flex items-start space-x-2">
                                <Clock className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                <p className="text-purple-800 leading-relaxed">{item.text}</p>
                              </div>
                            </div>
                          )}
                          
                          {item.type === 'note' && (
                            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                <p className="text-blue-800 leading-relaxed text-sm">{item.text}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Additional Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-amber-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-amber-900">Important Requirements</h3>
                  <p className="text-amber-700 text-xs md:text-sm">Essential documentation for returns</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Video className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Unboxing Video</span>
                  </div>
                  <p className="text-yellow-700 text-sm">Mandatory video evidence required for all damage claims</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">3-Day Window</span>
                  </div>
                  <p className="text-red-700 text-sm">Report issues within 3 days of delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Back to Home in Sidebar - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:block bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl text-white">
                <div className="text-center">
                  <Home className="w-8 h-8 mx-auto mb-3 opacity-90" />
                  <h4 className="text-lg font-bold mb-2">Continue Shopping</h4>
                  <p className="text-amber-100 text-sm mb-4">Explore our premium spices and coffee collection</p>
                  <Link to={"/products"}>
                  <button 
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 font-medium transition-all duration-200 hover:scale-105"
                  >
                    Browse Products
                  </button>
                  </Link>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-amber-200">
                <h4 className="text-lg md:text-xl font-bold text-amber-900 mb-4 flex items-center">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mr-2" />
                  Contact Support
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-green-800">Email</p>
                      <p className="text-xs text-green-600 font-mono break-all">{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Phone</p>
                      <p className="text-xs text-blue-600 font-mono">{contactInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-amber-200">
                <h4 className="text-lg md:text-xl font-bold text-amber-900 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Email Support</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                    <div className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Initiate Return</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Track Order</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-amber-200">
                <h4 className="text-lg md:text-xl font-bold text-amber-900 mb-4">Business Details</h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-amber-800 mb-1">Trade Name</p>
                    <p className="text-amber-600">SRIBOGAT</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-800 mb-1">GST Number</p>
                    <p className="text-amber-600 font-mono text-xs break-all">{contactInfo.gst}</p>
                  </div>
                  <div>
                    <p className="font-medium text-amber-800 mb-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      Address
                    </p>
                    <p className="text-amber-600 text-xs leading-relaxed whitespace-pre-line">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-amber-900 font-bold text-sm">SB</span>
              </div>
              <span className="text-xl font-bold">Sri Bogat</span>
            </div>
            <p className="text-amber-200 text-sm mb-4">Premium Spices & Coffee - From Our Farm to Your Kitchen</p>
            <div className="flex justify-center space-x-4 text-xs text-amber-300">
              <span>© 2024 Sri Bogat</span>
              <span>•</span>
              <span>All Rights Reserved</span>
              <span>•</span>
              <span>GST: {contactInfo.gst}</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .transform.scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
    </>
  );
}