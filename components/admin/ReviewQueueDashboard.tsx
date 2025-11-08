'use client';

/**
 * Admin Review Queue Dashboard
 *
 * Displays AI-generated content awaiting review.
 * Shows confidence scores, validation checks, and allows
 * admins to approve, reject, or edit content.
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/lib/logger';
import {
  CheckCircle,
  XCircle,
  Edit,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Heart
} from 'lucide-react';

// Types for review queue items
interface ReviewQueueItem {
  id: string;
  type: 'question' | 'clinical-case';
  content: any;
  confidence: {
    overall: number;
    sourceAccuracy: number;
    medicalAccuracy: number;
    pedagogicalQuality: number;
    technicalValidity: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  generatedAt: Date;
  issues: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export default function ReviewQueueDashboard() {
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'high-priority'>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const loadReviewQueue = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from API
      // For now, load mock data
      const mockData = generateMockReviewQueue();
      setQueueItems(mockData);
    } catch (error) {
      logger.error('Failed to load review queue', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    // Approve and publish content
    const updatedItems = queueItems.map((item) =>
      item.id === itemId ? { ...item, status: 'approved' as const } : item
    );
    setQueueItems(updatedItems);
    setSelectedItem(null);
  };

  const handleReject = async (itemId: string) => {
    // Reject content (won't be published)
    const updatedItems = queueItems.map((item) =>
      item.id === itemId ? { ...item, status: 'rejected' as const } : item
    );
    setQueueItems(updatedItems);
    setSelectedItem(null);
  };

  const handleRequestRevision = async (itemId: string) => {
    // Flag for AI revision
    const updatedItems = queueItems.map((item) =>
      item.id === itemId ? { ...item, status: 'needs-revision' as const } : item
    );
    setQueueItems(updatedItems);
    setSelectedItem(null);
  };

  const filteredItems = queueItems.filter((item) => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'high-priority')
      return item.status === 'pending' && (item.priority === 'critical' || item.priority === 'high');
    return true;
  });

  const stats = {
    total: queueItems.length,
    pending: queueItems.filter((i) => i.status === 'pending').length,
    approved: queueItems.filter((i) => i.status === 'approved').length,
    rejected: queueItems.filter((i) => i.status === 'rejected').length,
    avgConfidence:
      queueItems.reduce((sum, item) => sum + item.confidence.overall, 0) / queueItems.length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Granskningskö</h1>
        <p className="text-muted-foreground">AI-genererat innehåll som väntar på granskning</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Väntar</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Godkända</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avvisade</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Snitt-tillförlitlighet</p>
                <p className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Granskningskö</CardTitle>
              <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
                <TabsList>
                  <TabsTrigger value="all">Alla</TabsTrigger>
                  <TabsTrigger value="pending">Väntar</TabsTrigger>
                  <TabsTrigger value="high-priority">Prioritet</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <p className="text-muted-foreground">Laddar...</p>
              ) : filteredItems.length === 0 ? (
                <p className="text-muted-foreground">Ingen innehåll att granska</p>
              ) : (
                filteredItems.map((item) => (
                  <QueueItemCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => setSelectedItem(item)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detail View */}
        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <ReviewItemDetail
                item={selectedItem}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestRevision={handleRequestRevision}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Välj ett innehåll för att granska
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Queue Item Card Component
 */
function QueueItemCard({
  item,
  isSelected,
  onClick,
}: {
  item: ReviewQueueItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const priorityColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    'needs-revision': 'bg-purple-100 text-purple-800',
  };

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {item.type === 'question' ? (
            <FileText className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Heart className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{item.id}</span>
        </div>
        <Badge className={priorityColors[item.priority]}>{item.priority}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Tillförlitlighet: {(item.confidence.overall * 100).toFixed(1)}%
          </div>
        </div>
        <Badge className={statusColors[item.status]}>{item.status}</Badge>
      </div>

      {item.issues.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
          <AlertTriangle className="h-3 w-3" />
          <span>{item.issues.length} problem</span>
        </div>
      )}
    </div>
  );
}

/**
 * Review Item Detail Component
 */
