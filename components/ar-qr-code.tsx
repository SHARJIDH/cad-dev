'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { QrCode, Smartphone, X, Share2, Download } from 'lucide-react';
import QRCode from 'qrcode';

interface ARQRCodeProps {
    modelData: any;
}

export function ARQRCode({ modelData }: ARQRCodeProps) {
    const [showQR, setShowQR] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [arUrl, setArUrl] = useState<string>('');

    useEffect(() => {
        if (showQR && modelData) {
            generateQRCode();
        }
    }, [showQR, modelData]);

    const generateQRCode = async () => {
        try {
            // Create AR session in the database via API
            const response = await fetch('/api/ar-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ modelData }),
            });

            if (!response.ok) {
                throw new Error('Failed to create AR session');
            }

            const { sessionId } = await response.json();
            
            // Create URL with the session ID
            const baseUrl = window.location.origin;
            const url = `${baseUrl}/ar-viewer?id=${sessionId}`;
            setArUrl(url);

            // Generate QR code with the URL
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#7C3AED',
                    light: '#FFFFFF',
                },
            });
            setQrCodeUrl(qrDataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Failed to generate QR code. Please try again.');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(arUrl);
        // You could add a toast notification here
        alert('AR link copied to clipboard!');
    };

    const downloadQR = () => {
        const link = document.createElement('a');
        link.download = 'ar-view-qr-code.png';
        link.href = qrCodeUrl;
        link.click();
    };

    if (!showQR) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setShowQR(true)}
            >
                <Smartphone className="h-3.5 w-3.5" />
                View in AR
            </Button>
        );
    }

    const modalContent = (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[60]"
                onClick={() => setShowQR(false)}
            />

            {/* QR Code Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <Card className="w-full max-w-md bg-white p-6 relative pointer-events-auto shadow-2xl">{/* Close button */}
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setShowQR(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <QrCode className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">View in Augmented Reality</h3>
                        <p className="text-sm text-gray-600">
                            Scan this QR code with your phone to view the design in AR
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white border-4 border-purple-100 rounded-lg p-4 mb-6">
                        {qrCodeUrl ? (
                            <img
                                src={qrCodeUrl}
                                alt="AR View QR Code"
                                className="w-full h-auto"
                            />
                        ) : (
                            <div className="aspect-square flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">Generating QR code...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">📱 Instructions:</h4>
                        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Open your phone camera</li>
                            <li>Point at this QR code</li>
                            <li>Tap the notification to open</li>
                            <li>Point at a flat surface</li>
                            <li>Tap to place the model</li>
                        </ol>
                    </div>

                    {/* Device Compatibility */}
                    <div className="text-xs text-gray-500 text-center mb-4">
                        <p>✅ iOS 12+ (ARKit) • ✅ Android with ARCore</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={copyToClipboard}
                        >
                            <Share2 className="h-3 w-3 mr-2" />
                            Copy Link
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={downloadQR}
                        >
                            <Download className="h-3 w-3 mr-2" />
                            Download QR
                        </Button>
                    </div>

                    {/* Direct Link */}
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Or share this link:</p>
                        <p className="text-xs text-purple-600 font-mono break-all">
                            {arUrl}
                        </p>
                    </div>
                </Card>
            </div>
        </>
    );

    // Render modal using portal to ensure it's at the root level
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
