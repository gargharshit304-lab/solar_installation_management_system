import React from 'react';
import { Cpu, Terminal, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const AgentActivityPage: React.FC = () => {
  const agentLogs = [
    {
      id: 'log-1',
      timestamp: 'Today, 14:15:20',
      agent: 'SolarOS Operations Daemon',
      action: 'Inventory Threshold Evaluation',
      status: 'warning',
      details: 'Identified Growatt 3.3kW inverter stock at 6 units (Threshold: 8). Notification sent to Warehouse Manager.'
    },
    {
      id: 'log-2',
      timestamp: 'Today, 12:30:11',
      agent: 'Logistics Warranty Agent',
      action: 'Delivery Warranty Trigger',
      status: 'success',
      details: 'Confirmed site delivery for DSP-2026-029. Successfully computed 2-year inverter and 20-year panel warranty.'
    },
    {
      id: 'log-3',
      timestamp: 'Today, 10:00:00',
      agent: 'Financial Reconciler Agent',
      action: 'Daily P&L Ledger Sync',
      status: 'success',
      details: 'Reconciled 3 customer receipts totaling ₹3,95,950. Calculated average gross margin at 27.12%.'
    },
    {
      id: 'log-4',
      timestamp: 'Yesterday, 17:45:00',
      agent: 'Site Survey Azimuth Validator',
      action: 'Shadow Obstruction Check',
      status: 'success',
      details: 'Processed AutoCAD survey for Baner Hill View. Approved 94.5 sq.m shadow-free RCC area.'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-navy" />
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Autonomous Agent Activity Stream</h1>
        </div>
        <p className="text-xs text-mutedGrey mt-0.5">
          Real-time execution telemetry for background AI daemons, Retell AI voice handlers & Dify business agents
        </p>
      </div>

      <div className="bg-white rounded-card border border-warmGrey/60 shadow-card divide-y divide-warmGrey/40">
        {agentLogs.map(log => (
          <div key={log.id} className="p-4 flex items-start space-x-3 hover:bg-sand-50/60 transition-colors text-xs">
            <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
              log.status === 'warning' ? 'bg-amber-50 text-amber' : 'bg-sage-50 text-sage'
            }`}>
              {log.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal">{log.action}</span>
                <span className="text-[11px] text-mutedGrey font-mono">{log.timestamp}</span>
              </div>
              <p className="text-[11px] font-mono text-navy font-semibold mt-0.5">{log.agent}</p>
              <p className="text-mutedGrey mt-1">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