function ReviewItemDetail({
  item,
  onApprove,
  onReject,
  onRequestRevision,
}: {
  item: ReviewQueueItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestRevision: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Confidence Breakdown */}
      <div>
        <h3 className="font-semibold mb-3">Tillförlitlighetsanalys</h3>
        <div className="space-y-2">
          <ConfidenceBar
            label="Källnoggrannhet"
            value={item.confidence.sourceAccuracy}
            color="blue"
          />
          <ConfidenceBar
            label="Medicinsk noggrannhet"
            value={item.confidence.medicalAccuracy}
            color="green"
          />
          <ConfidenceBar
            label="Pedagogisk kvalitet"
            value={item.confidence.pedagogicalQuality}
            color="purple"
          />
          <ConfidenceBar
            label="Teknisk validitet"
            value={item.confidence.technicalValidity}
            color="orange"
          />
          <div className="pt-2 border-t">
            <ConfidenceBar
              label="Totalt"
              value={item.confidence.overall}
              color="gray"
              bold
            />
          </div>
        </div>
      </div>

      {/* Issues */}
      {item.issues.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Identifierade problem</h3>
          <div className="space-y-2">
            {item.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div>
        <h3 className="font-semibold mb-3">Innehållsförhandsvisning</h3>
        <div className="p-3 bg-gray-50 rounded-lg border text-sm">
          <pre className="whitespace-pre-wrap">{JSON.stringify(item.content, null, 2)}</pre>
        </div>
      </div>

      {/* Actions */}
      {item.status === 'pending' && (
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={() => onApprove(item.id)} className="flex-1" variant="default">
            <CheckCircle className="h-4 w-4 mr-2" />
            Godkänn
          </Button>
          <Button onClick={() => onRequestRevision(item.id)} className="flex-1" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Begär revidering
          </Button>
          <Button onClick={() => onReject(item.id)} className="flex-1" variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            Avvisa
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Confidence Bar Component
 */
function ConfidenceBar({
  label,
  value,
  color,
  bold = false,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-700',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={bold ? 'font-semibold' : ''}>{label}</span>
        <span className={bold ? 'font-semibold' : ''}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Generate mock review queue data
 */
function generateMockReviewQueue(): ReviewQueueItem[] {
  return [
    {
      id: 'trauma-gen-001',
      type: 'question',
      content: {
        question: 'Vilken klassificering används för öppna frakturer?',
        options: ['Gartland', 'Gustilo-Anderson', 'AO', 'Weber'],
        correctAnswer: 'Gustilo-Anderson',
      },
      confidence: {
        overall: 0.96,
        sourceAccuracy: 0.98,
        medicalAccuracy: 0.95,
        pedagogicalQuality: 0.94,
        technicalValidity: 0.97,
      },
      status: 'pending',
      generatedAt: new Date(),
      issues: ['Explanation could be more detailed'],
      priority: 'high',
    },
    {
      id: 'hoeft-gen-002',
      type: 'question',
      content: {
        question: 'Vad är Lewinnek safe zone för acetabularkomponenten?',
        options: ['15-25° inclination', '30-50° inclination', '40-60° inclination', '50-70° inclination'],
        correctAnswer: '40-60° inclination',
      },
      confidence: {
        overall: 0.97,
        sourceAccuracy: 0.99,
        medicalAccuracy: 0.97,
        pedagogicalQuality: 0.95,
        technicalValidity: 0.98,
      },
      status: 'pending',
      generatedAt: new Date(),
      issues: [],
      priority: 'medium',
    },
    {
      id: 'kna-gen-003',
      type: 'clinical-case',
      content: {
        title: 'ACL-ruptur hos idrottare',
        scenario: '25-årig fotbollsspelare med smärta och svullnad...',
      },
      confidence: {
        overall: 0.92,
        sourceAccuracy: 0.95,
        medicalAccuracy: 0.90,
        pedagogicalQuality: 0.91,
        technicalValidity: 0.93,
      },
      status: 'pending',
      generatedAt: new Date(),
      issues: ['Source recency needs verification', 'Clinical scenario could be more detailed'],
      priority: 'medium',
    },
  ];
}
