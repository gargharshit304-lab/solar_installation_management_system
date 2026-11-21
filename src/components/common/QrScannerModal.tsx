import React, { useState } from 'react';
import { Modal } from './Modal';
import { QrCode, Scan, CheckCircle2, Search, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSerial?: (serialNumber: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectSerial
}) => {
  const { serialNumbers, showToast } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);

  const simulateQuickScan = (code: string) => {
    setScannedResult(code);
    setIsScanningActive(false);
    showToast(`Serial number ${code} scanned successfully!`, 'success');
  };

  const handleConfirm = () => {
    const code = scannedResult || manualCode.trim();
    if (!code) return;
    if (onSelectSerial) {
      onSelectSerial(code);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode & QR Serial Scanner"
      subtitle="Scan equipment barcode or select from registered warehouse hardware"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Optical Scanning Viewport Simulation */}
        <div className="relative bg-charcoal rounded-xl p-6 text-center overflow-hidden border-2 border-dashed border-warmGrey">
          {/* Animated Laser Beam */}
          <div className="absolute inset-x-0 h-0.5 bg-terracotta/80 shadow-[0_0_10px_#B85C52] animate-bounce" style={{ top: '45%' }} />
          
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <Scan className="w-16 h-16 text-sand animate-pulse" />
            <div className="text-white">
              <p className="text-sm font-medium">Position Barcode / QR Code in Viewport</p>
              <p className="text-xs text-warmGrey-light mt-1">Camera reader active: autofocus calibrated</p>
            </div>
          </div>

          {scannedResult && (
            <div className="absolute inset-0 bg-navy/90 flex flex-col items-center justify-center p-4 text-white animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-sage mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-sage">Serial Verified</p>
              <p className="text-lg font-mono font-bold mt-1">{scannedResult}</p>
              <button
                type="button"
                onClick={() => setScannedResult(null)}
                className="mt-3 text-xs text-sand underline hover:text-white"
              >
                Scan another code
              </button>
            </div>
          )}
        </div>

        {/* Quick Sample Selector for Instant Simulation */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-2">
            Simulate Quick Hardware Scan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {serialNumbers.slice(0, 4).map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => simulateQuickScan(item.serialNumber)}
                className="text-left p-2.5 rounded-lg border border-warmGrey hover:border-navy hover:bg-sand-50 transition-all text-xs"
              >
                <div className="font-mono font-bold text-navy truncate">{item.serialNumber}</div>
                <div className="text-[11px] text-mutedGrey truncate">{item.productName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Keyboard Entry */}
        <div className="pt-2 border-t border-warmGrey/60">
          <label className="block text-xs font-semibold text-charcoal mb-1.5">
            Or Enter Serial Number Manually:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="e.g. DEYE-2026-INV-99410"
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 text-xs font-mono border border-warmGrey rounded-lg focus:outline-none focus:ring-1 focus:ring-navy focus:border-navy"
            />
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!scannedResult && !manualCode.trim()}
              className="px-4 py-2 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy-light disabled:opacity-50 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
