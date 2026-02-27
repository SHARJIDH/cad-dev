'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, CheckCircle2, XCircle, Info, Shield } from 'lucide-react';

interface ModelData {
    rooms: Array<{
        name: string;
        x: number;
        z: number;
        width: number;
        length: number;
        height: number;
    }>;
    windows?: Array<any>;
    doors?: Array<any>;
}

interface ComplianceIssue {
    severity: 'pass' | 'warning' | 'fail';
    category: string;
    issue: string;
    recommendation?: string;
    code?: string;
}

interface CodeComplianceCheckerProps {
    modelData: ModelData;
}

export function CodeComplianceChecker({ modelData }: CodeComplianceCheckerProps) {
    const [issues, setIssues] = useState<ComplianceIssue[]>([]);
    const [overallScore, setOverallScore] = useState(0);

    useEffect(() => {
        if (modelData) {
            analyzeCompliance();
        }
    }, [modelData]);

    const analyzeCompliance = () => {
        const foundIssues: ComplianceIssue[] = [];

        // Check each room
        modelData.rooms.forEach((room, index) => {
            const area = room.width * room.length;
            const roomName = room.name || `Room ${index + 1}`;

            // 1. Minimum Room Size Requirements
            if (roomName.toLowerCase().includes('bedroom')) {
                if (area < 70) {
                    foundIssues.push({
                        severity: 'fail',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft is below minimum (70 sq ft required for bedrooms)`,
                        recommendation: 'Increase room dimensions to meet code requirements',
                        code: 'IRC R304.1'
                    });
                } else if (area < 80) {
                    foundIssues.push({
                        severity: 'warning',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft meets minimum but is small`,
                        recommendation: 'Consider increasing size for better livability',
                    });
                } else {
                    foundIssues.push({
                        severity: 'pass',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft meets requirements`,
                    });
                }
            }

            if (roomName.toLowerCase().includes('kitchen')) {
                if (area < 50) {
                    foundIssues.push({
                        severity: 'fail',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft is too small (minimum 50 sq ft recommended)`,
                        recommendation: 'Expand kitchen area for functional workspace',
                    });
                } else if (area < 70) {
                    foundIssues.push({
                        severity: 'warning',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft is compact`,
                        recommendation: 'Consider more space for appliances and workspace',
                    });
                } else {
                    foundIssues.push({
                        severity: 'pass',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft is adequate`,
                    });
                }
            }

            if (roomName.toLowerCase().includes('bathroom')) {
                if (area < 21) {
                    foundIssues.push({
                        severity: 'fail',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft is below minimum (21 sq ft required)`,
                        recommendation: 'Increase bathroom size to code minimum',
                        code: 'IRC R307.1'
                    });
                } else {
                    foundIssues.push({
                        severity: 'pass',
                        category: 'Room Size',
                        issue: `${roomName}: ${area.toFixed(1)} sq ft meets requirements`,
                    });
                }
            }

            // 2. Ceiling Height Requirements
            if (room.height < 7) {
                foundIssues.push({
                    severity: 'fail',
                    category: 'Ceiling Height',
                    issue: `${roomName}: ${room.height.toFixed(1)} ft ceiling is below minimum (7 ft required)`,
                    recommendation: 'Increase ceiling height to meet code',
                    code: 'IRC R305.1'
                });
            } else if (room.height < 8) {
                foundIssues.push({
                    severity: 'warning',
                    category: 'Ceiling Height',
                    issue: `${roomName}: ${room.height.toFixed(1)} ft ceiling meets minimum but is low`,
                    recommendation: '8-9 ft ceilings are standard for modern homes',
                });
            } else {
                foundIssues.push({
                    severity: 'pass',
                    category: 'Ceiling Height',
                    issue: `${roomName}: ${room.height.toFixed(1)} ft ceiling height is good`,
                });
            }

            // 3. Room Width Requirements
            const minWidth = Math.min(room.width, room.length);
            if (roomName.toLowerCase().includes('bedroom') && minWidth < 7) {
                foundIssues.push({
                    severity: 'fail',
                    category: 'Room Dimensions',
                    issue: `${roomName}: Minimum dimension ${minWidth.toFixed(1)} ft is below required 7 ft`,
                    recommendation: 'Ensure at least one dimension is 7 ft minimum',
                    code: 'IRC R304.2'
                });
            }
        });

        // 4. Emergency Egress
        const bedrooms = modelData.rooms.filter(r => r.name?.toLowerCase().includes('bedroom'));
        const windows = modelData.windows || [];
        
        if (bedrooms.length > 0 && windows.length === 0) {
            foundIssues.push({
                severity: 'fail',
                category: 'Emergency Egress',
                issue: 'No windows detected - bedrooms require emergency egress windows',
                recommendation: 'Add egress windows to all bedrooms (minimum 5.7 sq ft opening)',
                code: 'IRC R310.1'
            });
        } else if (bedrooms.length > windows.length) {
            foundIssues.push({
                severity: 'warning',
                category: 'Emergency Egress',
                issue: `${bedrooms.length} bedrooms but only ${windows.length} windows detected`,
                recommendation: 'Ensure each bedroom has an emergency egress window',
                code: 'IRC R310.1'
            });
        } else if (windows.length > 0) {
            foundIssues.push({
                severity: 'pass',
                category: 'Emergency Egress',
                issue: `Windows present (${windows.length} detected)`,
            });
        }

        // 5. Multiple Exits
        const totalRooms = modelData.rooms.length;
        const doors = modelData.doors || [];
        
        if (totalRooms >= 5 && doors.length < 2) {
            foundIssues.push({
                severity: 'warning',
                category: 'Safety',
                issue: 'Large building should have multiple exits',
                recommendation: 'Add secondary exit for fire safety',
                code: 'IRC R311.4'
            });
        } else if (doors.length >= 2) {
            foundIssues.push({
                severity: 'pass',
                category: 'Safety',
                issue: 'Multiple exits present',
            });
        }

        // 6. Hallway Width
        // This is a simplified check - in a real implementation you'd analyze connections
        foundIssues.push({
            severity: 'warning',
            category: 'Circulation',
            issue: 'Unable to verify hallway width (minimum 3 ft required)',
            recommendation: 'Ensure all hallways are at least 36 inches wide',
            code: 'IRC R311.6'
        });

        // 7. Natural Light Requirements
        const livingSpaces = modelData.rooms.filter(r => {
            const name = r.name?.toLowerCase() || '';
            return name.includes('living') || name.includes('dining') || name.includes('bedroom');
        });

        livingSpaces.forEach(room => {
            const area = room.width * room.length;
            const requiredWindowArea = area * 0.08; // 8% of floor area
            
            foundIssues.push({
                severity: 'warning',
                category: 'Natural Light',
                issue: `${room.name}: Needs ${requiredWindowArea.toFixed(1)} sq ft of window area (8% of floor)`,
                recommendation: 'Verify window sizes meet natural light requirements',
                code: 'IRC R303.1'
            });
        });

        setIssues(foundIssues);

        // Calculate overall score
        const totalChecks = foundIssues.length;
        const passCount = foundIssues.filter(i => i.severity === 'pass').length;
        const warningCount = foundIssues.filter(i => i.severity === 'warning').length;
        const failCount = foundIssues.filter(i => i.severity === 'fail').length;

        // Score: Pass = 10 points, Warning = 5 points, Fail = 0 points
        const score = Math.round(((passCount * 10 + warningCount * 5) / (totalChecks * 10)) * 100);
        setOverallScore(score);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreGrade = (score: number) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    const passes = issues.filter(i => i.severity === 'pass').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const fails = issues.filter(i => i.severity === 'fail').length;

    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border-orange-200 dark:border-orange-500/30 p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Building Code Compliance</h3>
                    </div>

                    {/* Overall Score */}
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-orange-200 dark:border-dark-border">
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                                {getScoreGrade(overallScore)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                Compliance Score: {overallScore}%
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Passed</span>
                            </div>
                            <div className="text-2xl font-bold text-green-700">{passes}</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-xs font-medium text-yellow-700">Warnings</span>
                            </div>
                            <div className="text-2xl font-bold text-yellow-700">{warnings}</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-medium text-red-700">Violations</span>
                            </div>
                            <div className="text-2xl font-bold text-red-700">{fails}</div>
                        </div>
                    </div>

                    {/* Issues List */}
                    <ScrollArea className="h-[400px] rounded-lg border border-orange-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
                        <div className="space-y-3">
                            {issues.map((issue, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border ${
                                        issue.severity === 'pass'
                                            ? 'bg-green-50 border-green-200'
                                            : issue.severity === 'warning'
                                            ? 'bg-yellow-50 border-yellow-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {issue.severity === 'pass' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                        )}
                                        {issue.severity === 'warning' && (
                                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                                        )}
                                        {issue.severity === 'fail' && (
                                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs shrink-0"
                                                >
                                                    {issue.category}
                                                </Badge>
                                                {issue.code && (
                                                    <span className="text-xs text-gray-500 shrink-0">
                                                        {issue.code}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {issue.issue}
                                            </p>
                                            {issue.recommendation && (
                                                <p className="text-xs text-gray-600 flex items-start gap-1">
                                                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                                    {issue.recommendation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-orange-50 dark:bg-orange-500/10 p-2 rounded">
                        💡 Based on International Residential Code (IRC). Consult local building department for specific requirements.
                    </div>
                </div>
            </Card>
        </div>
    );
}
