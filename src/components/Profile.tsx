import { User, Mail, Phone, MapPin, ShoppingBag, FileText, Settings, LogOut, CreditCard, Trash2, AlertTriangle, Edit, Save, X, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { useRazorpay } from 'react-razorpay';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import logo from '../logo.png';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import Spinner from './Spinner';
import 'react-phone-number-input/style.css';

interface Quotation {
  id: string;
  type: string;
  status: string;
  created_at: string;
  config: {
    currency?: 'INR' | 'USD';
    total?: number;
    [key: string]: any;
  };
  additional_message: string | null;
  file_path: string | null;
}

interface ProfileType {
  full_name: string | null;
  phone: string | null;
  [key: string]: any;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pastOrders, setPastOrders] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [quoteToCancel, setQuoteToCancel] = useState<Quotation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<ProfileType | null>(null);
  const [saving, setSaving] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { Razorpay } = useRazorpay();

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch profile and quotations in parallel
    const [profileResponse, quotationsResponse] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).limit(1).single(),
      supabase
        .from('quotations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (profileResponse.error || quotationsResponse.error) {
      setError(profileResponse.error || quotationsResponse.error);
    } else {
      setProfile(profileResponse.data);
      setEditableProfile(profileResponse.data); // Initialize editable profile
      if (quotationsResponse.data) {
        setQuotations(quotationsResponse.data.filter(q => ['Pending Review', 'Quoted'].includes(q.status)));
        setPastOrders(quotationsResponse.data.filter(q => !['Pending Review', 'Quoted'].includes(q.status)));
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const handlePayment = useCallback(async (quote: Quotation) => {
    if (!Razorpay || !user || !profile) {
      setPaymentMessage({ type: 'error', text: 'Payment service or user data is not available. Please refresh.' });
      return;
    }

    const options = {
      key: 'rzp_live_RVLpP9s4B07vLY', // IMPORTANT: Replace with your Razorpay Test Key ID
      amount: (quote.config.total || 0) * 100, // amount in the smallest currency unit (paise for INR)
      currency: quote.config.currency || 'INR',
      name: 'Miccroten Circuits',
      description: `Payment for Quote #${quote.id.substring(0, 8)}`,
      image: logo,
      handler: async (response: any) => {
        // On successful payment, update the quotation status to 'Paid'
        const { error: updateError } = await supabase
          .from('quotations')
          .update({ status: 'Paid', razorpay_payment_id: response.razorpay_payment_id })
          .eq('id', quote.id);

        if (updateError) {
          setPaymentMessage({ type: 'error', text: `Payment successful, but failed to update order status. Please contact support with Payment ID: ${response.razorpay_payment_id}` });
        } else {
          setPaymentMessage({ type: 'success', text: `Payment successful! Payment ID: ${response.razorpay_payment_id}` });
          // Refresh data to move the item to 'Past Orders' after a short delay
          setTimeout(() => fetchUserData(), 2000);
        }
      },
      prefill: {
        name: profile.full_name || '',
        email: user.email || '',
        contact: profile.phone || '',
      },
      notes: {
        quotation_id: quote.id,
        user_id: user.id,
      },
      theme: {
        color: '#F97316', // Orange-500
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();

  }, [Razorpay, user, profile, fetchUserData]);

  const handleProfileChange = (field: keyof ProfileType, value: any) => {
    setEditableProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveProfile = async () => {
    if (!user || !editableProfile) return;

    if (editableProfile.phone && !isValidPhoneNumber(editableProfile.phone)) {
      // You can set a proper error state here to show in the UI
      alert('Please enter a valid phone number.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: editableProfile.full_name,
        phone: editableProfile.phone,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError);
    } else {
      setIsEditing(false);
      await fetchUserData(); // Refresh data
    }
    setSaving(false);
  };

  const openCancelModal = (quote: Quotation) => {
    setQuoteToCancel(quote);
    setIsCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setQuoteToCancel(null);
  };

  const confirmCancelQuotation = async () => {
    if (!quoteToCancel) return;

    try {
      // First, delete the associated file from storage if it exists
      if (quoteToCancel.file_path) {
        const { error: storageError } = await supabase.storage.from('file-storage').remove([quoteToCancel.file_path]);
        if (storageError) {
          // Log the error but proceed to delete the DB record anyway
          console.error('Could not delete file from storage:', storageError.message);
        }
      }

      // Then, delete the quotation record from the database
      const { error: deleteError } = await supabase.from('quotations').delete().eq('id', quoteToCancel.id);
      if (deleteError) throw deleteError;

      // Refresh the data to update the UI
      await fetchUserData();
    } catch (err: any) {
      setError(err);
    } finally {
      closeCancelModal();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        if (loading) return (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        );
        if (error) return <div className="text-red-500">Error loading orders: {error.message}</div>;
        return (
          <div>
            <h3 className="text-2xl font-bold text-navy-900 mb-4">Past Orders</h3>
            {pastOrders.length > 0 ? (
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                    <div>
                      <p className="font-bold text-navy-900">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {order.config.currency === 'USD' ? '$' : '₹'}
                        {order.config.total?.toLocaleString(order.config.currency === 'USD' ? 'en-US' : 'en-IN') || 'N/A'}
                      </p>
                      <span className={`text-sm px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">You have no past orders.</p>
            )}
          </div>
        );
      case 'quotations':
        if (loading) return (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        );
        if (error) return <div className="text-red-500">Error loading quotations: {error.message}</div>;
        return (
          <div>
            <h3 className="text-2xl font-bold text-navy-900 mb-4">My Quotations</h3>
            {quotations.length > 0 ? (
              <div className="space-y-4">
                {quotations.map(quote => (
                  <div key={quote.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                    <div>
                      <p className="font-bold text-navy-900">Quote #{quote.id.substring(0, 8)} <span className="text-sm font-normal text-slate-600">({quote.type})</span></p>
                      <p className="text-sm text-slate-500">{new Date(quote.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      {quote.status === 'Quoted' ? (
                        <>
                          <div className="font-semibold text-navy-900">
                            <p>
                              {quote.config.currency === 'USD' ? '$' : '₹'}
                              {quote.config.total?.toLocaleString(quote.config.currency === 'USD' ? 'en-US' : 'en-IN') || 'N/A'}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">{quote.status}</span>
                          </div>
                          <button
                            onClick={() => handlePayment(quote)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        </>
                      ) : (
                        <span className="text-sm px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">{quote.status}</span>
                      )}
                      
                      {['Pending Review', 'Quoted'].includes(quote.status) && (
                        <button
                          onClick={() => openCancelModal(quote)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Cancel Quotation"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">You have no active quotations.</p>
            )}
          </div>
        );
      default:
        if (loading) return (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        );
        if (error) return <div className="text-red-500">Error loading details: {error.message}</div>;
        return (
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6">
              <h3 className="text-2xl font-bold text-navy-900">My Details</h3>
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditableProfile(profile); }} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-200">
              <div className="py-4">
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableProfile?.full_name || ''}
                    onChange={(e) => handleProfileChange('full_name', e.target.value)}
                    className="w-full text-lg font-semibold text-navy-900 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-navy-900">{profile?.full_name || 'N/A'}</p>
                )}
              </div>
              <div className="py-4">
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <p className="text-lg text-slate-500">{user?.email} (cannot be changed)</p>
              </div>
              <div className="py-4">
                <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                {isEditing ? (
                  <div className="w-full custom-phone-input border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
                    <PhoneInput
                      international
                      value={editableProfile?.phone || ''}
                      onChange={(value) => handleProfileChange('phone', value)}
                    />
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-navy-900">{profile?.phone || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const tabs = [
    { id: 'details', name: 'My Details', icon: User },
    { id: 'orders', name: 'Past Orders', icon: ShoppingBag },
    { id: 'quotations', name: 'My Quotations', icon: FileText },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">My Profile</h2>
          <p className="text-xl text-slate-600">Manage your information, orders, and quotations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-navy-900 hover:bg-slate-100'}`}>
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold text-red-600 hover:bg-red-50 transition-colors"><LogOut className="w-5 h-5" /> Logout</button>
              </div>
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[400px]">
              {paymentMessage && (
                <div
                  className={`border rounded-lg p-4 mb-6 text-sm ${paymentMessage.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-700'}`}
                  role="alert"
                >
                  {paymentMessage.text}
                </div>
              )}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {isCancelModalOpen && quoteToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mt-4">
              Cancel Quotation
            </h3>
            <p className="text-slate-600 mt-2">
              Are you sure you want to cancel your quotation for <span className="font-semibold">Quote #{quoteToCancel.id.substring(0, 8)}</span>? This action cannot be undone.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={closeCancelModal}
                className="px-6 py-2.5 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Keep Quotation
              </button>
              <button
                onClick={confirmCancelQuotation}
                className="px-6 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}