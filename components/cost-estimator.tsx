'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { DollarSign, Home, Ruler } from 'lucide-react';

interface ModelData {
    rooms: Array<{
        name: string;
        x: number;
        z: number;
        width: number;
        length: number;
        height: number;
    }>;
}

interface CostEstimatorProps {
    modelData: ModelData;
}

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

// Fixed conversion rates (to INR as base)
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
    USD: 90,    // 1 USD = ₹90
    EUR: 95,    // 1 EUR = ₹95
    GBP: 110,   // 1 GBP = ₹110
    INR: 1,     // 1 INR = ₹1
};

const currencySymbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
};

export function CostEstimator({ modelData }: CostEstimatorProps) {
    const [basePriceINR, setBasePriceINR] = useState(9000); // Base price in INR (₹9000 ≈ $100)
    const [currency, setCurrency] = useState<CurrencyCode>('USD');

    /**
     * Convert INR to target currency
     */
    const convertFromINR = (amountINR: number, targetCurrency: CurrencyCode): number => {
        if (targetCurrency === 'INR') return amountINR;
        return amountINR / EXCHANGE_RATES[targetCurrency];
    };

    /**
     * Convert from target currency to INR
     */
    const convertToINR = (amount: number, fromCurrency: CurrencyCode): number => {
        if (fromCurrency === 'INR') return amount;
        return amount * EXCHANGE_RATES[fromCurrency];
    };

    const formatMoney = (amount: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${currencySymbols[currency]}${amount.toFixed(0)}`;
        }
    };

    // Display price in current currency
    const displayPrice = convertFromINR(basePriceINR, currency);

    // Calculate building metrics using INR as base
    const totalRooms = modelData.rooms.length;
    
    let totalArea = 0;
    const roomCosts = modelData.rooms.map(room => {
        const area = room.width * room.length;
        totalArea += area;
        
        // Room type-specific pricing multipliers
        let multiplier = 1;
        const roomNameLower = room.name.toLowerCase();
        
        if (roomNameLower.includes('bedroom')) multiplier = 0.9;
        if (roomNameLower.includes('bathroom')) multiplier = 1.3;
        if (roomNameLower.includes('kitchen')) multiplier = 1.6;
        if (roomNameLower.includes('living')) multiplier = 1.1;
        if (roomNameLower.includes('dining')) multiplier = 1.0;
        if (roomNameLower.includes('hallway')) multiplier = 0.7;
        
        // Cost in INR (base calculation)
        const roomCostINR = area * basePriceINR * multiplier;
        
        // Convert to target currency for display
        const roomCostDisplay = convertFromINR(roomCostINR, currency);
        
        return { name: room.name, area, costINR: roomCostINR, cost: roomCostDisplay, multiplier };
    });

    // All calculations in INR first, then convert to display currency
    const baseConstructionINR = totalArea * basePriceINR;
    const specializeRoomUpchargeINR = roomCosts.reduce((sum, r) => sum + (r.costINR - (r.area * basePriceINR)), 0);
    const laborCostsINR = baseConstructionINR * 0.25;
    const materialCostsINR = baseConstructionINR * 0.25;
    const contingencyINR = (baseConstructionINR + specializeRoomUpchargeINR + laborCostsINR + materialCostsINR) * 0.1;
    
    const totalEstimateINR = baseConstructionINR + specializeRoomUpchargeINR + laborCostsINR + materialCostsINR + contingencyINR;

    // Convert all to display currency
    const baseConstruction = convertFromINR(baseConstructionINR, currency);
    const specializeRoomUpcharge = convertFromINR(specializeRoomUpchargeINR, currency);
    const laborCosts = convertFromINR(laborCostsINR, currency);
    const materialCosts = convertFromINR(materialCostsINR, currency);
    const contingency = convertFromINR(contingencyINR, currency);
    const totalEstimate = convertFromINR(totalEstimateINR, currency);

    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border-orange-200 dark:border-orange-500/30 p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Cost Estimator</h3>
                    </div>

                    {/* Price Input */}
                    <div className="flex items-center gap-3 bg-white dark:bg-dark-surface rounded-lg p-3 border border-orange-200 dark:border-dark-border">
                        <label className="text-sm font-medium text-gray-700">Price per sq ft:</label>
                        <input
                            type="number"
                            value={displayPrice.toFixed(2)}
                            onChange={(e) => {
                                const inputValue = parseFloat(e.target.value) || 0;
                                setBasePriceINR(convertToINR(inputValue, currency));
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-dark-surface dark:text-white"
                        />
                        <select
                            value={currency}
                            onChange={(e) => {
                                const newCurrency = e.target.value as CurrencyCode;
                                setCurrency(newCurrency);
                            }}
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-dark-surface dark:text-white"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="INR">INR</option>
                        </select>
                    </div>

                    {/* Building Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white dark:bg-dark-surface rounded-lg p-2 border border-orange-200 dark:border-dark-border">
                            <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">Total Area</div>
                            <div className="text-sm font-bold text-orange-700 dark:text-orange-400 truncate">{totalArea.toFixed(0)} sq ft</div>
                        </div>
                        <div className="bg-white dark:bg-dark-surface rounded-lg p-2 border border-orange-200 dark:border-dark-border">
                            <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">Total Rooms</div>
                            <div className="text-sm font-bold text-orange-700 dark:text-orange-400 truncate">{totalRooms}</div>
                        </div>
                        <div className="bg-white dark:bg-dark-surface rounded-lg p-2 border border-orange-200 dark:border-dark-border">
                            <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">Avg per room</div>
                            <div className="text-sm font-bold text-orange-700 dark:text-orange-400 truncate">{(totalArea / totalRooms).toFixed(0)} sq ft</div>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 bg-white dark:bg-dark-surface rounded-lg p-4 border border-orange-200 dark:border-dark-border">
                        <div className="text-sm font-semibold text-gray-900 mb-3">Cost Breakdown</div>
                        
                        <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                            {roomCosts.map((room, i) => (
                                <div key={i} className="flex justify-between items-center gap-2 text-xs">
                                    <span className="text-gray-600 truncate flex-1">{room.name} ({room.area.toFixed(0)} sq ft)</span>
                                    <span className="font-semibold text-gray-900 shrink-0">{formatMoney(room.cost)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cost Summary */}
                    <div className="space-y-2 border-t border-orange-200 dark:border-dark-border pt-3">
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1">Base Construction</span>
                            <span className="font-semibold shrink-0">{formatMoney(baseConstruction)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 dark:text-gray-300 truncate flex-1">Specialized Rooms</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400 shrink-0">{formatMoney(specializeRoomUpcharge)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 truncate flex-1">Labor & Materials</span>
                            <span className="font-semibold shrink-0">{formatMoney(laborCosts + materialCosts)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 truncate flex-1">Contingency (10%)</span>
                            <span className="font-semibold shrink-0">{formatMoney(contingency)}</span>
                        </div>
                        
                        <div className="border-t border-orange-200 dark:border-dark-border pt-2 mt-2 flex justify-between items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">Total Estimate</span>
                            <span className="text-lg font-bold text-orange-700 dark:text-orange-400 shrink-0">{formatMoney(totalEstimate)}</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-orange-50 dark:bg-orange-500/10 p-3 rounded space-y-1">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">📊 How Estimation Works:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                            <li><strong>Base Cost:</strong> Total area × price per sq ft</li>
                            <li><strong>Room Adjustments:</strong> Kitchen (+60%), Bathroom (+30%), other specialists</li>
                            <li><strong>Labor & Materials:</strong> 50% of base construction</li>
                            <li><strong>Contingency:</strong> 10% buffer for unforeseen costs</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
