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

const currencySymbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
};

export function CostEstimator({ modelData }: CostEstimatorProps) {
    const [pricePerSqFt, setPricePerSqFt] = useState(150); // Default per sq ft
    const [currency, setCurrency] = useState<CurrencyCode>('USD');

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

    // Calculate building metrics
    const totalRooms = modelData.rooms.length;
    
    let totalArea = 0;
    const roomCosts = modelData.rooms.map(room => {
        const area = room.width * room.length;
        totalArea += area;
        
        // Room type-specific pricing
        let multiplier = 1;
        if (room.name.includes('Bedroom')) multiplier = 1;
        if (room.name.includes('Bathroom')) multiplier = 1.2;
        if (room.name.includes('Kitchen')) multiplier = 1.5;
        if (room.name.includes('Living')) multiplier = 1.1;
        if (room.name.includes('Dining')) multiplier = 1;
        
        const roomCost = area * pricePerSqFt * multiplier;
        return { name: room.name, area, cost: roomCost };
    });

    const baseConstruction = totalArea * pricePerSqFt;
    const specializeRoomUpcharge = roomCosts.reduce((sum, r) => sum + (r.cost - (r.area * pricePerSqFt)), 0);
    const laborCosts = baseConstruction * 0.2;
    const materialCosts = baseConstruction * 0.3;
    const contingency = (baseConstruction + laborCosts + materialCosts) * 0.1;
    
    const totalEstimate = baseConstruction + specializeRoomUpcharge + laborCosts + materialCosts + contingency;

    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900">Cost Estimator</h3>
                    </div>

                    {/* Price Input */}
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-emerald-200">
                        <label className="text-sm font-medium text-gray-700">Price per sq ft:</label>
                        <input
                            type="number"
                            value={pricePerSqFt}
                            onChange={(e) => setPricePerSqFt(parseFloat(e.target.value) || 150)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="INR">INR</option>
                        </select>
                    </div>

                    {/* Building Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-lg p-2 border border-emerald-200">
                            <div className="text-[10px] text-gray-600 leading-tight">Total Area</div>
                            <div className="text-sm font-bold text-emerald-700 truncate">{totalArea.toFixed(0)} sq ft</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-emerald-200">
                            <div className="text-[10px] text-gray-600 leading-tight">Total Rooms</div>
                            <div className="text-sm font-bold text-emerald-700 truncate">{totalRooms}</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-emerald-200">
                            <div className="text-[10px] text-gray-600 leading-tight">Avg per room</div>
                            <div className="text-sm font-bold text-emerald-700 truncate">{(totalArea / totalRooms).toFixed(0)} sq ft</div>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="space-y-2 bg-white rounded-lg p-4 border border-emerald-200">
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
                    <div className="space-y-2 border-t border-emerald-200 pt-3">
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 truncate flex-1">Base Construction</span>
                            <span className="font-semibold shrink-0">{formatMoney(baseConstruction)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 truncate flex-1">Specialized Rooms</span>
                            <span className="font-semibold text-emerald-600 shrink-0">{formatMoney(specializeRoomUpcharge)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 truncate flex-1">Labor & Materials</span>
                            <span className="font-semibold shrink-0">{formatMoney(laborCosts + materialCosts)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-sm">
                            <span className="text-gray-700 truncate flex-1">Contingency (10%)</span>
                            <span className="font-semibold shrink-0">{formatMoney(contingency)}</span>
                        </div>
                        
                        <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between items-center gap-2">
                            <span className="font-bold text-gray-900">Total Estimate</span>
                            <span className="text-lg font-bold text-emerald-700 shrink-0">{formatMoney(totalEstimate)}</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-emerald-50 p-2 rounded">
                        💡 Estimates include kitchen/bathroom premiums and standard labor costs
                    </div>
                </div>
            </Card>
        </div>
    );
}
