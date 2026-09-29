import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubscriptions, fetchInvoices, cancelSubscription } from '../redux/subscriptionSlice';
import {
    History, Download, ChevronLeft, CreditCard,
    Calendar, CheckCircle, ExternalLink, Printer, X, Eye, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { active, invoices } = useSelector(state => state.subscription);
    const [selectedInv, setSelectedInv] = useState(null);

    useEffect(() => {
        dispatch(fetchMySubscriptions());
        dispatch(fetchInvoices());
    }, [dispatch]);

    const activeSub = active?.find(s => s.status === 'SUBSCRIBED');

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-8 transition">
                    <ChevronLeft size={16} /> Back
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your premium payments and receipts.</p>
                    </div>
                    {activeSub && (
                        <div className="flex items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-200 shadow-sm">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current</p>
                                <p className="text-sm font-black text-slate-900">{activeSub.plan}</p>
                            </div>
                            <button onClick={() => dispatch(cancelSubscription(activeSub.subscriptionId))} className="ml-4 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">Cancel</button>
                        </div>
                    )}
                </div>

                {/* INVOICE TABLE */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.length > 0 ? [...invoices].reverse().map(inv => (
                                    <tr key={inv.invoiceID} className="hover:bg-slate-50/50 transition cursor-pointer group" onClick={() => setSelectedInv(inv)}>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-700">{new Date(inv.paymentDate).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 text-[10px] font-mono text-slate-400 uppercase">#{inv.transactionId.slice(0, 8)}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">₹{inv.amount}</td>
                                        <td className="px-8 py-5">
                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                <CheckCircle size={12} /> Paid
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedInv && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20">
                        <button onClick={() => setSelectedInv(null)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition"><X /></button>
                        <div className="p-10 pb-6 border-b border-dashed border-slate-200">
                            <div className="bg-slate-900 p-2 rounded-xl w-fit mb-6"><Briefcase className="w-6 h-6 text-white" /></div>
                            <h2 className="text-xl font-black text-slate-900">Tax Invoice</h2>
                            <p className="text-slate-400 text-[9px] font-bold uppercase mt-1 tracking-widest">ID: #{selectedInv.invoiceID}</p>
                            <div className="mt-6 flex justify-between">
                                <div><p className="text-[8px] font-black text-slate-400 uppercase mb-1">To</p><p className="text-xs font-bold">{selectedInv.recruiterEmail}</p></div>
                                <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Date</p><p className="text-xs font-bold">{new Date(selectedInv.paymentDate).toLocaleDateString()}</p></div>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="flex justify-between text-sm font-bold text-slate-600"><span>Recruiter Premium Plan</span><span>₹{selectedInv.amount}</span></div>
                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center"><span className="text-base font-black text-slate-900">Total</span><span className="text-2xl font-black text-blue-600">₹{selectedInv.amount}</span></div>
                            <div className="bg-slate-50 p-4 rounded-xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Transaction ID</p><p className="text-[10px] font-mono text-slate-500 break-all">{selectedInv.transactionId}</p></div>
                            <div className="flex gap-2 pt-4">
                                <button onClick={() => window.print()} className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"><Printer size={14} /> Print</button>
                                <button className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"><Download size={14} /> PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;