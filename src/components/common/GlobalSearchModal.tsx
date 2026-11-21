import React, { useState, useEffect } from 'react';
import { Search, X, User, FileText, ShoppingCart, Wrench, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isGlobalSearchOpen, 
    setIsGlobalSearchOpen,
    customers,
    orders,
    quotations,
    inventory,
    serialNumbers,
    complaints
  } = useApp();

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Results aggregation across multiple entities
  const matchingCustomers = trimmed
    ? customers.filter(c => c.fullName.toLowerCase().includes(trimmed) || c.phone.includes(trimmed) || c.customerCode.toLowerCase().includes(trimmed))
    : [];

  const matchingOrders = trimmed
    ? orders.filter(o => o.orderNumber.toLowerCase().includes(trimmed) || o.customerName.toLowerCase().includes(trimmed))
    : [];

  const matchingQuotations = trimmed
    ? quotations.filter(q => q.quotationNumber.toLowerCase().includes(trimmed) || q.customerName.toLowerCase().includes(trimmed))
    : [];

  const matchingInventory = trimmed
    ? inventory.filter(i => i.name.toLowerCase().includes(trimmed) || i.sku.toLowerCase().includes(trimmed))
    : [];

  const matchingSerials = trimmed
    ? serialNumbers.filter(s => s.serialNumber.toLowerCase().includes(trimmed) || (s.assignedCustomer && s.assignedCustomer.toLowerCase().includes(trimmed)))
    : [];

  const matchingTickets = trimmed
    ? complaints.filter(t => t.complaintId.toLowerCase().includes(trimmed) || t.customerName.toLowerCase().includes(trimmed) || t.faultCode.toLowerCase().includes(trimmed))
    : [];

  const hasResults = matchingCustomers.length > 0 || matchingOrders.length > 0 || matchingQuotations.length > 0 || matchingInventory.length > 0 || matchingSerials.length > 0 || matchingTickets.length > 0;

  const handleSelect = (path: string) => {
    setIsGlobalSearchOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsGlobalSearchOpen(false)}
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-dropdown border border-warmGrey overflow-hidden animate-in zoom-in-95 duration-150">
          
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-warmGrey/60 bg-sand-50/50">
            <Search className="w-5 h-5 text-navy mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search customers, orders, quotations, serial #s, tickets..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm font-medium bg-transparent focus:outline-none placeholder:text-mutedGrey text-charcoal"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-mutedGrey hover:text-charcoal mr-2">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-warmGrey/40 text-charcoal rounded border border-warmGrey">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-4 space-y-4">
            {!query && (
              <div className="text-center py-8 text-mutedGrey text-xs">
                <p className="font-semibold text-charcoal">Quick Navigation Shortcuts</p>
                <p className="mt-1">Type a name, phone, order number, or equipment serial to instantly search.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button onClick={() => handleSelect('/customers')} className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 rounded-lg text-charcoal font-medium">Customers</button>
                  <button onClick={() => handleSelect('/inventory')} className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 rounded-lg text-charcoal font-medium">Inventory</button>
                  <button onClick={() => handleSelect('/orders')} className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 rounded-lg text-charcoal font-medium">Orders</button>
                  <button onClick={() => handleSelect('/installations')} className="px-2.5 py-1 bg-sand-100 hover:bg-sand-200 rounded-lg text-charcoal font-medium">Installations</button>
                </div>
              </div>
            )}

            {query && !hasResults && (
              <div className="text-center py-8 text-mutedGrey text-xs">
                No matching records found for "{query}".
              </div>
            )}

            {/* Customers Matches */}
            {matchingCustomers.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey mb-2 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-navy" /> Customers ({matchingCustomers.length})
                </p>
                <div className="space-y-1">
                  {matchingCustomers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(`/customers?id=${c.id}`)}
                      className="p-2.5 rounded-xl hover:bg-sand-100 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-warmGrey"
                    >
                      <div>
                        <p className="text-xs font-bold text-charcoal">{c.fullName}</p>
                        <p className="text-[11px] text-mutedGrey">{c.phone} • {c.city} • {c.interestedCapacityKw} kW</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-mutedGrey" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Matches */}
            {matchingOrders.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey mb-2 flex items-center">
                  <ShoppingCart className="w-3.5 h-3.5 mr-1 text-navy" /> Orders ({matchingOrders.length})
                </p>
                <div className="space-y-1">
                  {matchingOrders.map(o => (
                    <div
                      key={o.id}
                      onClick={() => handleSelect('/orders')}
                      className="p-2.5 rounded-xl hover:bg-sand-100 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-warmGrey"
                    >
                      <div>
                        <p className="text-xs font-bold text-charcoal">{o.orderNumber} — {o.customerName}</p>
                        <p className="text-[11px] text-mutedGrey">₹{o.totalOrderValue.toLocaleString('en-IN')} • {o.orderStatus.replace('_', ' ')}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-mutedGrey" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Serial Numbers Matches */}
            {matchingSerials.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-mutedGrey mb-2 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-navy" /> Equipment Serials ({matchingSerials.length})
                </p>
                <div className="space-y-1">
                  {matchingSerials.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleSelect('/warranty')}
                      className="p-2.5 rounded-xl hover:bg-sand-100 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-warmGrey"
                    >
                      <div>
                        <p className="text-xs font-mono font-bold text-navy">{s.serialNumber}</p>
                        <p className="text-[11px] text-mutedGrey">{s.productName} • Status: {s.currentStatus}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-mutedGrey" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2 bg-sand-50/70 border-t border-warmGrey/60 text-[11px] text-mutedGrey flex items-center justify-between">
            <span>Search connects CRM, Inventory, Logistics and Warranties</span>
            <span>SunPower Solutions</span>
          </div>

        </div>
      </div>
    </div>
  );
};
