import React, { useState } from 'react';
import { BellRing, X } from 'lucide-react';

export default function ToastNotification({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="toast-notification">
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: '#E2E8F0',
        color: '#1E293B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <BellRing size={18} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>
          {ticket.title || 'Support Ticket Assigned'}
        </span>
        <span style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
          Ticket #{ticket.id || 'TCK-8005'} assigned to {ticket.customer || 'Vikram M.'}
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
          {ticket.time || '03:15 PM • OMW System'}
        </span>
      </div>

      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94A3B8',
          marginLeft: 12
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
